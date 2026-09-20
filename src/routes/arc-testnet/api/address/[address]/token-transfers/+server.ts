import type { RequestHandler } from './$types';
import { ARC_TESTNET_CONFIG } from '$lib/utils/constants';

export const GET: RequestHandler = async ({ params, url }) => {
  const { address } = params;
  const queryParams = new URLSearchParams();
  url.searchParams.forEach((value, key) => {
    queryParams.set(key, value);
  });
  const queryStr = queryParams.toString();
  try {
    const res = await fetch(`${ARC_TESTNET_CONFIG.apiBase}/addresses/${address}/token-transfers${queryStr ? `?${queryStr}` : ''}`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) {
      return new Response(JSON.stringify({ error: `API error: ${res.status}` }), { status: res.status });
    }
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch token transfers' }), { status: 500 });
  }
};
