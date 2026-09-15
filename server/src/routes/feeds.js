const express = require('express');
const { readJson } = require('../db/store');

const router = express.Router();

// Same placeholder pattern used elsewhere in this project — swap for your
// real domain once you have one deployed.
const SITE_URL = process.env.SITE_URL || 'https://your-domain-here.com';

router.get('/sitemap.xml', async (req, res) => {
  const scripts = await readJson('scripts.json');
  const urls = [
    { loc: `${SITE_URL}/`, changefreq: 'weekly', priority: '1.0' },
    { loc: `${SITE_URL}/executors`, changefreq: 'monthly', priority: '0.6' },
    { loc: `${SITE_URL}/disclaimer`, changefreq: 'yearly', priority: '0.3' },
    ...scripts.map((s) => ({
      loc: `${SITE_URL}/scripts/${s.slug}`,
      changefreq: 'weekly',
      priority: s.status === 'active' ? '0.9' : '0.4'
    }))
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`).join('\n')}
</urlset>
`;
  res.type('application/xml').send(xml);
});

router.get('/rss.xml', async (req, res) => {
  const scripts = await readJson('scripts.json');
  const active = scripts.find((s) => s.status === 'active');
  const entries = active ? [...active.changelog].sort((a, b) => new Date(b.released_at) - new Date(a.released_at)) : [];

  const escapeXml = (str) =>
    String(str).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));

  const items = entries
    .map(
      (e) => `  <item>
    <title>${escapeXml(e.version)}</title>
    <link>${SITE_URL}/scripts/${active.slug}#update-log</link>
    <guid isPermaLink="false">${active.slug}-${e.id}</guid>
    <pubDate>${new Date(e.released_at).toUTCString()}</pubDate>
    <description>${escapeXml(e.description)}</description>
  </item>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>TITANIC HUB — Update Log</title>
    <link>${SITE_URL}${active ? `/scripts/${active.slug}` : ''}</link>
    <description>Patch notes and updates for TITANIC HUB Roblox scripts.</description>
    <language>en-us</language>
${items}
  </channel>
</rss>
`;
  res.type('application/xml').send(xml);
});

module.exports = router;
