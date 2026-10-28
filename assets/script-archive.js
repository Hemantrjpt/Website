(() => {
'use strict';
const API='https://rtupkcgzidtyhwtnwosh.supabase.co/rest/v1/scripts', KEY='sb_publishable_kMNqE9uKrKo9pMjMo19Rhg_DBP5xYF1';
const grid=document.getElementById('archive-grid'), search=document.getElementById('script-search'), source=document.getElementById('archive-source'), sort=document.getElementById('script-sort'), refresh=document.getElementById('script-refresh');
if(!grid||!search||!source)return;
let scripts=[],filter='all',request=0;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl=v=>{try{const u=new URL(v);return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return ''}};
const date=v=>{if(!v)return 'Recently added';const d=new Date(v);return Number.isNaN(d.getTime())?'Recently added':d.toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'})};
function render(){
const q=search.value.trim().toLowerCase();let rows=scripts.filter(s=>[s.title,s.game_name,s.description,s.slug,...(Array.isArray(s.tags)?s.tags:[])].join(' ').toLowerCase().includes(q));
if(filter==='featured')rows=rows.filter(s=>s.featured);
if(sort.value==='title')rows.sort((a,b)=>String(a.title||'').localeCompare(String(b.title||'')));
else if(sort.value==='featured')rows.sort((a,b)=>Number(!!b.featured)-Number(!!a.featured)||new Date(b.updated_at||b.created_at||0)-new Date(a.updated_at||a.created_at||0));
else rows.sort((a,b)=>new Date(b.updated_at||b.created_at||0)-new Date(a.updated_at||a.created_at||0));
if(!rows.length){grid.innerHTML='<div class="archive-loading">'+(scripts.length?'No scripts match your search.':'No published scripts are available yet.')+'</div>';return}
grid.innerHTML=rows.map((s,i)=>{
const thumb=safeUrl(s.thumbnail_url),download=safeUrl(s.download_url),tags=(Array.isArray(s.tags)?s.tags:[]).slice(0,4).map(t=>'<span class="script-tag">'+esc(t)+'</span>').join('');
const action=download?'<a class="btn btn-block" href="'+esc(download)+'" target="_blank" rel="noopener noreferrer">Get script ↗</a>':s.script_body?'<button class="btn btn-block script-copy" type="button" data-script="'+esc(s.id)+'">Copy script</button>':'<span class="btn btn-block" aria-disabled="true">Coming soon</span>';
return '<article class="card '+(s.featured?'is-active':'')+'"><div class="cover '+(s.featured?'cover-active':'cover-locked')+'">'+(thumb?'<img class="script-thumb" src="'+esc(thumb)+'" alt="'+esc(s.game_name||s.title)+' thumbnail" loading="lazy" onerror="this.remove()">':'')+'<span class="cover-index">'+String(i+1).padStart(2,'0')+'</span><span class="stamp '+(s.featured?'':'locked')+'">'+(s.featured?'FEATURED':'PUBLISHED')+'</span>'+(!thumb?'<span class="cover-seal">'+esc((s.game_name||s.title||'SCRIPT').slice(0,26))+'</span>':'')+'</div><h3>'+esc(s.title||'Untitled script')+'</h3><p class="game-tag">'+esc(s.game_name||'Roblox')+'</p><p class="desc">'+esc(s.description||'No description provided yet.')+'</p>'+(tags?'<div class="script-tags">'+tags+'</div>':'')+'<div class="script-meta">Updated '+esc(date(s.updated_at||s.published_at||s.created_at))+'</div><div class="card-foot">'+action+'</div></article>';
}).join('');
grid.querySelectorAll('.script-copy').forEach(button=>button.addEventListener('click',async()=>{
const record=scripts.find(s=>String(s.id)===button.dataset.script);if(!record?.script_body)return;
try{await navigator.clipboard.writeText(record.script_body);button.textContent='Copied ✓'}catch{const box=document.createElement('textarea');box.value=record.script_body;box.style.position='fixed';box.style.opacity='0';document.body.appendChild(box);box.select();const ok=document.execCommand('copy');box.remove();button.textContent=ok?'Copied ✓':'Copy unavailable'}
window.setTimeout(()=>{button.textContent='Copy script'},1800);
}));
}
async function load(){
const id=++request;refresh.disabled=true;source.textContent='Loading live published scripts…';grid.innerHTML='<div class="archive-loading">Loading published scripts…</div>';
try{const response=await fetch(API+'?select=id,title,slug,game_name,status,tags,thumbnail_url,download_url,description,script_body,featured,created_at,updated_at,published_at&status=eq.published&order=featured.desc,updated_at.desc&limit=100',{headers:{apikey:KEY,Authorization:'Bearer '+KEY,Accept:'application/json'},cache:'no-store'});if(!response.ok)throw new Error('Archive request failed ('+response.status+')');const data=await response.json();if(!Array.isArray(data))throw new Error('Unexpected archive response');if(id!==request)return;scripts=data;source.textContent='LIVE ARCHIVE · '+scripts.length+' published '+(scripts.length===1?'script':'scripts')+' · refreshed '+new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});render()}
catch(error){if(id!==request)return;grid.innerHTML='<div class="archive-error">The live archive could not be reached. Try Refresh in a moment.</div>';source.textContent='Archive connection unavailable';console.warn('TITANIC HUB archive:',error.message)}
finally{if(id===request)refresh.disabled=false}
}
search.addEventListener('input',render);sort.addEventListener('change',render);
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('is-active',b===button));render()}));
refresh.addEventListener('click',load);load();window.setInterval(load,5*60*1000);
})();