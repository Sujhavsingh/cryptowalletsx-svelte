import type { RequestHandler } from './$types';

const DOMAIN = 'https://cryptowalletsx.com';
const LASTMOD = new Date().toISOString().split('T')[0];

const staticPages: { path: string; changefreq: string; priority: string }[] = [
  { path: '', changefreq: 'daily', priority: '1.0' },
  { path: '/checker', changefreq: 'weekly', priority: '0.9' },
  { path: '/about', changefreq: 'monthly', priority: '0.4' },
  { path: '/contact', changefreq: 'monthly', priority: '0.4' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.2' },
  { path: '/blog', changefreq: 'weekly', priority: '0.7' },
];

const chainPages: { path: string; changefreq: string; priority: string }[] = [
  { path: '/arc', changefreq: 'daily', priority: '0.9' },
  { path: '/arc-testnet', changefreq: 'weekly', priority: '0.7' },
  { path: '/base', changefreq: 'daily', priority: '0.8' },
  { path: '/ink', changefreq: 'daily', priority: '0.8' },
  { path: '/simplechain', changefreq: 'daily', priority: '0.8' },
  { path: '/robinhood', changefreq: 'daily', priority: '0.9' },
  { path: '/robinhood-testnet', changefreq: 'weekly', priority: '0.7' },
  { path: '/litvm', changefreq: 'daily', priority: '0.8' },
  { path: '/seismic', changefreq: 'daily', priority: '0.8' },
  { path: '/genlayer', changefreq: 'daily', priority: '0.8' },
  { path: '/dachain', changefreq: 'daily', priority: '0.8' },
  { path: '/doma', changefreq: 'daily', priority: '0.8' },
  { path: '/relay', changefreq: 'daily', priority: '0.8' },
  { path: '/jumper', changefreq: 'daily', priority: '0.8' },
  { path: '/soneium', changefreq: 'daily', priority: '0.8' },
  { path: '/soneium-badge-checker', changefreq: 'daily', priority: '0.8' },
  { path: '/layerzero-stats', changefreq: 'weekly', priority: '0.7' },
  { path: '/aligned-airdrop', changefreq: 'daily', priority: '0.9' },
  { path: '/binance-wotd-solver', changefreq: 'daily', priority: '0.8' },
];

const blogSlugs = [
  'arc', 'arc-testnet', 'simplechain', 'base', 'ink', 'relay',
  'litvm', 'seismic', 'genlayer', 'jumper', 'dachain', 'doma', 'robinhood', 'robinhood-testnet', 'soneium',
];

function getUrl(path: string, changefreq: string, priority: string) {
  return `  <url>
    <loc>${DOMAIN}${path}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    <lastmod>${LASTMOD}</lastmod>
  </url>`;
}

export const GET: RequestHandler = async () => {
  const urls: string[] = [];

  // Home page
  urls.push(getUrl('', 'daily', '1.0'));

  // All other pages with lastmod
  for (const page of staticPages.slice(1)) {
    urls.push(getUrl(page.path, page.changefreq, page.priority));
  }
  for (const page of chainPages) {
    urls.push(getUrl(page.path, page.changefreq, page.priority));
  }
  // Concluded-airdrop pages (/linea, /game-of-mito, /mitosis, /monad-testnet,
  // /sahara-ai-stats-checker, /pharos-stats-checker and their /bulk variants) are
  // served with `noindex` via AirdropConcludedPage, so they are deliberately kept
  // out of the sitemap — only canonical, indexable URLs belong here.
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
