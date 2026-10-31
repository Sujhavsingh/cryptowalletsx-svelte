import type { RequestHandler } from './$types';

// Same-origin proxy for Ptah's public API. Ptah's API sends no browser
// CORS headers, so the page calls /api/ptah/* here and this endpoint
// forwards to https://ptah.trade/api/poa/*.
// No keys, no wallet, no signing. Only the submissions POST is a write,
// and it only forwards what the visitor typed (token_id + post URL).
const CORS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, Idempotency-Key'
};

async function forward(request: Request, params: Record<string, string | undefined>): Promise<Response> {
	if (request.method === 'OPTIONS') {
		return new Response(null, { status: 204, headers: CORS });
	}
	const raw = params.path ?? '';
	const parts = raw.split('/').filter(Boolean);
	const upstream = 'https://ptah.trade/api/poa/' + parts.map(encodeURIComponent).join('/');
	const url = new URL(request.url);
	const target = upstream + url.search;

	const headers: Record<string, string> = { Accept: 'application/json' };
	if (request.method === 'POST') headers['Content-Type'] = 'application/json';
	const idem = request.headers.get('Idempotency-Key');
	if (idem) headers['Idempotency-Key'] = idem;

	let body: string | undefined;
	if (request.method === 'POST') body = await request.text();

	const res = await fetch(target, { method: request.method, headers, body });
	const text = await res.text();
	return new Response(text, {
		status: res.status,
		headers: { ...CORS, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
	});
}

export const GET: RequestHandler = ({ request, params }) => forward(request, params);
export const POST: RequestHandler = ({ request, params }) => forward(request, params);
export const OPTIONS: RequestHandler = ({ request, params }) => forward(request, params);
