import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

// -----------------------------------------------------------------------------
// AlignedLayer Airdrop Eligibility API
// Reverse-engineered from https://airdrop.alignedlayer.com/claim
// -----------------------------------------------------------------------------

const ALIGNED_BASE_URL = 'https://airdrop.alignedlayer.com';
const CLAIM_CONTRACT = '0xBfc06549532E6119C4Bc0EFf167290EfdCA33fa6';

// Public RPC endpoints (multiple fallbacks — Cloudflare edge can hit rate limits)
const ETH_RPC_URLS = [
  'https://ethereum-rpc.publicnode.com',
  'https://eth.llamarpc.com',
  'https://rpc.ankr.com/eth',
  'https://cloudflare-eth.com',
];

const BASE_RPC_URLS = [
  'https://base-rpc.publicnode.com',
  'https://base.llamarpc.com',
  'https://rpc.ankr.com/base',
  'https://mainnet.base.org',
  'https://base.drpc.org',
];

// Function selectors
const SELECTORS = {
  claimMerkleRoot: '0x9c4dab52',
  limitTimestampToClaim: '0xe53f0467',
  paused: '0x5c975abb',
};

interface ChainState {
  merkleRoot: string;
  deadline: number;
  deadlineIso: string;
  paused: boolean;
  error?: string;
}

interface Allocation {
  amount: string;
  amountHuman: string;
  validFrom: number | null;
  merkleProof: string[];
}

interface AddressResult {
  address: string;
  status:
    | 'eligible'
    | 'likely-eligible'
    | 'not-eligible'
    | 'ambiguous'
    | 'past-deadline'
    | 'error';
  network: 'ethereum' | 'base' | null;
  walletHttpStatus: number;
  allocation: Allocation[] | null;
  totalAmount: string;
  message: string;
  elapsedMs: number;
}

const USER_AGENT =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function tsToIso(ts: number): string {
  if (!ts) return '-';
  return new Date(ts * 1000).toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
}

function normalizeAddress(a: string): string | null {
  let addr = a.trim();
  if (!addr) return null;
  if (!addr.startsWith('0x')) addr = '0x' + addr;
  if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) return null;
  return addr;
}

function formatAlign(raw: bigint): string {
  const whole = raw / 10n ** 18n;
  const frac = raw % 10n ** 18n;
  if (frac === 0n) return whole.toLocaleString('en-US');
  const fracStr = frac.toString().padStart(18, '0').slice(0, 4).replace(/0+$/, '');
  return `${whole.toLocaleString('en-US')}.${fracStr}`;
}

