(() => {
'use strict';
const URL='https://rtupkcgzidtyhwtnwosh.supabase.co';
const KEY='sb_publishable_kMNqE9uKrKo9pMjMo19Rhg_DBP5xYF1';
if(!window.supabase)return;
const db=window.supabase.createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl=v=>{try{const u=new URL(v,location.href);return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return ''}};
const slug=v=>String(v||'').replace(/[^a-zA-Z0-9_-]/g,'');
async function scripts(){
 const grid=document.querySelector('.archive-grid');if(!grid)return;
 const {data,error}=await db.from('scripts').select('id,title,slug,game_name,description,download_url,thumbnail_url,tags,featured,views,created_at').eq('status','published').order('featured',{ascending:false}).order('published_at',{ascending:false});
 if(error||!data?.length)return;
 grid.innerHTML=data.map((s,i)=>{const thumb=safeUrl(s.thumbnail_url);const dest=safeUrl(s.download_url)||('script.html?slug='+encodeURIComponent(s.slug));return '<article class="card is-active" data-status="active"><div class="cover cover-active" data-reveal-img><span class="cover-index">'+String(i+1).padStart(2,'0')+'</span><span class="stamp">PUBLISHED</span>'+(thumb?'<img src="'+esc(thumb)+'" alt="" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.78">':'<svg class="cover-art" viewBox="0 0 120 160" fill="none" aria-hidden="true"><path d="M60 8c-14 0-24 12-24 26 0 10 5 18 5 18l-14 10c-6 4-9 11-9 18v70c0 6 5 10 10 10h64c5 0 10-4 10-10V80c0-7-3-14-9-18l-14-10s5-8 5-18c0-14-10-26-24-26z" fill="#170d09" fill-opacity=".85"/><circle cx="48" cy="46" r="4" fill="#e0b563"/><circle cx="72" cy="46" r="4" fill="#e0b563"/></svg>')+'</div><h3 data-reveal-text>'+esc(s.title)+'</h3><p class="game-tag">'+esc(s.game_name||'Script archive')+'</p><p class="desc">'+esc(s.description||'Published script entry.')+'</p><div class="card-foot"><a href="'+esc(dest)+'" class="btn btn-block">'+(safeUrl(s.download_url)?'Get script':'View details')+'</a></div></article>'}).join('');
 const search=document.getElementById('script-search');if(search)search.dispatchEvent(new Event('input',{bubbles:true}));
}
async function executors(){
 const grid=document.querySelector('.executor-grid');if(!grid)return;
 const {data,error}=await db.from('executors').select('name,slug,description,version,platform,download_url,website_url,logo_url,featured').eq('status','published').order('featured',{ascending:false}).order('name');
 if(error||!data?.length)return;
 grid.innerHTML=data.map(e=>{const logo=safeUrl(e.logo_url),url=safeUrl(e.website_url)||safeUrl(e.download_url),platforms=Array.isArray(e.platform)?e.platform:[];const isMobile=platforms.some(p=>/mobile|android|ios/i.test(p));return '<div class="exec-card"><div class="exec-cover '+(isMobile?'mobile':'pc')+'" data-reveal-img>'+(logo?'<img class="exec-img" src="'+esc(logo)+'" alt="'+esc(e.name)+'" loading="lazy" onload="this.classList.add(\'is-loaded\')" onerror="this.remove()">':'')+'<span class="exec-platform-badge">'+esc(platforms.join(' · ')||'Multi-platform')+'</span><span class="exec-status supported">Published</span><span class="exec-mono">'+esc(e.name.slice(0,8).toUpperCase())+'</span></div><div class="exec-body"><span class="executor-name" data-reveal-text>'+esc(e.name)+'</span>'+(url?'<a href="'+esc(url)+'" class="exec-link" target="_blank" rel="noopener noreferrer">Visit site ↗</a>':'<span class="exec-link">Details coming soon</span>')+'</div></div>'}).join('');
}
async function settings(){
 const {data,error}=await db.from('site_settings').select('key,value').eq('is_public',true);
 if(error||!data)return;const map=Object.fromEntries(data.map(x=>[x.key,x.value]));
 if(map.community_url){const url=safeUrl(typeof map.community_url==='string'?map.community_url:'');if(url)document.querySelectorAll('a[href*="discord.com/invite/"]').forEach(a=>a.href=url)}
 if(map.announcement_banner){const text=String(map.announcement_banner).trim();if(text){const bar=document.createElement('div');bar.className='cms-announcement';bar.textContent=text;bar.style.cssText='position:relative;z-index:19;text-align:center;padding:10px 18px;background:#1d1811;border-bottom:1px solid rgba(200,151,63,.28);color:#e0b563;font:500 .82rem Inter,sans-serif';document.querySelector('header')?.insertAdjacentElement('afterend',bar)}}
}
scripts().catch(()=>{});executors().catch(()=>{});settings().catch(()=>{});
})();