(() => {
'use strict';
const URL='https://rtupkcgzidtyhwtnwosh.supabase.co';
const KEY='sb_publishable_kMNqE9uKrKo9pMjMo19Rhg_DBP5xYF1';
if(!window.supabase)return;
const db=window.supabase.createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const originalMarkup=new WeakMap();
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl=v=>{try{const u=new URL(v,location.href);return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return ''}};
const empty=(msg)=>'<div class="cms-empty" style="grid-column:1/-1;padding:30px 18px;text-align:center;color:#a89e8c;border:1px dashed rgba(200,151,63,.24);border-radius:10px">'+esc(msg)+'</div>';
function announceBar(items){
 const old=document.getElementById('cms-announcement');if(old)old.remove();
 const now=Date.now(), active=(items||[]).filter(a=>a.status==='published'&&(!a.starts_at||new Date(a.starts_at).getTime()<=now)&&(!a.ends_at||new Date(a.ends_at).getTime()>=now));
 if(!active.length)return;
 const a=active[0],bar=document.createElement('aside');bar.id='cms-announcement';bar.textContent=a.title+(a.body?' — '+a.body:'');
 const tones={warning:'#d7a84b',critical:'#d46b5b',success:'#8bbd91',info:'#e0b563'};
 bar.style.cssText='position:relative;z-index:19;text-align:center;padding:11px 18px;background:#1d1811;border-bottom:1px solid rgba(200,151,63,.28);color:'+(tones[a.tone]||tones.info)+';font:500 .82rem Inter,sans-serif;line-height:1.5';
 const header=document.querySelector('header');if(header)header.insertAdjacentElement('afterend',bar);else document.body.prepend(bar);
}
async function scripts(){
 const grid=document.querySelector('.archive-grid');if(!grid)return;if(!originalMarkup.has(grid))originalMarkup.set(grid,grid.innerHTML);
 const {data,error}=await db.from('scripts').select('id,title,slug,game_name,description,download_url,thumbnail_url,tags,featured,views,created_at,published_at').eq('status','Undetected').order('featured',{ascending:false}).order('published_at',{ascending:false});
 if(error){console.warn('TITANIC HUB scripts query failed:',error.message);return}
 if(!data?.length){grid.innerHTML=originalMarkup.get(grid);const search=document.getElementById('script-search');if(search)search.dispatchEvent(new Event('input',{bubbles:true}));return}
 grid.innerHTML=data.map((s,i)=>{const thumb=safeUrl(s.thumbnail_url),dest='script.html?slug='+encodeURIComponent(s.slug);return '<article class="card is-active" data-status="active"><div class="cover cover-active" data-reveal-img><span class="cover-index">'+String(i+1).padStart(2,'0')+'</span><span class="stamp">ACTIVE</span>'+(thumb?'<img src="'+esc(thumb)+'" alt="" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.78">':'<svg class="cover-art" viewBox="0 0 120 160" fill="none" aria-hidden="true"><path d="M60 8c-14 0-24 12-24 26 0 10 5 18 5 18l-14 10c-6 4-9 11-9 18v70c0 6 5 10 10 10h64c5 0 10-4 10-10V80c0-7-3-14-9-18l-14-10s5-8 5-18c0-14-10-26-24-26z" fill="#170d09" fill-opacity=".85"/><circle cx="48" cy="46" r="4" fill="#e0b563"/><circle cx="72" cy="46" r="4" fill="#e0b563"/></svg>')+'</div><h3 data-reveal-text>'+esc(s.title)+'</h3><p class="game-tag">'+esc(s.game_name||'Script archive')+'</p><p class="desc">'+esc(s.description||'Published script entry.')+'</p><div class="card-foot"><a href="'+esc(dest)+'" class="btn btn-block">Get script</a></div></article>'}).join('');
 const search=document.getElementById('script-search');if(search)search.dispatchEvent(new Event('input',{bubbles:true}));
}
async function executors(){
 const grid=document.querySelector('.executor-grid');if(!grid)return;if(!originalMarkup.has(grid))originalMarkup.set(grid,grid.innerHTML);
 const {data,error}=await db.from('executors').select('name,slug,description,version,platform,download_url,website_url,logo_url,featured').eq('status','published').order('featured',{ascending:false}).order('name');
 if(error){console.warn('TITANIC HUB executors query failed:',error.message);return}
 if(!data?.length){grid.innerHTML=originalMarkup.get(grid);return}
 grid.innerHTML=data.map(e=>{const logo=safeUrl(e.logo_url),url=safeUrl(e.website_url)||safeUrl(e.download_url),platforms=Array.isArray(e.platform)?e.platform:[],isMobile=platforms.some(p=>/mobile|android|ios/i.test(p));return '<div class="exec-card"><div class="exec-cover '+(isMobile?'mobile':'pc')+'" data-reveal-img>'+(logo?'<img class="exec-img" src="'+esc(logo)+'" alt="'+esc(e.name)+'" loading="lazy" onload="this.classList.add(\'is-loaded\')" onerror="this.remove()">':'')+'<span class="exec-platform-badge">'+esc(platforms.join(' · ')||'Multi-platform')+'</span><span class="exec-status supported">Published</span><span class="exec-mono">'+esc(e.name.slice(0,8).toUpperCase())+'</span></div><div class="exec-body"><span class="executor-name" data-reveal-text>'+esc(e.name)+'</span>'+(url?'<a href="'+esc(url)+'" class="exec-link" target="_blank" rel="noopener noreferrer">Visit site ↗</a>':'<span class="exec-link">Details coming soon</span>')+'</div></div>'}).join('');
}
async function settings(){
 const {data,error}=await db.from('site_settings').select('key,value').eq('is_public',true);
 if(error||!data){if(error)console.warn('TITANIC HUB settings query failed:',error.message);return}
 const map=Object.fromEntries(data.map(x=>[x.key,x.value]));
 if(map.site_name){document.querySelectorAll('.brand strong,.top strong').forEach(el=>{if(el.textContent.trim()==='TITANIC HUB')el.textContent=String(map.site_name)})}
 if(map.community_url){const url=safeUrl(typeof map.community_url==='string'?map.community_url:'');if(url)document.querySelectorAll('a[href*="discord.com/invite/"],a[data-community-link]').forEach(a=>a.href=url)}
 const old=document.getElementById('cms-setting-banner');if(old)old.remove();const banner=String(map.announcement_banner||'').trim();if(banner){const bar=document.createElement('aside');bar.id='cms-setting-banner';bar.textContent=banner;bar.style.cssText='position:relative;z-index:18;text-align:center;padding:10px 18px;background:#17130d;border-bottom:1px solid rgba(200,151,63,.2);color:#e0b563;font:500 .82rem Inter,sans-serif;line-height:1.5';const header=document.querySelector('header');if(header)header.insertAdjacentElement('afterend',bar);else document.body.prepend(bar)}
}
async function announcements(){
 const {data,error}=await db.from('announcements').select('id,title,body,tone,status,starts_at,ends_at,created_at').eq('status','published').order('created_at',{ascending:false}).limit(20);
 if(error){console.warn('TITANIC HUB announcements query failed:',error.message);return}
 announceBar(data||[]);
}
async function refreshAll(){await Promise.allSettled([scripts(),executors(),settings(),announcements()])}
refreshAll().catch(()=>{});
const channel=db.channel('titanichub-public-live')
 .on('postgres_changes',{event:'*',schema:'public',table:'scripts'},()=>scripts().catch(()=>{}))
 .on('postgres_changes',{event:'*',schema:'public',table:'executors'},()=>executors().catch(()=>{}))
 .on('postgres_changes',{event:'*',schema:'public',table:'announcements'},()=>announcements().catch(()=>{}))
 .on('postgres_changes',{event:'*',schema:'public',table:'site_settings'},()=>settings().catch(()=>{}))
 .subscribe(status=>{if(status==='CHANNEL_ERROR'||status==='TIMED_OUT')console.warn('TITANIC HUB live updates temporarily unavailable:',status)});
window.addEventListener('pagehide',()=>{db.removeChannel(channel)},{once:true});
})();
