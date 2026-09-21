import type { AddressDetails, Transaction, TokenTransfer, TokenBalance, NFTItem, AllToken, ChainConfig } from '$lib/types';

const API_TIMEOUT = 10000;
const PAGINATED_TIMEOUT = 12000;
/**
 * Wall-clock budget for the background pagination stage of a progressive load.
 * Comfortably above the time the page caps need (50 transaction pages, 30
 * token-transfer pages), so the caps — not the clock — end a heavy wallet's stream.
 */
const STREAM_BUDGET_MS = 180000;
/** A progressive caller gets an onPartial() update after this many streamed pages. */
const PARTIAL_PAGE_INTERVAL = 5;
/** Consecutive failures on one paginated endpoint before we stop asking it for more. */
const MAX_CONSECUTIVE_FAILURES = 3;
/** Backoff between retries of a failed page. */
const RETRY_BACKOFF_MS = 250;

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
 * a timeout rejects with a DOMException named AbortError. The distinction matters:
 * only transport-level failures (not slow-but-reachable APIs) justify the proxy fallback.
 */
function classifyError(err: unknown): FailureKind {
  return (err as { name?: string } | null)?.name === 'AbortError' ? 'timeout' : 'network';
}

interface PageResult {
  items: any[];
  next: Record<string, string> | null;
  failure?: FailureKind;
}

/**
 * URL builder for one wallet's data, either against the explorer (browser â†’ explorer
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

/** One paginated request. Returns the failure kind instead of throwing. */
async function fetchPage(url: string): Promise<PageResult> {
  try {
    const res = await fetchWithTimeout(url, PAGINATED_TIMEOUT);
    if (!res.ok) return { items: [], next: null, failure: 'http' };
    const data = await res.json();
    return { items: data?.items || [], next: data?.next_page_params || null };
  } catch (err) {
    return { items: [], next: null, failure: classifyError(err) };
  }
}

interface JsonResult {
  data?: any;
  failure?: FailureKind;
}

/** One non-paginated request (address details, balances, tokens, nft). */
async function fetchJson(url: string): Promise<JsonResult> {
  try {
    const res = await fetchWithTimeout(url);
    if (!res.ok) return { failure: 'http' };
    return { data: await res.json() };
  } catch (err) {
    return { failure: classifyError(err) };
  }
}

function withParams(url: string, params: Record<string, string> | null): string {
  if (!params) return url;
  const qs = new URLSearchParams(params).toString();
  return qs ? `${url}?${qs}` : url;
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

/**
 * Walk the rest of a cursor-paginated endpoint, page by page. Stopping conditions:
 * page cap reached, the wall-clock budget elapsed, the endpoint ran out of pages, or
 * it failed MAX_CONSECUTIVE_FAILURES times in a row (then we abandon just that endpoint).
 * Everything already collected stays in `state.items`.
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
      await new Promise(resolve => setTimeout(resolve, RETRY_BACKOFF_MS * consecutiveFailures));
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
  const transport = buildTransport(false, config, address);
  const state = seedStream(await fetchPage(transport.url(endpoint)));
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

/** Everything stage 1 collects, plus whether the tranport itself is usable. */
interface Stage1Result {
  addressDetails: AddressDetails | null;
  tokenBalances: TokenBalance[];
  allTokens: AllToken[];
  nfts: NFTItem[];
  transactions: PageResult;
  tokenTransfers: PageResult;
  /** Number of the six requests that produced a usable body. */
  successes: number;
  failures: FailureKind[];
}

/**
 * The fast-paint stage: address details, balances, tokens, NFTs and page 1 of both
 * paginated endpoints â€” six requests in one parallel batch.
 */
async function loadStage1(transport: Transport, address: string): Promise<Stage1Result> {
  const [details, balances, tokens, nft, transactions, tokenTransfers] = await Promise.all([
    fetchJson(transport.url('')),
    fetchJson(transport.url('/token-balances')),
    fetchJson(transport.url('/tokens')),
    fetchJson(transport.url('/nft')),
    fetchPage(transport.url('/transactions')),
    fetchPage(transport.url('/token-transfers')),
  ]);

  const failures: FailureKind[] = [];
  const collect = <T>(result: JsonResult, pick: (data: any) => T, fallback: T): T => {
    if (result.failure) {
      failures.push(result.failure);
      return fallback;
    }
    return pick(result.data);
  };

  const addressDetails = collect<AddressDetails | null>(details, data => data ?? null, null);
  const tokenBalances = collect<TokenBalance[]>(balances, data => (Array.isArray(data) ? data : data?.items || []), []);
  const allTokens = collect<AllToken[]>(tokens, data => data?.items || [], []);
  const nfts = collect<NFTItem[]>(nft, data => data?.items || [], []);

  if (transactions.failure) failures.push(transactions.failure);
  if (tokenTransfers.failure) failures.push(tokenTransfers.failure);

  return {
    addressDetails,
    tokenBalances,
    allTokens,
    nfts,
    transactions,
    tokenTransfers,
    successes: 6 - failures.length,
    failures,
  };
}

/**
 * Fetch all wallet data from a Blockscout-compatible API.
 *
 * Progressive mode (when `onPartial` is passed):
 * 1. Stage 1 fires six requests in parallel â€” address details, token balances, tokens,
 *    NFTs and page 1 of transactions + token transfers. `onPartial` is called as soon
 *    as they land, so the wallet screen can paint while history keeps streaming.
 * 2. Stage 2 continues both cursor chains concurrently in the background, reporting
 *    progress every ~5 pages and once more at the end with `partial: false`.
 *
 * Requests go straight from the browser to the explorer. If the whole stage-1 batch
 * fails at the transport level (CORS/offline), everything is retried through the
 * same-origin proxy routes and the result is flagged `viaProxy: true`.
 */
export async function fetchBlockscoutData(
  address: string,
  config: ChainConfig,
  onPartial?: (result: BlockscoutFetchResult) => void | Promise<void>
): Promise<BlockscoutFetchResult> {
  const direct = buildTransport(false, config, address);
  let transport = direct;
  let stage1 = await loadStage1(direct, address);

  // Nothing from the explorer reached the browser: that is the CORS/network case the
  // proxy exists for. A batch that merely failed on HTTP status keeps the direct path
  // so we report the explorer's own error instead of masking it.
  if (!direct.viaProxy && stage1.successes === 0 && stage1.failures.includes('network')) {
    console.warn(
      `[api] ${config.apiBase} is not reachable from the browser â€” retrying ${config.id} through the same-origin proxy`
    );
    const proxied = buildTransport(true, config, address);
    const retry = await loadStage1(proxied, address);
    if (retry.successes > 0) {
      transport = proxied;
      stage1 = retry;
    }
  }

  if (!stage1.addressDetails) {
    if (stage1.failures.includes('timeout')) {
      throw new Error(`Request timed out. The ${config.name} API is taking too long to respond. Please try again.`);
    }
    throw new Error(`Failed to fetch wallet data from ${config.name}. The API may be temporarily unavailable.`);
  }

  const viaProxy = transport.viaProxy;
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
      continueStream('/transactions', transactionsState, 50, transport, 0, () => {}),
      continueStream('/token-transfers', tokenTransfersState, 30, transport, 0, () => {}),
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
    continueStream('/transactions', transactionsState, 50, transport, deadline, onPage),
    continueStream('/token-transfers', tokenTransfersState, 30, transport, deadline, onPage),
  ]);

  await report(false);
  return snapshot(false);
}
