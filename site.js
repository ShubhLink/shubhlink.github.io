
window.SHUBH_DATA_READY=(async function(){
'use strict';
const D=window.SHUBHLINK_DATA;if(!D)return;
// Retire the public Good Afternoon category without deleting historical content.
D.categories=D.categories.filter(item=>item.id!=='afternoon'&&item.id!=='festival');
for(const language of ['gu','hi','en'])if(D.wishes[language])delete D.wishes[language].afternoon;
const backend=window.SHUBHLINK_BACKEND||{};
const dbTitleMap=new Map();
const dbFeatured=new Set();
const dbDaily=[];
// Paint the available local cards immediately. Never leave the home/category grid
// empty while a slow Free Tier database wakes up.
function renderLocalCards(hostId,limit){
 const host=document.getElementById(hostId);if(!host)return;
 const first=window.ShubhCalendar?.currentCategory()||'morning';
 const order=[first,...D.categories.map(c=>c.id)],seen=new Set();
 host.replaceChildren();
 for(const id of order){
  if(seen.has(id))continue;seen.add(id);
  const c=D.categories.find(x=>x.id===id);if(!c)continue;
  const a=document.createElement('a');a.href='wishes.html?c='+encodeURIComponent(c.id);
  a.className='catbox cat-'+c.id;
  const icon=document.createElement('span');icon.className='catemoji';icon.textContent=hostId==='allCats'?'':c.emoji;
  if(hostId==='allCats'){
   const filenames={morning:'suprabhat',birthday:'birthday',suvichar:'daily-suvichar',newthought:'new-thought',night:'good-night',friendship:'friendship',anniversary:'anniversary',congrats:'congratulations'};
   const base='assets/categories/'+(filenames[c.id]||c.id);
   const img=document.createElement('img');img.className='category-real-photo';img.alt='';img.width=480;img.height=324;img.loading=host.children.length<4?'eager':'lazy';img.decoding='async';img.src=base+'.clean.webp';
   a.classList.add('artwork-pending');img.onload=()=>{a.classList.remove('artwork-pending');a.classList.add('has-artwork');a.classList.toggle('clean-artwork',img.src.includes('.clean.webp'))};
   img.onerror=()=>{if(img.src.endsWith('.clean.webp')){img.src=base+'.webp';return}if(img.src.endsWith('.webp')){img.src=base+'.png';return}img.remove();a.classList.remove('artwork-pending')};
   icon.textContent='';icon.append(img);
  }
  const title=document.createElement('strong');title.textContent=c.gu;
  const desc=document.createElement('small');desc.textContent=c.desc||'';
  const arrow=document.createElement('span');arrow.className='arrow';arrow.textContent='↗';
  const go=document.createElement('span');go.className='catgo';go.textContent='મેસેજ જુઓ →';
  a.append(arrow,icon,title,desc,go);host.append(a);
  if(host.children.length>=limit)break;
 }
}
renderLocalCards('homeCats',8);
renderLocalCards('allCats',50);
if(document.getElementById('dailyQuote')){
 document.getElementById('dailyQuote').textContent=D.wishes.gu?.suvichar?.[0]||'સુંદર વિચારો જીવનને સુંદર બનાવે છે.';
}
if(backend.url&&backend.publishableKey){
 try{
  const root=backend.url.replace(/\/$/,'');
  const headers={apikey:backend.publishableKey};
  const signal=typeof AbortSignal!=='undefined'&&AbortSignal.timeout?AbortSignal.timeout(9000):undefined;
  const catRequest=fetch(root+'/rest/v1/shubhlink_categories?select=id,emoji,name_gu,name_hi,name_en,description_gu,color&is_active=eq.true',{headers,cache:'no-store',signal});
  const messages=[];
  // Home/category teasers only need curated & daily messages; search and editor still load the full library.
  const teaserOnly=!!(document.getElementById('homeCats')||document.getElementById('allCats'));
  const teaserFilter=teaserOnly?'&or=(featured.eq.true,source.eq.ai_daily)':'';
  for(let offset=0;offset<10000;offset+=500){
   const url=root+'/rest/v1/shubhlink_messages?select=id,category_id,language,title,body,featured,source,generated_on&is_published=eq.true'+teaserFilter+'&order=created_at.desc,id.desc&limit=500&offset='+offset;
   const response=await fetch(url,{headers,cache:'no-store',signal});
   if(!response.ok)throw Error('Published messages could not load');
   const page=await response.json();
   messages.push(...page);
   if(page.length<500)break;
  }
  const catResponse=await catRequest;
  if(!catResponse.ok)throw Error('Categories could not load');
  const cats=await catResponse.json();
  for(const c of cats){
   if(c.id==='afternoon'||c.id==='festival')continue;
   if(!D.categories.some(x=>x.id===c.id)){
    D.categories.push({id:c.id,emoji:c.emoji,gu:c.name_gu,hi:c.name_hi,en:c.name_en,desc:c.description_gu,color:c.color||'pink'});
   }
  }
  const newWishes={};
  for(const m of messages){
   if(!['gu','hi','en'].includes(m.language)||m.category_id==='afternoon'||m.category_id==='festival')continue;
   if(m.title)dbTitleMap.set(m.language+'|'+m.category_id+'|'+m.body,m.title);
   if(m.featured)dbFeatured.add(m.language+'|'+m.category_id+'|'+m.body);
   if(m.source==='ai_daily'&&m.generated_on)dbDaily.push(m);
   if(!newWishes[m.language])newWishes[m.language]={};
   if(!newWishes[m.language][m.category_id])newWishes[m.language][m.category_id]=[];
   newWishes[m.language][m.category_id].push(m.body);
  }
  for(const [language,byCategory] of Object.entries(newWishes)){
   if(!D.wishes[language])D.wishes[language]={};
   for(const [category,items] of Object.entries(byCategory)){
    const existing=D.wishes[language][category]||[];
    D.wishes[language][category]=[...new Set([...items,...existing])];
   }
  }
 }catch(error){console.warn('ShubhLink backend temporarily unavailable; showing free built-in messages.',error)}
}
const $=id=>document.getElementById(id);
const qs=new URLSearchParams(location.search);
const languages=['gu','hi','en'];
const catIds=D.categories.map(c=>c.id);
const firstCat=catIds.includes(qs.get('c'))?qs.get('c'):(window.ShubhCalendar?.currentCategory()||'morning');
const firstLang=languages.includes(qs.get('l'))?qs.get('l'):'gu';
const enc=encodeURIComponent;
const trim=(text,max=500)=>String(text||'').replace(/[<>\u0000-\u001f]/g,' ').trim().slice(0,max);
const titleFor=(m,c,l)=>{
 const stored=dbTitleMap.get(l+'|'+c+'|'+m);
 if(stored)return stored;
 const sentences=trim(m).split(/[.!?।॥\n]/);
 let t=(sentences.find(x=>x.trim().length>=7)||sentences[0]||'').trim().replace(/^[^\p{L}\p{N}]+/u,'');
 return t.length>46?t.slice(0,43).trim()+'…':t||(D.categories.find(x=>x.id===c)?.[l]||'શુભેચ્છા');
};
const catName=(c,l)=>c[l]||c.gu;
function catCard(c){
 const a=document.createElement('a');a.className='catbox cat-'+c.id;a.href='wishes.html?c='+enc(c.id);a.setAttribute('aria-label',c.gu+' માટે મેસેજ જુઓ');
 const emoji=document.createElement('span');emoji.className='catemoji';emoji.textContent=c.emoji; if(document.getElementById('allCats')){const filenames={morning:'suprabhat',birthday:'birthday',suvichar:'daily-suvichar',newthought:'new-thought',night:'good-night',friendship:'friendship',anniversary:'anniversary',congrats:'congratulations'};const img=document.createElement('img');img.className='category-real-photo';const imageBase='assets/categories/'+(filenames[c.id]||c.id);img.src=imageBase+'.clean.webp';img.alt='';img.loading='eager';img.decoding='async';img.fetchPriority='high';img.width=480;img.height=324;img.onload=()=>a.classList.add('has-artwork');a.classList.toggle('clean-artwork',img.src.includes('.clean.webp'));img.onerror=()=>{if(img.src.endsWith('.clean.webp')){img.src=imageBase+'.webp';return}if(img.src.endsWith('.webp')){img.src=imageBase+'.png';return}img.remove();a.classList.remove('has-artwork')};emoji.textContent='';emoji.append(img)}
 const title=document.createElement('strong');title.textContent=c.gu;
 const desc=document.createElement('small');
 const messages=D.wishes.gu?.[c.id]||[];
 const preferred=window.ShubhFresh?.pick(messages.filter(m=>dbFeatured.has('gu|'+c.id+'|'+m)).length?messages.filter(m=>dbFeatured.has('gu|'+c.id+'|'+m)):messages,'home-card:'+c.id);
 desc.textContent=preferred?preferred.replace(/^[^\p{L}\p{N}]+/u,'').replace(/\s+/g,' ').slice(0,80)+(preferred.length>80?'…':''):c.desc;
 const go=document.createElement('span');go.className='catgo';go.textContent='મેસેજ જુઓ →';
 const arrow=document.createElement('span');arrow.className='arrow';arrow.textContent='↗';
 a.append(arrow,emoji,title,desc,go);return a;
}
if($('homeCats')){
 $('homeCats').replaceChildren();
 {
  const todayEvent=(window.ShubhCalendar?.todayEvents()||[])[0];
  const first=window.ShubhCalendar?.currentCategory()||'morning';
  const order=[first,...(todayEvent?['festival']:[]),...D.categories.map(c=>c.id)];
  const shown=new Set();
  for(const id of order){if(shown.has(id))continue;shown.add(id);
   const c=D.categories.find(x=>x.id===id);if(c&&shown.size<=8)$('homeCats').append(catCard(c));
  }
 }
 const arr=D.wishes.gu.suvichar||[];
 if(arr.length){
  const premium=arr.filter(m=>dbFeatured.has('gu|suvichar|'+m));
  if($('dailyQuote'))$('dailyQuote').textContent=(window.ShubhFresh?.pick(premium.length?premium:arr,'daily-quote')||arr[0]);
 }
}
if($('dailyFeed')&&$('dailyFeedGrid')){
 const fresh=dbDaily.filter(x=>x.language==='gu'&&D.categories.some(c=>c.id===x.category_id)).slice(0,4);
 if(fresh.length){
  const grid=$('dailyFeedGrid');
  for(const m of fresh){
   const c=D.categories.find(x=>x.id===m.category_id);
   const card=document.createElement('article');card.className='wishitem';
   const tag=document.createElement('span');tag.className='wishtag';tag.textContent=c.emoji+' '+c.gu;
   const h=document.createElement('h3');h.textContent=m.title;
   const p=document.createElement('p');p.textContent=m.body;
   const actions=document.createElement('div');actions.className='wish-actions';
   const wa=document.createElement('button');wa.className='wish-whatsapp';wa.type='button';wa.textContent='◉ WhatsApp પર શેર કરો';
   wa.addEventListener('click',()=>window.ShubhShare.open({title:m.title,body:m.body,language:'gu',category:m.category_id}));
   actions.append(wa);card.append(tag,h,p,actions);grid.append(card);
  }
  $('dailyFeed').hidden=false;
 }
}
if($('allCats')&&!$('allCats').children.length){
 $('allCats').replaceChildren();
 const first=window.ShubhCalendar?.currentCategory()||'morning';
 const hasEvent=(window.ShubhCalendar?.todayEvents()||[]).length>0;
 const ids=[first,...D.categories.filter(x=>x.id!=='festival').map(x=>x.id)];
 const done=new Set();
 for(const id of ids){if(done.has(id))continue;done.add(id);const cat=D.categories.find(c=>c.id===id);if(cat&&cat.id!=='festival')$('allCats').append(catCard(cat))}
}
if($('wishGrid')){
 const csel=$('filterCat'),lsel=$('filterLang'),search=$('filterSearch'),grid=$('wishGrid');
 D.categories.forEach(c=>{const o=document.createElement('option');o.value=c.id;o.textContent=c.emoji+' '+c.gu;csel.add(o)});
 csel.value=firstCat;lsel.value=firstLang;
 let shown=[],rendered=0,observer=null;
 const sentinel=document.createElement('div');
 sentinel.className='wish-auto-sentinel';
 sentinel.setAttribute('aria-hidden','true');
 grid.after(sentinel);
 function appendBatch(){
  if(rendered>=shown.length){sentinel.hidden=true;observer?.disconnect();return}
  const fragment=document.createDocumentFragment();
  const end=Math.min(rendered+16,shown.length);
  const c=csel.value,l=lsel.value,cat=D.categories.find(x=>x.id===c);
  for(let i=rendered;i<end;i++){
   const msg=shown[i].msg,topic=titleFor(msg,c,l);
   const card=document.createElement('article');card.className='wishitem';
   const tag=document.createElement('span');tag.className='wishtag';tag.textContent=cat.emoji+' '+catName(cat,l);
   const h=document.createElement('h3');h.textContent=topic;
   const p=document.createElement('p');p.textContent=msg;
   const actions=document.createElement('div');actions.className='wish-actions';
   const wa=document.createElement('button');wa.className='wish-whatsapp';wa.type='button';wa.textContent='◉ WhatsApp પર શેર કરો';
   wa.addEventListener('click',()=>window.ShubhShare.open({title:topic,body:msg,language:l,category:c}));
   actions.append(wa);card.append(tag,h,p,actions);fragment.append(card);
  }
  rendered=end;grid.append(fragment);
  sentinel.hidden=rendered>=shown.length;
  if(sentinel.hidden)observer?.disconnect();
 }
 function render(){
  observer?.disconnect();
  const c=csel.value,l=lsel.value,cat=D.categories.find(x=>x.id===c);
  const q=trim(search.value).toLocaleLowerCase();
  const norm=window.ShubhCalendar?.normalize||((x)=>String(x||'').toLocaleLowerCase());
  const query=norm(q);
  const seen=new Set();
  shown=(D.wishes[l]?.[c]||[])
   .filter(msg=>!query||norm(msg+' '+titleFor(msg,c,l)).includes(query))
   .filter(msg=>{const k=norm(msg);if(seen.has(k))return false;seen.add(k);return true})
   .map((msg,i)=>({msg,i,featured:dbFeatured.has(l+'|'+c+'|'+msg)}))
   .sort((a,b)=>Number(b.featured)-Number(a.featured)||a.i-b.i);
  $('wishHeading').textContent=cat.emoji+' '+catName(cat,l);
  $('wishIntro').textContent='';
  $('resultMeta').textContent=shown.length+' મેસેજ';
  grid.replaceChildren();
  rendered=0;
  appendBatch();
  if(!shown.length){
   const empty=document.createElement('p');empty.className='empty';
   empty.textContent='હમણાં આ વિષયના મેસેજ નથી મળ્યા. AI Studio માં નવો મેસેજ બનાવો.';
   grid.append(empty);
  }else if(rendered<shown.length){
   if('IntersectionObserver' in window){
    observer=new IntersectionObserver(entries=>{
     if(entries.some(x=>x.isIntersecting))appendBatch();
    },{rootMargin:'650px 0px'});
    observer.observe(sentinel);
   }else{
    while(rendered<shown.length)appendBatch();
   }
  }
  const url=new URL(location.href);url.searchParams.set('c',c);url.searchParams.set('l',l);
  history.replaceState(null,'',url);
 }
 csel.addEventListener('change',render);
 lsel.addEventListener('change',render);
 search.addEventListener('input',render);
 render();
}
if($('editCat')){
 const cat=$('editCat'),lng=$('editLang'),title=$('editTitle'),msg=$('editMsg'),to=$('editTo'),from=$('editFrom'),feedback=$('feedback');
 D.categories.forEach(c=>{const o=document.createElement('option');o.value=c.id;o.textContent=c.emoji+' '+c.gu;cat.add(o)});
 cat.value=firstCat;lng.value=firstLang;
 const choice=()=>D.wishes[lng.value]?.[cat.value]||[];
 const localName=value=>{
   const v=trim(value,50);
   return window.ShubhNames?window.ShubhNames.prepare(v,lng.value):v;
 };
 function convertNameFields(){
   if(lng.value!=='gu')return;
   for(const input of [to,from]){
    if(/[A-Za-z]/.test(input.value))input.value=localName(input.value).slice(0,50);
   }
 }
 for(const inp of [to,from])inp.addEventListener('blur',()=>{convertNameFields();renderPreview()});
 for(const id of ['convertToGujarati','convertFromGujarati']){
  const btn=$(id);if(btn)btn.addEventListener('click',()=>{convertNameFields();renderPreview()});
 }

 function loadTemplate(index){
  const arr=choice();const i=Number.isInteger(index)&&index>=0&&index<arr.length?index:0;
  title.value=titleFor(arr[i]||'',cat.value,lng.value);msg.value=arr[i]||'';
  $('createBack').href='wishes.html?c='+enc(cat.value)+'&l='+enc(lng.value);
  renderPreview();
 }
 function renderPreview(){
  const c=D.categories.find(x=>x.id===cat.value);
  $('previewEmoji').textContent=c.emoji;
  $('previewTitle').textContent=title.value||catName(c,lng.value);
  $('previewMsg').textContent=msg.value;
  $('previewTo').textContent=to.value?'પ્રિય '+localName(to.value)+',':'';
  $('previewFrom').textContent=from.value?'શુભેચ્છાઓ સાથે, '+localName(from.value):'દિલથી શુભેચ્છાઓ ♡';
 }
 function share(){
  const sender=localName(from.value),recipient=localName(to.value);
  return (recipient?'💌 *પ્રિય '+recipient+',*\n\n':'')+
    '*'+trim(title.value,100)+'*\n\n'+trim(msg.value,500)+
    (sender?'\n\n🌸 *શુભેચ્છાઓ સાથે — '+sender+'*':'')+
    '\n\n✨ ShubhLink · https://shubhlink.github.io/';
 }
 async function copy(text){
  try{
   if(navigator.clipboard&&isSecureContext)await navigator.clipboard.writeText(text);
   else{const el=document.createElement('textarea');el.value=text;el.style.position='fixed';el.style.left='-9999px';document.body.append(el);el.select();if(!document.execCommand('copy'))throw Error('copy');el.remove()}
   feedback.textContent='✓ કોપી થઈ ગયું';
  }catch{feedback.textContent='કોપી ન થયું. ફરી પ્રયત્ન કરો.'}
 }
 cat.addEventListener('change',()=>loadTemplate(0));lng.addEventListener('change',()=>{convertNameFields();loadTemplate(0)});
 [title,msg,to,from].forEach(x=>x.addEventListener('input',renderPreview));
 $('waShare').addEventListener('click',()=>window.ShubhShare.open({title:title.value,body:msg.value,recipient:to.value,sender:from.value,language:lng.value,category:cat.value}));
 $('copyMsg').addEventListener('click',()=>copy(share()));

 const n=Number(qs.get('i'));loadTemplate(n);
 if(qs.has('title'))title.value=trim(qs.get('title'),100);
 if(qs.has('m'))msg.value=trim(qs.get('m'),500);
 if(qs.has('t'))to.value=trim(qs.get('t'),50);
 if(qs.has('f'))from.value=trim(qs.get('f'),50);
 convertNameFields();renderPreview();
}
window.ShubhCore={D,dbTitleMap,dbFeatured,titleFor,catName};
return window.ShubhCore;
})();
