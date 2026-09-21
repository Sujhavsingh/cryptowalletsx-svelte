import type { AddressDetails, Transaction, TokenTransfer, TokenBalance, NFTItem, AllToken, ChainConfig } from '$lib/types';

/**
 * Per-request wall clock. The explorers this site talks to are slow under load
 * (explorer.arc.io has been measured at 5.5-7.4 s for a single address lookup), and a
 * six request batch slows each one down further, so the ceiling has to leave room for
 * a genuinely slow-but-working explorer.
 */
const API_TIMEOUT = 25000;
const PAGINATED_TIMEOUT = 20000;
/**
 * Wall-clock budget for the background pagination stage of a progressive load.
 * Comfortably above the time the page caps need (50 transaction pages, 30
 * token-transfer pages), so the caps - not the clock - end a heavy wallet's stream.
 */
const STREAM_BUDGET_MS = 180000;
/** A progressive caller gets an onPartial() update after this many streamed pages. */
const PARTIAL_PAGE_INTERVAL = 5;
/** Consecutive failures on one paginated endpoint before we stop asking it for more. */
const MAX_CONSECUTIVE_FAILURES = 3;
/** Backoff between retries of a failed page. */
const RETRY_BACKOFF_MS = 250;

/**
 * Retry ladder for a stage-1 request: ~400 ms, then ~1200 ms between attempts.
 * A slow explorer usually answers a retry, so the ladder is what turns one lost
 * request into a served one.
 */
const STAGE1_BACKOFF_MS = [400, 1200];
/** Tries per stage-1 request on one transport (the first attempt plus two retries). */
const STAGE1_ATTEMPTS = 3;
/** Tries through the same-origin proxy, which is a fresh start rather than a continuation. */
const PROXY_ATTEMPTS = 2;
/**
 * Pause before re-asking after a 429. Retrying inside a rate-limit window just
 * deepens it, so a rate-limited response waits noticeably longer than a dropped one.
 */
const RATE_LIMIT_PAUSE_MS = 1500;
/** An attempt is only started while this much budget is left, so no truncated retries. */
const MIN_ATTEMPT_MS = 5000;
/**
 * Whole-ladder budget for stage 1. Stage 1 is the paint gate, so it is bounded as a
 * batch: without this a host that accepts connections but never answers would burn
 * 3 x API_TIMEOUT before the same-origin fallback could even begin.
 */
const STAGE1_BUDGET_MS = 32000;
/** Budget for the proxy ladder. The proxy is our own origin, so it is worth less waiting. */
const PROXY_BUDGET_MS = 15000;

/**
 * Fetch with timeout to prevent infinite loading states.
 */
export function fetchWithTimeout(url: string, timeoutMs = API_TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(id));
}

type FailureKind = 'network' | 'timeout' | 'http';

/**
 * A browser fetch blocked by CORS or a dropped connection rejects with a TypeError,
 * a timeout rejects with a DOMException named AbortError. The distinction only decides
 * how a failure is reported now: both kinds are retried and both fall back to the proxy.
 */
function classifyError(err: unknown): FailureKind {
  return (err as { name?: string } | null)?.name === 'AbortError' ? 'timeout' : 'network';
}

/** One request attempt. Either it produced a value, or it says how it failed. */
interface Attempt<T> {
  value?: T;
  failure?: FailureKind;
  /** HTTP status of a failed attempt, so callers can tell a 429 from a 404. */
  status?: number;
}

interface RequestOutcome<T> {
  result: Attempt<T>;
  /** True when the body came from our same-origin proxy rather than the explorer. */
  viaProxy: boolean;
}

interface PageBody {
  items: any[];
  next: Record<string, string> | null;
}

