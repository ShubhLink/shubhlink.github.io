
window.SHUBH_DATA_READY=(async function(){
'use strict';
const D=window.SHUBHLINK_DATA;if(!D)return;
const backend=window.SHUBHLINK_BACKEND||{};
const dbTitleMap=new Map();
const dbFeatured=new Set();
if(backend.url&&backend.publishableKey){
 try{
  const root=backend.url.replace(/\/$/,'');
  const headers={apikey:backend.publishableKey};
  const catRequest=fetch(root+'/rest/v1/shubhlink_categories?select=id,emoji,name_gu,name_hi,name_en,description_gu,color&is_active=eq.true',{headers,cache:'no-store'});
  const messages=[];
  for(let offset=0;offset<10000;offset+=500){
   const url=root+'/rest/v1/shubhlink_messages?select=id,category_id,language,title,body,featured&is_published=eq.true&order=created_at.desc,id.desc&limit=500&offset='+offset;
   const response=await fetch(url,{headers,cache:'no-store'});
   if(!response.ok)throw Error('Published messages could not load');
   const page=await response.json();
   messages.push(...page);
   if(page.length<500)break;
  }
  const catResponse=await catRequest;
  if(!catResponse.ok)throw Error('Categories could not load');
  const cats=await catResponse.json();
  for(const c of cats){
   if(!D.categories.some(x=>x.id===c.id)){
    D.categories.push({id:c.id,emoji:c.emoji,gu:c.name_gu,hi:c.name_hi,en:c.name_en,desc:c.description_gu,color:c.color||'pink'});
   }
  }
  const newWishes={};
  for(const m of messages){
   if(!['gu','hi','en'].includes(m.language))continue;
   if(m.title)dbTitleMap.set(m.language+'|'+m.category_id+'|'+m.body,m.title);
   if(m.featured)dbFeatured.add(m.language+'|'+m.category_id+'|'+m.body);
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
 const emoji=document.createElement('span');emoji.className='catemoji';emoji.textContent=c.emoji;
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
  $('dailyQuote').textContent=(window.ShubhFresh?.pick(premium.length?premium:arr,'daily-quote')||arr[0]);
 }
}
if($('allCats')){
 const first=window.ShubhCalendar?.currentCategory()||'morning';
 const hasEvent=(window.ShubhCalendar?.todayEvents()||[]).length>0;
 const ids=[first,...(hasEvent?['festival']:[]),...D.categories.map(x=>x.id)];
 const done=new Set();
 for(const id of ids){if(done.has(id))continue;done.add(id);const cat=D.categories.find(c=>c.id===id);if(cat)$('allCats').append(catCard(cat))}
}
if($('wishGrid')){
 const csel=$('filterCat'),lsel=$('filterLang'),search=$('filterSearch');
 D.categories.forEach(c=>{const o=document.createElement('option');o.value=c.id;o.textContent=c.emoji+' '+c.gu;csel.add(o)});
 csel.value=firstCat;lsel.value=firstLang;
 let lastKey='',more=null;
 function render(loadMore=false){
  const c=csel.value,l=lsel.value,cat=D.categories.find(x=>x.id===c),q=trim(search.value).toLocaleLowerCase();
  const all=(D.wishes[l]?.[c]||[]).map((msg,i)=>({msg,i,featured:dbFeatured.has(l+'|'+c+'|'+msg)}));
  $('wishHeading').textContent=cat.emoji+' '+catName(cat,l);
  $('wishIntro').textContent='';
  const grid=$('wishGrid');grid.replaceChildren();
  let filtered=all.filter(x=>!q||((x.msg+' '+titleFor(x.msg,c,l)).toLocaleLowerCase().includes(q)));
  const premium=filtered.filter(x=>x.featured);
  // Curated originals appear first; low-quality formula combinations remain a fallback.
  if(!q&&premium.length>=6)filtered=premium;
  const key='category:'+l+':'+c+':'+q;
  if(key!==lastKey)lastKey=key;
  const batchSize=Math.min(8,Math.max(4,Math.ceil(filtered.length*0.64)));
  const selection=window.ShubhFresh?.choose(filtered,key,batchSize,{quality:x=>x.featured?100:0})||filtered.slice(0,batchSize);
  for(const item of selection){
   const msg=item.msg,topic=titleFor(msg,c,l);
   const card=document.createElement('article');card.className='wishitem';
   const tag=document.createElement('span');tag.className='wishtag';tag.textContent=cat.emoji+' '+catName(cat,l);
   const h=document.createElement('h3');h.textContent=topic;
   const p=document.createElement('p');p.textContent=msg;
   const actions=document.createElement('div');actions.className='wish-actions';
   const wa=document.createElement('button');wa.className='wish-whatsapp';wa.type='button';wa.textContent='◉ WhatsApp પર શેર કરો';
   wa.addEventListener('click',()=>window.ShubhShare.open({title:topic,body:msg,language:l,category:c}));
   actions.append(wa);card.append(tag,h,p,actions);grid.append(card);
  }
  $('resultMeta').textContent=selection.length+' નવા મેસેજ · '+filtered.length+' ઉપલબ્ધ';
  if(!filtered.length){
   const empty=document.createElement('p');empty.className='empty';empty.textContent='આ વિષય માટે મેસેજ નથી મળ્યો. AI Studio માં નવો મેસેજ બનાવો.';grid.append(empty)
  }
  if(!more){
   more=document.createElement('button');more.type='button';more.className='search-more shubh-more';
   more.textContent='↻ બીજા અલગ મેસેજ જુઓ';
   grid.after(more);
   more.addEventListener('click',()=>render(true));
  }
  more.hidden=filtered.length<=selection.length;
  const url=new URL(location.href);url.searchParams.set('c',c);url.searchParams.set('l',l);history.replaceState(null,'',url);
 }
 csel.addEventListener('change',render);lsel.addEventListener('change',render);search.addEventListener('input',render);render();
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
