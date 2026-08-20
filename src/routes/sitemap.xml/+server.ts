import type { RequestHandler } from './$types';

const DOMAIN = 'https://cryptowalletsx.com';

const staticPages: { path: string; changefreq: string; priority: string; lastmod?: string }[] = [
  { path: '', changefreq: 'daily', priority: '1.0' },
  { path: '/checker', changefreq: 'weekly', priority: '0.9' },
  { path: '/about', changefreq: 'monthly', priority: '0.4' },
  { path: '/contact', changefreq: 'monthly', priority: '0.4' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.2' },
  { path: '/blog', changefreq: 'weekly', priority: '0.7' },
];

const chainPages: { path: string; changefreq: string; priority: string }[] = [
  { path: '/arc', changefreq: 'daily', priority: '0.8' },
  { path: '/simplechain', changefreq: 'daily', priority: '0.8' },
  { path: '/base', changefreq: 'daily', priority: '0.8' },
  { path: '/ink', changefreq: 'daily', priority: '0.8' },
  { path: '/relay', changefreq: 'daily', priority: '0.8' },
  { path: '/litvm', changefreq: 'daily', priority: '0.8' },
  { path: '/seismic', changefreq: 'daily', priority: '0.8' },
  { path: '/genlayer', changefreq: 'daily', priority: '0.8' },
  { path: '/jumper', changefreq: 'daily', priority: '0.8' },
  { path: '/dachain', changefreq: 'daily', priority: '0.8' },
  { path: '/doma', changefreq: 'daily', priority: '0.8' },
  { path: '/robinhood', changefreq: 'daily', priority: '0.8' },
];

const mainnetDappPages: { path: string; changefreq: string; priority: string }[] = [
  { path: '/soneium', changefreq: 'daily', priority: '0.8' },
  { path: '/soneium-badge-checker', changefreq: 'daily', priority: '0.8' },
  { path: '/binance-wotd-solver', changefreq: 'daily', priority: '0.8' },
  { path: '/layerzero-stats', changefreq: 'weekly', priority: '0.7' },
  { path: '/aligned-airdrop', changefreq: 'daily', priority: '0.9' },
];

const concludedPages: { path: string; changefreq: string; priority: string }[] = [
  { path: '/linea', changefreq: 'monthly', priority: '0.3' },
  { path: '/linea/bulk', changefreq: 'monthly', priority: '0.3' },
  { path: '/sahara-ai-stats-checker', changefreq: 'monthly', priority: '0.3' },
  { path: '/pharos-stats-checker', changefreq: 'monthly', priority: '0.3' },
  { path: '/monad-testnet', changefreq: 'monthly', priority: '0.3' },
  { path: '/game-of-mito', changefreq: 'monthly', priority: '0.3' },
  { path: '/game-of-mito/bulk', changefreq: 'monthly', priority: '0.3' },
  { path: '/mitosis', changefreq: 'monthly', priority: '0.3' },
];

const blogSlugs = [
  'arc', 'simplechain', 'base', 'ink', 'relay',
  'litvm', 'seismic', 'genlayer', 'jumper', 'dachain', 'doma', 'robinhood',
];

function getUrl(path: string, changefreq: string, priority: string, lastmod?: string) {
  let xml = `  <url>
    <loc>${DOMAIN}${path}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>`;
  if (lastmod) {
    xml += `
    <lastmod>${lastmod}</lastmod>`;
  }
  xml += `
  </url>`;
  return xml;
}

export const GET: RequestHandler = async () => {
  const urls: string[] = [];

  // Home page
  urls.push(getUrl('', 'daily', '1.0', new Date().toISOString().split('T')[0]));

  // Static pages
  for (const page of staticPages.slice(1)) {
    urls.push(getUrl(page.path, page.changefreq, page.priority));
  }

  // Chain tool pages
  for (const page of chainPages) {
    urls.push(getUrl(page.path, page.changefreq, page.priority));
  }

  // Mainnet & dapp tool pages
  for (const page of mainnetDappPages) {
    urls.push(getUrl(page.path, page.changefreq, page.priority));
  }

  // Concluded airdrop pages
  for (const page of concludedPages) {
    urls.push(getUrl(page.path, page.changefreq, page.priority));
  }

  // Blog posts
  for (const slug of blogSlugs) {
    urls.push(getUrl(`/blog/${slug}`, 'weekly', '0.6'));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=3600',
    },
  });
};
