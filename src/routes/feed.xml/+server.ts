import type { RequestHandler } from './$types';
import { CHAIN_CONFIGS } from '$lib/utils/constants';

const DOMAIN = 'https://cryptowalletsx.com';
const SITE_NAME = 'CryptoWalletsx';

const blogSlugs = [
  'arc', 'arc-testnet', 'simplechain', 'base', 'ink', 'relay',
  'litvm', 'seismic', 'genlayer', 'jumper', 'dachain', 'doma', 'robinhood', 'robinhood-testnet', 'soneium',
];

export const GET: RequestHandler = async () => {
  const items = blogSlugs.map(slug => {
    const config = CHAIN_CONFIGS[slug];
    const title = config ? `${config.name} Complete Guide` : slug;
    const description = config
      ? `Learn how to use the ${config.name} wallet stats checker. Understand scoring, track DeFi activity, and improve your on-chain profile.`
      : '';
    return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${DOMAIN}/blog/${slug}</link>
      <guid isPermaLink="true">${DOMAIN}/blog/${slug}</guid>
      <description>${escapeXml(description)}</description>
      <category>${config?.isTestnet ? 'Testnet' : 'Mainnet'}</category>
    </item>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME} Blog</title>
    <link>${DOMAIN}/blog</link>
    <description>Comprehensive guides for crypto wallet analytics tools across 10+ blockchains</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${DOMAIN}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=3600',
    },
  });
};

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
