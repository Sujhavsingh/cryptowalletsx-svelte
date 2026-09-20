import type { RequestHandler } from './$types';
import { ROBINHOOD_TESTNET_CONFIG } from '$lib/utils/constants';

export const GET: RequestHandler = async ({ params }) => {
  const { address } = params;
  try {
    const res = await fetch(`${ROBINHOOD_TESTNET_CONFIG.apiBase}/addresses/${address}`, {
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
    return new Response(JSON.stringify({ error: 'Failed to fetch address details' }), { status: 500 });
  }
};