async function alignedFetch(path: string): Promise<{ status: number; body: any }> {
  const url = `${ALIGNED_BASE_URL}${path}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const resp = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/json',
        Referer: `${ALIGNED_BASE_URL}/claim`,
      },
      signal: controller.signal,
    });
    const bodyText = await resp.text();
    let body: any;
    try {
      body = JSON.parse(bodyText);
    } catch {
      body = { _raw: bodyText };
    }
    return { status: resp.status, body };
  } catch (err: any) {
    return { status: 0, body: { error: err?.message ?? 'fetch failed' } };
  } finally {
    clearTimeout(timeout);
  }
}

async function rpcCall(url: string, to: string, data: string): Promise<string | null> {
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{ to, data }, 'latest'],
        id: 1,
      }),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const json = await resp.json();
    return json?.result ?? null;
  } catch {
    return null;
  }
}

async function callWithFallback(
  urls: string[],
  to: string,
  data: string
): Promise<string | null> {
  for (const url of urls) {
    const result = await rpcCall(url, to, data);
    if (result && result !== '0x') return result;
  }
  return null;
}

async function getChainState(urls: string[]): Promise<ChainState> {
  try {
    const [merkleRootRes, deadlineRes, pausedRes] = await Promise.all([
      callWithFallback(urls, CLAIM_CONTRACT, SELECTORS.claimMerkleRoot),
      callWithFallback(urls, CLAIM_CONTRACT, SELECTORS.limitTimestampToClaim),
      callWithFallback(urls, CLAIM_CONTRACT, SELECTORS.paused),
    ]);

    const merkleRoot = merkleRootRes ?? '0x0';
    const deadline = BigInt(deadlineRes ?? '0x0');
    const paused = BigInt(pausedRes ?? '0x0') === 1n;

    return {
      merkleRoot,
      deadline: Number(deadline),
      deadlineIso: tsToIso(Number(deadline)),
      paused,
    };
  } catch (e: any) {
    return {
      merkleRoot: '0x0',
      deadline: 0,
      deadlineIso: 'error',
      paused: false,
      error: String(e?.message ?? e),
    };
  }
}

async function probeAddress(address: string): Promise<AddressResult> {
  const t0 = Date.now();

  // 1) /network - passive signal (no ToS required)
  const networkResp = await alignedFetch(`/api/wallets/${address}/network`);
  const network: 'ethereum' | 'base' | null =
    networkResp.status === 200 ? (networkResp.body?.network as any) ?? null : null;

  // 2) /wallets/<addr> - try to get allocation data
  const walletResp = await alignedFetch(`/api/wallets/${address}`);

  let status: AddressResult['status'] = 'ambiguous';
  let allocation: Allocation[] | null = null;
  let totalRaw = 0n;
  let message = '';

  if (walletResp.status === 200 && Array.isArray(walletResp.body?.wallets)) {
    // ToS was signed → full allocation data
    const wallets = walletResp.body.wallets as Array<{
      amount: string;
      valid_from?: string | number;
      merkle_proof: string;
    }>;

    allocation = [];
    for (const w of wallets) {
      const amountRaw = BigInt(w.amount);
      const validFromNum =
        typeof w.valid_from === 'string'
          ? parseInt(w.valid_from, 10)
          : (w.valid_from ?? null);
      const proofs = (w.merkle_proof || '')
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);

      allocation.push({
        amount: w.amount,
        amountHuman: formatAlign(amountRaw),
        validFrom: validFromNum,
        merkleProof: proofs,
      });
      totalRaw += amountRaw;
    }

    status = 'eligible';
    message = `Eligible — ${allocation.length} allocation(s) revealed.`;
  } else if (walletResp.status === 404) {
    status = 'not-eligible';
    message = `Address not in airdrop snapshot — not eligible.`;
  } else if (walletResp.status === 410) {
    status = 'past-deadline';
    message = `Eligible but past claim deadline (${
      walletResp.body?.claim_time_limit
        ? tsToIso(Number(walletResp.body.claim_time_limit))
        : 'unknown'
    }).`;
  } else if (walletResp.status === 403) {
    if (network === 'base') {
      status = 'likely-eligible';
      message = `Likely eligible on Base (network=base is a non-default response). Sign ToS at the official claim site to reveal allocation.`;
    } else if (network === 'ethereum') {
      status = 'ambiguous';
      message = `Default network response — could be eligible on Ethereum OR not in snapshot. Sign ToS at the official claim site to confirm.`;
    } else {
      status = 'ambiguous';
      message = `Could not determine eligibility.`;
    }
  } else {
    status = 'error';
    message = `Unexpected response: ${walletResp.status}`;
  }

  return {
    address,
    status,
    network,
    walletHttpStatus: walletResp.status,
    allocation,
    totalAmount: formatAlign(totalRaw),
    message,
    elapsedMs: Date.now() - t0,
  };
}

export const POST: RequestHandler = async ({ request }) => {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const rawInput: unknown = body?.addresses;
  let rawAddresses: string[] = [];

  if (Array.isArray(rawInput)) {
    rawAddresses = rawInput.map(String);
  } else if (typeof rawInput === 'string') {
    rawAddresses = rawInput.split(/[\n,\s]+/).filter(Boolean);
  } else {
    return json(
      { error: 'addresses must be an array or newline/comma separated string' },
      { status: 400 }
    );
  }

  if (rawAddresses.length === 0) {
    return json({ error: 'No addresses provided' }, { status: 400 });
  }

  if (rawAddresses.length > 200) {
    return json(
      { error: 'Too many addresses — maximum 200 per request' },
      { status: 413 }
    );
  }

  // Normalize + dedupe
  const seen = new Set<string>();
  const valid: string[] = [];
  const invalid: string[] = [];
  for (const raw of rawAddresses) {
    const norm = normalizeAddress(raw);
    if (!norm) {
      invalid.push(raw);
      continue;
    }
    const lower = norm.toLowerCase();
    if (seen.has(lower)) continue;
    seen.add(lower);
    valid.push(norm);
  }

  // Fetch chain state in parallel
  const [ethState, baseState] = await Promise.all([
    getChainState(ETH_RPC_URLS),
    getChainState(BASE_RPC_URLS),
  ]);

  // Probe addresses with limited concurrency
  const CONCURRENCY = 5;
  const results: AddressResult[] = [];
  const queue = [...valid];

  async function worker() {
    while (queue.length > 0) {
      const addr = queue.shift()!;
      try {
        const r = await probeAddress(addr);
        results.push(r);
      } catch (err: any) {
        results.push({
          address: addr,
          status: 'error',
          network: null,
          walletHttpStatus: 0,
          allocation: null,
          totalAmount: '0',
          message: String(err?.message ?? err),
          elapsedMs: 0,
        });
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, valid.length) }, () => worker())
  );

  // Sort in original order
  const orderIndex = new Map(valid.map((a, i) => [a, i]));
  results.sort(
    (a, b) => (orderIndex.get(a.address) ?? 0) - (orderIndex.get(b.address) ?? 0)
  );

  // Aggregate stats
  let totalAlignRaw = 0n;
  for (const r of results) {
    if (r.status === 'eligible' && r.allocation) {
      for (const a of r.allocation) {
        totalAlignRaw += BigInt(a.amount);
      }
    }
  }

  return json({
    generatedAt: new Date().toISOString(),
    contract: {
      address: CLAIM_CONTRACT,
      ethereum: ethState,
      base: baseState,
    },
    stats: {
      total: valid.length,
      eligible: results.filter((r) => r.status === 'eligible').length,
      likelyEligible: results.filter((r) => r.status === 'likely-eligible').length,
      notEligible: results.filter((r) => r.status === 'not-eligible').length,
      ambiguous: results.filter((r) => r.status === 'ambiguous').length,
      pastDeadline: results.filter((r) => r.status === 'past-deadline').length,
      errors: results.filter((r) => r.status === 'error').length,
      totalAlignEligibleFormatted: formatAlign(totalAlignRaw),
    },
    invalidAddresses: invalid,
    results,
  });
};

export const GET: RequestHandler = async () => {
  return json({
    name: 'AlignedLayer Airdrop Eligibility Checker API',
    usage: 'POST { addresses: string[] | string } to this endpoint',
    contract: CLAIM_CONTRACT,
    note: 'Passive probe — does NOT sign the Terms-of-Service. Addresses whose ToS was previously signed will return full allocation data.',
  });
};
