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
  retries: number;
}

const USER_AGENT =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

// -----------------------------------------------------------------------------
// Retry-aware fetch with 429 backoff
// -----------------------------------------------------------------------------

async function alignedFetch(path: string, maxRetries = 3): Promise<{ status: number; body: any }> {
  const url = `${ALIGNED_BASE_URL}${path}`;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);
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

      // 429 Too Many Requests / 503 Service Unavailable → exponential backoff
      if (resp.status === 429 || resp.status === 503) {
        const retryAfter = resp.headers.get('retry-after');
        const delayMs = retryAfter
          ? Math.min(parseInt(retryAfter, 10) * 1000, 3000)
          : Math.min(300 * Math.pow(2, attempt) + Math.random() * 200, 2000);
        await sleep(delayMs);
        continue; // retry
      }

      clearTimeout(timeout);
      return { status: resp.status, body };
    } catch (err: any) {
      clearTimeout(timeout);
      // Network error / timeout / abort → exponential backoff + retry
      if (attempt < maxRetries - 1) {
        const delayMs = Math.min(200 * Math.pow(2, attempt) + Math.random() * 200, 1500);
        await sleep(delayMs);
        continue;
      }
      return { status: 0, body: { error: err?.message ?? 'fetch failed after retries' } };
    } finally {
      clearTimeout(timeout);
    }
  }

  // Should not reach here
  return { status: 0, body: { error: 'max retries exceeded' } };
}

// -----------------------------------------------------------------------------
// RPC helpers (with retry)
// -----------------------------------------------------------------------------

async function rpcCall(url: string, to: string, data: string): Promise<string | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{ to, data }, 'latest'],
          id: 1,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const json = await resp.json();
      const result = json?.result ?? null;
      if (result && result !== '0x') return result;
      // Sometimes RPC returns 0x0 for valid calls — try next URL
      return null;
    } catch {
      if (attempt < 2) await sleep(500 * (attempt + 1));
    }
  }
  return null;
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

// -----------------------------------------------------------------------------
// Per-address probe with retry-aware classification
// -----------------------------------------------------------------------------

async function probeAddress(address: string): Promise<AddressResult> {
  const t0 = Date.now();
  let retries = 0;

  // 1) /network - passive signal (no ToS required)
  // Retry up to 3 times for 429/503/network errors
  let networkResp = await alignedFetch(`/api/wallets/${address}/network`);
  if (networkResp.status === 0 || networkResp.status === 429 || networkResp.status === 503) {
    retries++;
  }

  const network: 'ethereum' | 'base' | null =
    networkResp.status === 200 ? (networkResp.body?.network as any) ?? null : null;

  // 2) /wallets/<addr> - try to get allocation data
  let walletResp = await alignedFetch(`/api/wallets/${address}`);
  if (walletResp.status === 0 || walletResp.status === 429 || walletResp.status === 503) {
    retries++;
  }

  let status: AddressResult['status'] = 'ambiguous';
  let allocation: Allocation[] | null = null;
  let totalRaw = 0n;
  let message = '';

  if (walletResp.status === 200 && Array.isArray(walletResp.body?.wallets)) {
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
  } else if (walletResp.status === 0) {
    // Network error even after retries — classify as ambiguous (not a definitive "not eligible")
    status = 'ambiguous';
    message = `Could not reach AlignedLayer API after retries. Please try again in a few moments — this is usually a temporary rate-limit.`;
  } else {
    status = 'ambiguous';
    message = `Unexpected response (HTTP ${walletResp.status}). Retrying may help.`;
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
    retries,
  };
}

// -----------------------------------------------------------------------------
// POST handler — batch check with rate-limit-aware concurrency
// -----------------------------------------------------------------------------

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

  // ---- Rate-limit-aware batch processing ----
  // Strategy: 4 concurrent workers + small inter-request delay + conditional retry pass
  // for any addresses that returned errors after the first pass.
  const results: AddressResult[] = [];
  const CONCURRENCY = 4;
  const INTER_REQUEST_DELAY_MS = 50; // tiny polite delay between requests

  async function processQueue(addresses: string[]): Promise<AddressResult[]> {
    const queue = [...addresses];
    const batchResults: AddressResult[] = [];

    async function worker() {
      while (queue.length > 0) {
        const addr = queue.shift()!;
        try {
          const r = await probeAddress(addr);
          batchResults.push(r);
        } catch (err: any) {
          batchResults.push({
            address: addr,
            status: 'error',
            network: null,
            walletHttpStatus: 0,
            allocation: null,
            totalAmount: '0',
            message: String(err?.message ?? err),
            elapsedMs: 0,
            retries: 0,
          });
        }
        // Be polite to the AlignedLayer API
        if (queue.length > 0) {
          await sleep(INTER_REQUEST_DELAY_MS);
        }
      }
    }

    await Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, addresses.length) }, () => worker())
    );

    return batchResults;
  }

  // First pass — process all addresses
  const firstPass = await processQueue(valid);
  results.push(...firstPass);

  // Conditional retry pass — only re-probe addresses that ended up as 'error'
  const needRetry = results
    .filter((r) => r.status === 'error')
    .map((r) => r.address);

  if (needRetry.length > 0) {
    // Short cooldown before retrying
    await sleep(800);

    const retryResults = await processQueue(needRetry);

    // Merge retry results back into the original results, preserving order
    const retryMap = new Map(retryResults.map((r) => [r.address, r]));
    for (let i = 0; i < results.length; i++) {
      const retryResult = retryMap.get(results[i].address);
      if (retryResult && retryResult.status !== 'error') {
        results[i] = { ...retryResult, retries: retryResult.retries + 1 };
      } else if (retryResult) {
        // Still failed — update the retry count
        results[i] = { ...results[i], retries: results[i].retries + 1 };
      }
    }
  }

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
