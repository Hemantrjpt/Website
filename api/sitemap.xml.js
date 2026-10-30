const SITE = 'https://titanichub.vercel.app';
const SUPABASE_URL = 'https://rtupkcgzidtyhwtnwosh.supabase.co';
const SUPABASE_KEY = 'sb_publishable_kMNqE9uKrKo9pMjMo19Rhg_DBP5xYF1';
const xml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[char]));
module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
  const urls = [{loc:SITE+'/',changefreq:'weekly',priority:'1.0'},{loc:SITE+'/executors.html',changefreq:'weekly',priority:'0.7'},{loc:SITE+'/disclaimer.html',changefreq:'yearly',priority:'0.2'}];
  try {
    const endpoint=SUPABASE_URL+'/rest/v1/scripts?select=slug,updated_at,published_at&status=eq.published&order=published_at.desc&limit=1000';
    const response=await fetch(endpoint,{headers:{apikey:SUPABASE_KEY,Authorization:'Bearer '+SUPABASE_KEY,Accept:'application/json'}});
    if(response.ok){const records=await response.json();for(const record of records){if(!record||!/^[a-z0-9-]+$/i.test(String(record.slug||'')))continue;const url=new URL(SITE+'/script.html');url.searchParams.set('slug',record.slug);const date=record.updated_at||record.published_at;urls.push({loc:url.href,lastmod:date&&!Number.isNaN(Date.parse(date))?new Date(date).toISOString():null,changefreq:'weekly',priority:'0.8'});}}
  } catch(error) { console.error('Sitemap script listing failed:',error); }
  const entries=urls.map(item=>'  <url>\\n    <loc>'+xml(item.loc)+'</loc>'+(item.lastmod?'\\n    <lastmod>'+xml(item.lastmod)+'</lastmod>':'')+'\\n    <changefreq>'+item.changefreq+'</changefreq>\\n    <priority>'+item.priority+'</priority>\\n  </url>').join('\\n');
  res.statusCode=200;res.end('<?xml version="1.0" encoding="UTF-8"?>\\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\\n'+entries+'\\n</urlset>');
};
