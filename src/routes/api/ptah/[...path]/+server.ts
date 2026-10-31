import type { RequestHandler } from './$types';

// Same-origin proxy for Ptah's public API. Ptah's API sends no browser
// CORS headers, so the page calls /api/ptah/* here and this endpoint
// forwards to https://ptah.trade/api/poa/*.
// No keys, no wallet, no signing, no database. Nothing about a visitor
// is stored. Only the submissions POST is a write, and it only forwards
// what the visitor typed (token_id + post URL).
//
// Caching: successful GETs are cached for 15 minutes (900 seconds) at
// the edge (Cloudflare Cache API, with an in-memory fallback), keyed by
// the exact lookup. Errors are never cached. POSTs are never cached.
// A GET with ?fresh=1 bypasses the cache read, then refreshes it.
// That is what the page uses for its re-check after a submission, so a
// successful submit shows as entered immediately instead of waiting
// out the cache.
//
// Abuse protection:
// - Allowlist only: GET agents/<digits>, GET agents?owner=<0x address>,
//   GET periods, and POST submissions. Everything else is rejected.
// - Agent numbers are digits only. Submission URLs must be on x.com,
//   twitter.com or binance.com, at most 2048 characters, and the body
//   at most 2048 bytes with only token_id and url fields.
// - Idempotency-Key must be a UUID, or the submission is rejected.
// - Rate limits per visitor IP: 30 checks per minute, 5 submissions
//   per hour per IP and per Agent number. Over the limit is a 429.
// - Before forwarding a submission, the proxy re-checks the card
//   fresh. If it is already entered, nothing is sent to Ptah.
// - Upstream calls time out after 10 seconds and are size capped.

const CACHE_TTL_MS = 15 * 60 * 1000;
const ALLOWED_HOSTS = new Set([
	'x.com',
	'www.x.com',
	'twitter.com',
	'www.twitter.com',
	'binance.com',
	'www.binance.com'
]);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DIGITS_RE = /^\d{1,12}$/;
const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

const CORS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, Idempotency-Key'
};

type Bucket = Map<string, number[]>;
const checkBuckets: Bucket = new Map();
const submitIpBuckets: Bucket = new Map();
const submitTokenBuckets: Bucket = new Map();
const memoryCache = new Map<string, { expires: number; body: string; status: number }>();

function json(body: unknown, status = 200, extra: Record<string, string> = {}) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { ...CORS, 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extra }
	});
}

function envelope(code: number, message: string) {
	return json({ code, message: { text: message }, data: null }, code >= 400 ? code : 200);
}

function clientIp(request: Request): string {
	return (
		request.headers.get('cf-connecting-ip') ||
		(request.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
		'unknown'
	);
}

function hitLimit(buckets: Bucket, key: string, limit: number, windowMs: number): boolean {
	const now = Date.now();
	const list = (buckets.get(key) || []).filter((t) => now - t < windowMs);
	if (list.length >= limit) {
		buckets.set(key, list);
		return true;
	}
	list.push(now);
	buckets.set(key, list);
	return false;
}

async function upstream(path: string, search: string, method: string, body?: string, idem?: string | null) {
	const target = 'https://ptah.trade/api/poa/' + path + search;
	const headers: Record<string, string> = { Accept: 'application/json' };
	if (method === 'POST') headers['Content-Type'] = 'application/json';
	if (idem) headers['Idempotency-Key'] = idem;
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), 10_000);
	try {
		const res = await fetch(target, { method, headers, body, signal: controller.signal });
		const text = await res.text();
		if (text.length > 2_000_000) throw new Error('Upstream response too large');
		return { status: res.status, text };
	} finally {
		clearTimeout(timer);
	}
}

function cacheKeyFor(_request: Request, path: string, search: string): string {
	// A fixed absolute URL is used as the cache key, not the request's
	// own origin. The Cache API needs an absolute URL to match on, and
	// using a canonical key means a lookup cached after a submission
	// (which has no real request URL) matches a later browser lookup
	// for the same path, whatever domain the visitor used.
	return `https://ptah-cache.local/api/ptah/${path}${search}`;
}

async function cacheGet(key: string): Promise<string | null> {
	try {
		const cache = (globalThis as any).caches?.default;
		if (cache) {
			const hit = await cache.match(new Request(key));
			if (hit) return await hit.text();
		}
	} catch {}
	const entry = memoryCache.get(key);
	if (entry && Date.now() < entry.expires) return entry.body;
	if (entry) memoryCache.delete(key);
	return null;
}

async function cachePut(key: string, body: string, status: number) {
	try {
		const cache = (globalThis as any).caches?.default;
		if (cache) {
			await cache.put(
				new Request(key),
				new Response(body, {
					status,
					headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=900' }
				})
			);
			return;
		}
	} catch {}
	memoryCache.set(key, { expires: Date.now() + CACHE_TTL_MS, body, status });
}

