
(async function(){
'use strict';
const D=window.SHUBHLINK_DATA;if(!D)return;
const backend=window.SHUBHLINK_BACKEND||{};
const dbTitleMap=new Map();
if(backend.url&&backend.publishableKey){
 try{
  const root=backend.url.replace(/\/$/,'');
  const headers={apikey:backend.publishableKey};
  const catRequest=fetch(root+'/rest/v1/shubhlink_categories?select=id,emoji,name_gu,name_hi,name_en,description_gu,color&is_active=eq.true',{headers,cache:'no-store'});
  const messages=[];
  for(let offset=0;offset<10000;offset+=500){
   const url=root+'/rest/v1/shubhlink_messages?select=id,category_id,language,title,body&is_published=eq.true&order=created_at.desc,id.desc&limit=500&offset='+offset;
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
const firstCat=catIds.includes(qs.get('c'))?qs.get('c'):'morning';
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
 const desc=document.createElement('small');desc.textContent=c.desc;const go=document.createElement('span');go.className='catgo';go.textContent='મેસેજ જુઓ →';
 const arrow=document.createElement('span');arrow.className='arrow';arrow.textContent='↗';
 a.append(arrow,emoji,title,desc,go);return a;
}
if($('homeCats')){
 D.categories.slice(0,8).forEach(c=>$('homeCats').append(catCard(c)));
 const arr=D.wishes.gu.suvichar||[];
 if(arr.length)$('dailyQuote').textContent=arr[Math.floor(Date.now()/86400000)%arr.length];
}
if($('allCats'))D.categories.forEach(c=>$('allCats').append(catCard(c)));
if($('wishGrid')){
 const csel=$('filterCat'),lsel=$('filterLang'),search=$('filterSearch');
 D.categories.forEach(c=>{const o=document.createElement('option');o.value=c.id;o.textContent=c.emoji+' '+c.gu;csel.add(o)});
 csel.value=firstCat;lsel.value=firstLang;
 function render(){
  const c=csel.value,l=lsel.value,cat=D.categories.find(x=>x.id===c),arr=D.wishes[l]?.[c]||[],q=trim(search.value).toLocaleLowerCase();
  $('wishHeading').textContent=cat.emoji+' '+catName(cat,l)+' માટે તૈયાર મેસેજ';
  $('wishIntro').textContent='તમને ગમે તે મેસેજ પસંદ કરો અને પછી નામ ઉમેરી WhatsApp પર શેર કરો.';
  const grid=$('wishGrid');grid.replaceChildren();
  let count=0;
  arr.forEach((msg,i)=>{
   const topic=titleFor(msg,c,l);
   if(q&&!(msg+' '+topic).toLocaleLowerCase().includes(q))return;
   count++;
   const card=document.createElement('article');card.className='wishitem';
   const tag=document.createElement('span');tag.className='wishtag';tag.textContent=cat.emoji+' '+catName(cat,l);
   const h=document.createElement('h3');h.textContent=topic;
   const p=document.createElement('p');p.textContent=msg.slice(0,160)+(msg.length>160?'…':'');
   const actions=document.createElement('div');actions.className='wish-actions';
   const a=document.createElement('a');a.href='create.html?c='+enc(c)+'&l='+enc(l)+'&i='+i;a.className='wish-edit';a.textContent='✎ નામ ઉમેરો';
   const wa=document.createElement('a');wa.className='wish-whatsapp';wa.href='https://api.whatsapp.com/send?text='+enc('✨ *'+topic+'*\n\n'+msg+'\n\n🔗 https://shubhlink.github.io/');wa.target='_blank';wa.rel='noopener noreferrer';wa.setAttribute('aria-label','WhatsApp પર શેર કરો');
   wa.innerHTML="<svg class=\"wa-icon\" aria-hidden=\"true\" viewBox=\"0 0 24 24\" width=\"22\" height=\"22\" fill=\"currentColor\"><path d=\"M20.52 3.48A11.87 11.87 0 0 0 12.05 0C5.46 0 .08 5.35.07 11.95c0 2.1.55 4.14 1.59 5.94L0 24l6.28-1.65a12 12 0 0 0 5.76 1.47h.01c6.59 0 11.96-5.36 11.97-11.95a11.86 11.86 0 0 0-3.5-8.39Zm-8.47 18.3a9.9 9.9 0 0 1-5.04-1.38l-.36-.22-3.73.98.99-3.63-.24-.37a9.88 9.88 0 0 1-1.52-5.21c0-5.47 4.45-9.92 9.92-9.92a9.86 9.86 0 0 1 7.01 2.92 9.88 9.88 0 0 1 2.9 7.02c0 5.47-4.46 9.91-9.93 9.91Zm5.44-7.42c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.23-.65.08-.3-.15-1.26-.46-2.4-1.47-.88-.78-1.47-1.74-1.64-2.04-.18-.3-.02-.46.13-.61.13-.13.3-.35.45-.53.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.88 1.22 3.08c.15.2 2.1 3.21 5.08 4.5.71.31 1.27.5 1.71.64.72.23 1.38.2 1.9.12.58-.08 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.08-.12-.27-.2-.57-.35Z\"/></svg><span>WhatsApp શેર</span>";
   actions.append(a,wa);card.append(tag,h,p,actions);grid.append(card);
  });
  $('resultMeta').textContent=count+' મેસેજ ઉપલબ્ધ';
  if(!count){const empty=document.createElement('p');empty.className='empty';empty.textContent='આ વિષય માટે મેસેજ નથી મળ્યો. બીજા શબ્દો શોધો.';grid.append(empty)}
  const url=new URL(location.href);url.searchParams.set('c',c);url.searchParams.set('l',l);history.replaceState(null,'',url);
 }
 csel.addEventListener('change',render);lsel.addEventListener('change',render);search.addEventListener('input',render);render();
}
if($('editCat')){
 const cat=$('editCat'),lng=$('editLang'),title=$('editTitle'),msg=$('editMsg'),to=$('editTo'),from=$('editFrom'),feedback=$('feedback');
 D.categories.forEach(c=>{const o=document.createElement('option');o.value=c.id;o.textContent=c.emoji+' '+c.gu;cat.add(o)});
 cat.value=firstCat;lng.value=firstLang;
 const choice=()=>D.wishes[lng.value]?.[cat.value]||[];
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
  $('previewTo').textContent=to.value?'પ્રિય '+trim(to.value,50)+',':'';
  $('previewFrom').textContent=from.value?'શુભેચ્છાઓ સાથે, '+trim(from.value,50):'દિલથી શુભેચ્છાઓ ♡';
 }
 function link(){
  const u=new URL('create.html',location.href);
  const vals={c:cat.value,l:lng.value,title:trim(title.value,100),m:trim(msg.value,500),t:trim(to.value,50),f:trim(from.value,50)};
  Object.entries(vals).forEach(([k,v])=>{if(v)u.searchParams.set(k,v)});
  return u.href;
 }
 function share(){
  const sender=trim(from.value,50),recipient=trim(to.value,50);
  return (recipient?'💌 *પ્રિય '+recipient+',*\n\n':'')+'*'+trim(title.value,100)+'*\n\n'+trim(msg.value,500)+(sender?'\n\n🌸 *શુભેચ્છાઓ સાથે — '+sender+'*':'')+'\n\n🔗 '+link();
 }
 async function copy(text){
  try{
   if(navigator.clipboard&&isSecureContext)await navigator.clipboard.writeText(text);
   else{const el=document.createElement('textarea');el.value=text;el.style.position='fixed';el.style.left='-9999px';document.body.append(el);el.select();if(!document.execCommand('copy'))throw Error('copy');el.remove()}
   feedback.textContent='✓ કોપી થઈ ગયું';
  }catch{feedback.textContent='કોપી ન થયું. ફરી પ્રયત્ન કરો.'}
 }
 cat.addEventListener('change',()=>loadTemplate(0));lng.addEventListener('change',()=>loadTemplate(0));
 [title,msg,to,from].forEach(x=>x.addEventListener('input',renderPreview));
 $('waShare').addEventListener('click',()=>{window.open('https://api.whatsapp.com/send?text='+enc(share()),'_blank','noopener')});
 $('copyMsg').addEventListener('click',()=>copy(share().split('\n\n🔗 ')[0]));
 $('copyLink').addEventListener('click',()=>copy(link()));
 const n=Number(qs.get('i'));loadTemplate(n);
 if(qs.has('title'))title.value=trim(qs.get('title'),100);
 if(qs.has('m'))msg.value=trim(qs.get('m'),500);
 if(qs.has('t'))to.value=trim(qs.get('t'),50);
 if(qs.has('f'))from.value=trim(qs.get('f'),50);
 renderPreview();
}
})();