interface PageResult {
  items: any[];
  next: Record<string, string> | null;
  failure?: FailureKind;
  status?: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Worth another attempt: the transport never completed (network/timeout) or the
 * explorer pushed back (429) or broke (5xx). A 400 or 404 is the explorer's final
 * answer and is returned straight away.
 */
function isTransient(result: Attempt<unknown>): boolean {
  if (result.failure === 'network' || result.failure === 'timeout') return true;
  if (result.failure !== 'http') return false;
  return result.status === 429 || (result.status ?? 0) >= 500;
}

/** Pause before attempt number `index + 1` of a ladder. */
function pauseBefore(result: Attempt<unknown>, index: number): number {
  if (result.status === 429) return RATE_LIMIT_PAUSE_MS * index;
  return STAGE1_BACKOFF_MS[Math.min(index, STAGE1_BACKOFF_MS.length) - 1];
}

const parseJson = (res: Response): Promise<any> => res.json();

const parsePage = async (res: Response): Promise<PageBody> => {
  const data = await res.json();
  return { items: data?.items || [], next: data?.next_page_params || null };
};

/** One request attempt against one URL. Never throws. */
async function attempt<T>(
  url: string,
  timeoutMs: number,
  parse: (res: Response) => Promise<T>
): Promise<Attempt<T>> {
  try {
    const res = await fetchWithTimeout(url, timeoutMs);
    if (!res.ok) return { failure: 'http', status: res.status };
    return { value: await parse(res) };
  } catch (err) {
    return { failure: classifyError(err) };
  }
}

/**
 * One URL, up to `attempts` tries, spaced by the retry ladder and bounded by `deadline`.
 * Each attempt may use at most the remaining budget, and an attempt is only started
 * when enough is left to be meaningful.
 */
async function ladder<T>(
  url: string,
  timeoutMs: number,
  parse: (res: Response) => Promise<T>,
  attempts: number,
  deadline: number
): Promise<Attempt<T>> {
  let result: Attempt<T> = { failure: 'timeout' };

  for (let i = 0; i < attempts; i++) {
    if (i > 0) {
      const pause = pauseBefore(result, i);
      if (Date.now() + pause + MIN_ATTEMPT_MS > deadline) break;
      await sleep(pause);
    }
    const budget = deadline - Date.now();
    if (budget < MIN_ATTEMPT_MS) break;

    result = await attempt(url, Math.min(timeoutMs, budget), parse);
    if (!result.failure || !isTransient(result)) return result;
  }

  return result;
}

/**
 * URL builder for one wallet's data, either against the explorer (browser -> explorer
 * directly, used whenever the chain sends CORS headers) or against our own
 * same-origin proxy routes (`/{chainId}/api/address/{address}...`).
 */
interface Transport {
  viaProxy: boolean;
  url: (endpoint: string) => string;
}

function buildTransport(forceProxy: boolean, config: ChainConfig, address: string): Transport {
  const viaProxy = forceProxy || config.corsEnabled === false;
  return {
    viaProxy,
    url: (endpoint: string) =>
      viaProxy
        ? `/${config.id}/api/address/${address}${endpoint}`
        : `${config.apiBase}/addresses/${address}${endpoint}`,
  };
}

interface Transports {
  direct: Transport;
  /** The same-origin proxy, or null when `direct` already is the proxy. */
  proxy: Transport | null;
}

function buildTransports(config: ChainConfig, address: string): Transports {
  const direct = buildTransport(false, config, address);
  return { direct, proxy: direct.viaProxy ? null : buildTransport(true, config, address) };
}

/** The transport a stage-2 stream should use, given what stage 1 had to do. */
function streamTransport(stage1: Stage1Result, transports: Transports): Transport {
  if (!transports.proxy) return transports.direct;
  const preferProxy = stage1.essentialViaProxy || stage1.proxied > stage1.direct;
  return preferProxy ? transports.proxy : transports.direct;
}

/**
 * One stage-1 request: the explorer first, then - on any failure kind - the same-origin
 * proxy.
 *
 * The fallback deliberately covers every failure, not just transport ones. A CORS
 * block, a dropped connection, a timeout, a 403 and a 429 all mean the same thing from
 * the wallet screen's point of view: this browser could not get the data. Our own
 * origin has no CORS wall, no browser timer and a different IP, so it is worth one
 * bounded try before the page reports a failure. The direct path stays primary, since
 * it costs the visitor nothing and keeps explorer traffic off our own worker.
 */
async function requestResilient<T>(
  endpoint: string,
  parse: (res: Response) => Promise<T>,
  timeoutMs: number,
  transports: Transports
): Promise<RequestOutcome<T>> {
  const direct = await ladder(
    transports.direct.url(endpoint),
    timeoutMs,
    parse,
    STAGE1_ATTEMPTS,
    Date.now() + STAGE1_BUDGET_MS
  );
  if (!direct.failure) return { result: direct, viaProxy: false };
  if (!transports.proxy) return { result: direct, viaProxy: false };

  const proxied = await ladder(
    transports.proxy.url(endpoint),
    timeoutMs,
    parse,
    PROXY_ATTEMPTS,
    Date.now() + PROXY_BUDGET_MS
  );
  if (!proxied.failure) return { result: proxied, viaProxy: true };

  // Both paths are out: report the explorer's own failure, which is the informative one.
  return { result: direct, viaProxy: false };
}

/** Cursor state of one paginated endpoint, seeded with the page 1 loaded in stage 1. */
interface StreamState {
  items: any[];
  /** Pages already loaded, page 1 included. */
  pages: number;
  next: Record<string, string> | null;
  stopped: boolean;
}

function seedStream(page: PageResult): StreamState {
  return {
    items: [...page.items],
    pages: 1,
    next: page.next,
    stopped: Boolean(page.failure) || page.items.length === 0,
  };
}

/** One paginated request. Returns the failure kind instead of throwing. */
async function fetchPage(url: string): Promise<PageResult> {
  const result = await attempt(url, PAGINATED_TIMEOUT, parsePage);
  if (result.failure) return { items: [], next: null, failure: result.failure, status: result.status };
  return { items: result.value?.items ?? [], next: result.value?.next ?? null };
}

function withParams(url: string, params: Record<string, string> | null): string {
  if (!params) return url;
  const qs = new URLSearchParams(params).toString();
  return qs ? `${url}?${qs}` : url;
}

/**
 * Walk the rest of a cursor-paginated endpoint, page by page. Stopping conditions:
 * page cap reached, the wall-clock budget elapsed, the endpoint ran out of pages, or
 * it failed MAX_CONSECUTIVE_FAILURES times in a row (then we abandon just that
 * endpoint). Everything already collected stays in `state.items`.
 */
async function continueStream(
  endpoint: string,
  state: StreamState,
  maxPages: number,
  transport: Transport,
  deadline: number,
  onPage: () => void
): Promise<void> {
  let consecutiveFailures = 0;

  while (!state.stopped && state.next && state.pages < maxPages) {
    if (deadline > 0 && Date.now() > deadline) {
      state.stopped = true;
      break;
    }

    const result = await fetchPage(withParams(transport.url(endpoint), state.next));

    if (result.failure) {
      consecutiveFailures++;
      if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
        state.stopped = true;
        break;
      }
      // A rate-limited explorer is being asked to slow down, so back off further.
      const pause = result.status === 429 ? RATE_LIMIT_PAUSE_MS * consecutiveFailures : RETRY_BACKOFF_MS * consecutiveFailures;
      await sleep(pause);
      continue;
    }

    consecutiveFailures = 0;
    state.items.push(...result.items);
    state.pages++;
    state.next = result.next;
    onPage();
    if (result.items.length === 0) {
      state.stopped = true;
      break;
    }
  }
}