async function handle(request: Request, params: Record<string, string | undefined>): Promise<Response> {
	if (request.method === 'OPTIONS') {
		return new Response(null, { status: 204, headers: CORS });
	}
	if (request.method !== 'GET' && request.method !== 'POST') {
		return envelope(405, 'Method not allowed');
	}

	const raw = params.path ?? '';
	const parts = raw.split('/').filter(Boolean);
	const path = parts.map(encodeURIComponent).join('/');
	const url = new URL(request.url);
	const fresh = url.searchParams.get('fresh') === '1';

	// Allowlist.
	const isAgentLookup = parts.length === 2 && parts[0] === 'agents' && DIGITS_RE.test(parts[1]);
	const isOwnerLookup =
		parts.length === 1 &&
		parts[0] === 'agents' &&
		!!url.searchParams.get('owner') &&
		ADDRESS_RE.test(url.searchParams.get('owner') || '');
	const isPeriods = parts.length === 1 && parts[0] === 'periods';
	const isSubmission = parts.length === 1 && parts[0] === 'submissions';
	if (request.method === 'GET' && !(isAgentLookup || isOwnerLookup || isPeriods)) {
		return envelope(404, 'Not found');
	}
	if (request.method === 'POST' && !isSubmission) {
		return envelope(404, 'Not found');
	}

	const ip = clientIp(request);
	if (request.method === 'GET') {
		if (hitLimit(checkBuckets, ip, 30, 60_000)) {
			return json({ code: 429, message: { text: 'Too many checks. Please wait a minute and try again.' }, data: null }, 429, { 'Retry-After': '60' });
		}
		const search = isOwnerLookup ? `?owner=${encodeURIComponent(url.searchParams.get('owner') || '')}` : '';
		const key = cacheKeyFor(request, path, search);
		if (!fresh) {
			const cached = await cacheGet(key);
			if (cached !== null) {
				return json(JSON.parse(cached), 200, { 'X-Ptah-Cache': 'HIT' });
			}
		}
		let up: { status: number; text: string };
		try {
			up = await upstream(path, search, 'GET');
		} catch {
			return envelope(502, 'Ptah is not responding right now. Please try again in a moment.');
		}
		let parsed: any;
		try {
			parsed = JSON.parse(up.text);
		} catch {
			return envelope(502, 'Ptah returned an unexpected response.');
		}
		if (up.status === 200 && parsed?.code === 200) {
			await cachePut(key, up.text, 200);
		}
		return json(parsed, up.status, { 'X-Ptah-Cache': 'MISS' });
	}

	// POST submissions.
	if (hitLimit(submitIpBuckets, ip, 5, 3_600_000)) {
		return json({ code: 429, message: { text: 'Too many submissions. Please wait and try again later.' }, data: null }, 429, { 'Retry-After': '3600' });
	}
	const idem = request.headers.get('Idempotency-Key');
	if (!idem || !UUID_RE.test(idem)) {
		return envelope(400, 'A valid UUID Idempotency-Key header is required.');
	}
	const rawBody = await request.text();
	if (rawBody.length > 2048) {
		return envelope(413, 'Submission is too large.');
	}
	let body: any;
	try {
		body = JSON.parse(rawBody);
	} catch {
		return envelope(400, 'Submission body must be valid JSON.');
	}
	const keys = Object.keys(body || {});
	if (keys.length !== 2 || !keys.includes('token_id') || !keys.includes('url')) {
		return envelope(400, 'Submission must contain only token_id and url.');
	}
	const tokenId = String(body.token_id ?? '');
	const postUrl = String(body.url ?? '');
	if (!DIGITS_RE.test(tokenId)) {
		return envelope(400, 'token_id must be digits only.');
	}
	if (postUrl.length > 2048) {
		return envelope(413, 'Post URL is too long.');
	}
	let host = '';
	try {
		host = new URL(postUrl).hostname.toLowerCase();
	} catch {
		return envelope(400, 'Post URL is not valid.');
	}
	if (!ALLOWED_HOSTS.has(host)) {
		return envelope(400, 'Post URL must be an X or Binance Square post.');
	}
	if (hitLimit(submitTokenBuckets, tokenId, 5, 3_600_000)) {
		return json({ code: 429, message: { text: 'Too many submissions for this Agent number.' }, data: null }, 429, { 'Retry-After': '3600' });
	}

	// Duplicate protection: fresh re-check first, forward nothing if entered.
	try {
		const check = await upstream(`agents/${tokenId}`, '', 'GET');
		const parsed = JSON.parse(check.text);
		if (check.status === 200 && parsed?.data?.agent?.current?.entered) {
			return json(
				{
					code: 200,
					message: null,
					data: { status: 'already_entered', period: parsed.data.agent.current.period, agent: parsed.data.agent }
				},
				200
			);
		}
	} catch {
		// If the pre-check itself fails, do not guess: report it rather
		// than forwarding a submission blind.
		return envelope(502, 'Could not verify the current entry before submitting. Please try again in a moment.');
	}

	let up: { status: number; text: string };
	try {
		up = await upstream('submissions', '', 'POST', JSON.stringify({ token_id: tokenId, url: postUrl }), idem);
	} catch {
		return envelope(502, 'Ptah is not responding right now. Please try again in a moment.');
	}
	let parsed: any;
	try {
		parsed = JSON.parse(up.text);
	} catch {
		return envelope(502, 'Ptah returned an unexpected response.');
	}
	if (up.status === 200 && parsed?.code === 200) {
		// Refresh the cached lookup so the next check is fresh.
		try {
			const freshCheck = await upstream(`agents/${tokenId}`, '', 'GET');
			const freshParsed = JSON.parse(freshCheck.text);
			if (freshCheck.status === 200 && freshParsed?.code === 200) {
				const fake = new Request(`https://local/api/ptah/agents/${tokenId}`);
				await cachePut(cacheKeyFor(fake, `agents/${tokenId}`, ''), freshCheck.text, 200);
			}
		} catch {}
	}
	return json(parsed, up.status);
}

export const GET: RequestHandler = ({ request, params }) => handle(request, params);
export const POST: RequestHandler = ({ request, params }) => handle(request, params);
export const OPTIONS: RequestHandler = ({ request, params }) => handle(request, params);