/**
 * Fetch ALL pages from a paginated Blockscout API endpoint.
 * Blockscout v2 uses cursor-based pagination (next_page_params), so pages must be
 * fetched sequentially.
 */
export async function fetchPaginated(
  endpoint: string,
  config: ChainConfig,
  address: string,
  maxPages = 50
): Promise<any[]> {
  const transports = buildTransports(config, address);
  const head = await requestResilient(endpoint, parsePage, PAGINATED_TIMEOUT, transports);
  const state = seedStream(
    head.result.failure
      ? { items: [], next: null, failure: head.result.failure, status: head.result.status }
      : { items: head.result.value?.items ?? [], next: head.result.value?.next ?? null }
  );
  const transport = head.viaProxy && transports.proxy ? transports.proxy : transports.direct;
  await continueStream(endpoint, state, maxPages, transport, 0, () => {});
  return state.items;
}

export interface BlockscoutFetchResult {
  addressDetails: AddressDetails | null;
  transactions: Transaction[];
  tokenTransfers: TokenTransfer[];
  tokenBalances: TokenBalance[];
  nfts: NFTItem[];
  allTokens: AllToken[];
  /** True while background pagination is still streaming into the other fields. */
  partial?: boolean;
  /** True when the data came from our same-origin proxy rather than the explorer directly. */
  viaProxy?: boolean;
}

/** Everything stage 1 collects, plus what it says about each transport. */
interface Stage1Result {
  addressDetails: AddressDetails | null;
  tokenBalances: TokenBalance[];
  allTokens: AllToken[];
  nfts: NFTItem[];
  transactions: PageResult;
  tokenTransfers: PageResult;
  /** How each failed request failed, in the order the requests were recorded. */
  failures: FailureKind[];
  /** Requests the explorer served directly. */
  direct: number;
  /** Requests only the same-origin proxy could serve. */
  proxied: number;
  /** True when the essential address-details request needed the proxy. */
  essentialViaProxy: boolean;
}

/**
 * The fast-paint stage: address details, balances, tokens, NFTs and page 1 of both
 * paginated endpoints - six requests in one parallel batch, each retried and each able
 * to fall back to the proxy on its own. Only the address details are essential; a
 * missing token list or a missing first page of history still paints a usable screen.
 */
async function loadStage1(transports: Transports, address: string): Promise<Stage1Result> {
  const [details, balances, tokens, nft, transactions, tokenTransfers] = await Promise.all([
    requestResilient('', parseJson, API_TIMEOUT, transports),
    requestResilient('/token-balances', parseJson, API_TIMEOUT, transports),
    requestResilient('/tokens', parseJson, API_TIMEOUT, transports),
    requestResilient('/nft', parseJson, API_TIMEOUT, transports),
    requestResilient('/transactions', parsePage, PAGINATED_TIMEOUT, transports),
    requestResilient('/token-transfers', parsePage, PAGINATED_TIMEOUT, transports),
  ]);

  const failures: FailureKind[] = [];
  let direct = 0;
  let proxied = 0;

  /** Record one outcome and return its body, or undefined when it failed. */
  const payload = <T>(outcome: RequestOutcome<T>): T | undefined => {
    if (outcome.result.failure) {
      failures.push(outcome.result.failure);
      return undefined;
    }
    outcome.viaProxy ? proxied++ : direct++;
    return outcome.result.value;
  };

  const addressDetails = payload(details) ?? null;
  const balanceList = payload(balances);
  const tokenBalances = Array.isArray(balanceList) ? balanceList : balanceList?.items || [];
  const allTokens = payload(tokens)?.items || [];
  const nfts = payload(nft)?.items || [];

  const page = (outcome: RequestOutcome<PageBody>): PageResult => {
    if (outcome.result.failure) {
      failures.push(outcome.result.failure);
      return { items: [], next: null, failure: outcome.result.failure, status: outcome.result.status };
    }
    outcome.viaProxy ? proxied++ : direct++;
    return { items: outcome.result.value?.items ?? [], next: outcome.result.value?.next ?? null };
  };

  return {
    addressDetails,
    tokenBalances,
    allTokens,
    nfts,
    transactions: page(transactions),
    tokenTransfers: page(tokenTransfers),
    failures,
    direct,
    proxied,
    essentialViaProxy: Boolean(addressDetails) && details.viaProxy,
  };
}

/**
 * Fetch all wallet data from a Blockscout-compatible API.
 *
 * Progressive mode (when `onPartial` is passed):
 * 1. Stage 1 fires six requests in parallel - address details, token balances, tokens,
 *    NFTs and page 1 of transactions + token transfers. `onPartial` is called as soon
 *    as they land, so the wallet screen can paint while history keeps streaming.
 * 2. Stage 2 continues both cursor chains concurrently in the background, reporting
 *    progress every ~5 pages and once more at the end with `partial: false`.
 *
 * Requests go straight from the browser to the explorer and only fall back to the
 * same-origin proxy routes when a request cannot be served that way. Only the address
 * details are essential: if they fail on both paths the whole load fails, while any
 * other request that fails is simply left to stage 2, which streams its endpoint again.
 */
export async function fetchBlockscoutData(
  address: string,
  config: ChainConfig,
  onPartial?: (result: BlockscoutFetchResult) => void | Promise<void>
): Promise<BlockscoutFetchResult> {
  const transports = buildTransports(config, address);
  const stage1 = await loadStage1(transports, address);

  if (!stage1.addressDetails) {
    if (stage1.failures.includes('timeout')) {
      throw new Error(`Request timed out. The ${config.name} API is taking too long to respond. Please try again.`);
    }
    throw new Error(`Failed to fetch wallet data from ${config.name}. The API may be temporarily unavailable.`);
  }

  // Stage 2 keeps streaming over whichever transport answered stage 1.
  const stream = streamTransport(stage1, transports);
  const viaProxy = stream.viaProxy;
  const transactionsState = seedStream(stage1.transactions);
  const tokenTransfersState = seedStream(stage1.tokenTransfers);

  const snapshot = (partial: boolean): BlockscoutFetchResult => ({
    addressDetails: stage1.addressDetails,
    transactions: [...transactionsState.items],
    tokenTransfers: [...tokenTransfersState.items],
    tokenBalances: stage1.tokenBalances,
    nfts: stage1.nfts,
    allTokens: stage1.allTokens,
    partial,
    viaProxy,
  });

  if (!onPartial) {
    // Legacy callers get the same complete result as before: both streams run to the
    // page cap, with no wall-clock cut-off.
    await Promise.all([
      continueStream('/transactions', transactionsState, 50, stream, 0, () => {}),
      continueStream('/token-transfers', tokenTransfersState, 30, stream, 0, () => {}),
    ]);
    return snapshot(false);
  }

  await onPartial(snapshot(true));

  // Serialised so overlapping stream progress never interleaves two onPartial calls.
  let emitChain: Promise<void> = Promise.resolve();
  let pagesSinceEmit = 0;
  const report = (partial: boolean) => {
    emitChain = emitChain.then(() => onPartial(snapshot(partial)));
    return emitChain;
  };
  const onPage = () => {
    if (++pagesSinceEmit >= PARTIAL_PAGE_INTERVAL) {
      pagesSinceEmit = 0;
      void report(true);
    }
  };

  const deadline = Date.now() + STREAM_BUDGET_MS;
  await Promise.all([
    continueStream('/transactions', transactionsState, 50, stream, deadline, onPage),
    continueStream('/token-transfers', tokenTransfersState, 30, stream, deadline, onPage),
  ]);

  await report(false);
  return snapshot(false);
}
