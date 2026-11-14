/* ShubhLink diverse search: relevant results and a new batch on every repeat. */
(function(){
'use strict';
const $=id=>document.getElementById(id),C=window.ShubhCalendar;
const input=$('smartSearchInput');if(!input)return;
const form=$('smartSearchForm'),language=$('smartSearchLang'),meta=$('smartSearchCount'),holder=$('smartSearchResults'),next=$('smartLoadMore'),aiLink=$('aiGenerateLink');
const params=new URLSearchParams(location.search);
const phrases={
 morning:['morning','good morning','સુપ્રભાત','સવાર','પ્રભાત','सुबह','सुप्रभात','savare','savare'],
 afternoon:['afternoon','બપોર','શુભ બપોર','दोपहर','bapor'],
 night:['night','good night','શુભરાત્રિ','રાત','शुभरात्रि','नींद','sleep'],
 birthday:['birthday','bday','happy birthday','જન્મદિવસ','બર્થડે','જન્મદિન','janamdin','जन्मदिन','बर्थडे'],
 suvichar:['suvichar','સુવિચાર','विचार','wisdom','quote','quotes','સત્ય','વિચાર','વિચારશીલ'],
 newthought:['motivation','inspiration','motivate','નવા વિચાર','પ્રેરણા','नई सोच','प्रेरणा','success','સફળતા'],
 friendship:['friend','dost','દોસ્ત','મિત્ર','મિત્રતા','मित्र','दोस्ती','friendship','yaar','યાર'],
 festival:['festival','તહેવાર','त्योहार','festive','diwali','દિવાળી','દીપાવલી','navratri','ગરબા','holi','holi','દશેરા','દેવ દિવાળી'],
 anniversary:['anniversary','wedding','લગ્ન','વર્ષગાંઠ','સાલગિરહ','शादी','सालगिरह','marriage'],
 congrats:['congratulations','congrats','અભિનંદન','બધાઈ','बधाई','જીત','promotion','new job']
};
const stop=new Set(['for','and','with','message','messages','msg','wishes','wish','send','to','my','the','a','of','best','please','મેસેજ','માટે','સંદેશ','શુભેચ્છા','मेसेज','संदेश','के','लिए','કરો','આપો','બનાવો','મારું','મારી']);
const norm=s=>C?.normalize(s)||String(s||'').toLocaleLowerCase().trim();
const wordParts=q=>norm(q).split(' ').filter(x=>x.length>1&&!stop.has(x));
const shuffle=arr=>{
 const out=[...arr];
 for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]]}
 return out;
};
const kindTerms=new Set(Object.values(phrases).flat().map(norm));
let core=null,library=[],pool=[],currentKey='',currentQuery='';
const aiButton=$('smartAiGenerate'),aiResults=$('smartAiResults'),aiStatus=$('smartAiStatus');
const lang=()=>['gu','hi','en'].includes(language.value)?language.value:'gu';
function category(q){
 const query=norm(q);let choice=null,best=0;
 for(const [cat,words] of Object.entries(phrases)){
  for(const word of words){
   const term=norm(word);
   if(term.length>=2&&query.includes(term)){
    const score=term.length+(query===term?10:0);
    if(score>best){best=score;choice=cat}
   }
  }
 }
 if(!choice&&C?.findEvents(query).length)choice='festival';
 return choice
}
function build(){
 const out=[];const featured=core.dbFeatured||new Set();
 for(const langCode of ['gu','hi','en']){
  for(const [c,wishes] of Object.entries(core.D.wishes[langCode]||{})){
   for(let i=0;i<wishes.length;i++){
    const body=wishes[i];
    out.push({category:c,language:langCode,title:core.titleFor(body,c,langCode),body,featured:featured.has(langCode+'|'+c+'|'+body),event:false})
   }
  }
 }
 return out;
}
function score(m,q,c,parts){
 const txt=norm(m.title+' '+m.body);
 let value=0;
 if(c&&m.category===c)value+=72;
 if(q&&txt.includes(norm(q)))value+=85;
 for(const token of parts){
  if(kindTerms.has(token))continue;
  const words=txt.split(' ');
  const exact=token.length<=3?words.includes(token):txt.includes(token);
  if(exact)value+=29;
  else if(token.length>5&&txt.includes(token.slice(0,token.length-1)))value+=7;
 }
 if(!q&&m.category===(C?.currentCategory()||'morning'))value+=60;
 return value>0&&m.featured?value+44:value;
}
function getPool(q,locale){
 const c=category(q),parts=wordParts(q);
 let list=library.filter(x=>x.language===locale).map(x=>({...x,score:score(x,q,c,parts)}));
 if(q){
  // Never pretend a message is relevant merely because it is popular.
  if(c)list=list.filter(x=>x.category===c||x.score>=130);
  else list=list.filter(x=>x.score>=25);
  const proper=parts.filter(x=>!kindTerms.has(x));
  if(proper.length){
   const specificallyRelated=list.filter(x=>proper.some(t=>norm(x.title+' '+x.body).includes(t)));
   if(specificallyRelated.length>=3)list=specificallyRelated;
  }
 }else{
  const active=C?.currentCategory()||'morning';
  list=list.filter(x=>x.category===active);
 }
 const premium=list.filter(x=>x.featured);
 // The formula-combined 2026 bulk messages are retained only as fallbacks;
 // curated, hand-written originals are preferred when sufficient.
 if(premium.length>=3)return premium;
 return list;
}
function batch(){
 if(!pool.length){
  holder.replaceChildren();meta.textContent='આ વિષય માટે તૈયાર મેસેજ મળ્યા નથી. ✦ AI થી નવો મેસેજ બનાવો.';
  next.hidden=true;return
 }
 const size=Math.min(9,pool.length);
 const chosen=window.ShubhFresh?.choose(pool,'search:'+currentKey,size,{quality:x=>x.score+(x.featured?95:0)})||shuffle(pool).slice(0,size);
 holder.replaceChildren();
 for(const item of chosen)holder.append(card(item));
 meta.textContent=chosen.length+' મેસેજ · '+pool.length+' ઉપલબ્ધ';
 next.hidden=pool.length<=size;
}
async function copyText(text,button){
 try{
  if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(text);
  else{const el=document.createElement('textarea');el.value=text;el.style.position='fixed';el.style.left='-9999px';document.body.append(el);el.select();document.execCommand('copy');el.remove()}
  const original=button.textContent;button.textContent='✓ કોપી';setTimeout(()=>button.textContent=original,1250)
 }catch{button.textContent='કોપી ન થયું'}
}
function card(it){
 const node=document.createElement('article');node.className='search-message';
 const label=document.createElement('div');label.className='s-label';
 const group=core.D.categories.find(x=>x.id===it.category);
 label.textContent=(it.event?'✨ ':'')+(group?.[it.language]||group?.gu||it.category);
 const head=document.createElement('h3');head.textContent=it.title;
 const body=document.createElement('p');body.textContent=it.body;
 const actions=document.createElement('div');actions.className='search-actions';
 const wa=document.createElement('button');
 wa.type='button';wa.className='search-whatsapp';
 wa.textContent='◉ WhatsApp પર શેર કરો';
 wa.addEventListener('click',()=>window.ShubhShare.open({title:it.title,body:it.body,language:it.language,category:it.category}));
 actions.append(wa);node.append(label,head,body,actions);return node
}
function setLink(q){
 const u=new URL('ai.html',location.href);
 if(q.trim())u.searchParams.set('q',q.trim().slice(0,100));
 u.searchParams.set('l',lang());
 aiLink.href=u.href;
}
function search(q,updateURL=true){
 const text=String(q||'').trim().slice(0,100);
 currentQuery=text;
 currentKey=lang()+'|'+norm(text);
 pool=getPool(text,lang());
 setLink(text);
 if(updateURL){
  const url=new URL(location.href);
  if(text)url.searchParams.set('q',text);else url.searchParams.delete('q');
  url.searchParams.set('l',lang());
  history.replaceState(null,'',url)
 }
 batch();
}

function aiStorageKey(q){return 'shubhlink_ai_search_history_'+lang()+'_'+norm(q).slice(0,65)}
function readAiHistory(q){
 try{const a=JSON.parse(sessionStorage.getItem(aiStorageKey(q))||'[]');return Array.isArray(a)?a.slice(-9):[]}catch(_){return []}
}
function storeAiHistory(q,messages){
 try{const arr=[...readAiHistory(q),...messages].slice(-9);sessionStorage.setItem(aiStorageKey(q),JSON.stringify(arr))}catch(_){}
}
function aiError(code){
 const errors={
  rate_limit:'આજની AI મેસેજ મર્યાદા પૂરી થઈ છે.',
  ai_quota_exceeded:'Google AI ની મફત મર્યાદા હાલ પૂરી છે.',
  ai_provider_busy:'AI થોડું વ્યસ્ત છે, ફરી પ્રયાસ કરો.',
  ai_model_unavailable:'AI મોડેલ ઉપલબ્ધ નથી.',
  ai_temporarily_unavailable:'હમણાં AI મેસેજ બન્યા નથી, થોડા સમય પછી ફરી અજમાવો.'
 };
 return errors[code]||'હમણાં AI મેસેજ નથી બન્યા. ફરી પ્રયાસ કરો.';
}
async function generateAI(){
 const languageCode=lang();
 const q=input.value.trim().slice(0,100)||{
  gu:'આજના દિવસ માટે એક સરસ અને અનોખો શુભેચ્છા મેસેજ',
  hi:'आज के लिए नया और सुंदर शुभकामना संदेश',
  en:'A fresh, original message to share today'
 }[languageCode];
 const cfg=window.SHUBHLINK_BACKEND||{};
 if(!cfg.url||!cfg.publishableKey){aiStatus.textContent='હમણાં AI ઉપલબ્ધ નથી.';return}
 aiButton.disabled=true;aiStatus.textContent='નવા શબ્દો રચાઈ રહ્યા છે...';aiResults.hidden=true;aiResults.replaceChildren();
 try{
  const recent=readAiHistory(q);
  const avoids=[...recent,...pool.filter(x=>x.featured).slice(0,3).map(x=>x.body)].slice(-9);
  const res=await fetch(cfg.url.replace(/\/$/,'')+'/functions/v1/compose-wish',{
   method:'POST',headers:{'Content-Type':'application/json',apikey:cfg.publishableKey},
   body:JSON.stringify({topic:q,language:languageCode,tone:'warm',avoid:avoids})
  });
  const data=await res.json().catch(()=>({}));
  if(!res.ok)throw Error(aiError(data.error));
  const messages=Array.isArray(data.messages)?data.messages.filter(x=>typeof x==='string'&&x.trim().length>=20).slice(0,3):[];
  if(!messages.length)throw Error('મેસેજ બન્યા નથી. ફરી પ્રયાસ કરો.');
  storeAiHistory(q,messages);
  const caption={gu:'✦ નવો AI મેસેજ',hi:'✦ नया AI संदेश',en:'✦ Fresh AI message'}[languageCode];
  for(let i=0;i<messages.length;i++){
   aiResults.append(card({title:caption+' '+(i+1),body:messages[i],category:category(q)||'newthought',language:languageCode,event:false,featured:true}))
  }
  aiResults.hidden=false;
  aiStatus.textContent='✦ 3 નવા મેસેજ તૈયાર';
  aiResults.scrollIntoView({block:'nearest',behavior:'smooth'});
 }catch(e){aiStatus.textContent=e?.message||'હમણાં AI મેસેજ મળ્યા નથી.'}
 finally{aiButton.disabled=false}
}
aiButton?.addEventListener('click',generateAI);

input.value=params.get('q')||'';
language.value=['gu','hi','en'].includes(params.get('l'))?params.get('l'):'gu';
input.oninput=()=>setLink(input.value);
form.onsubmit=e=>{e.preventDefault();search(input.value);aiResults.hidden=true;aiStatus.textContent=''};
language.onchange=()=>{search(input.value);aiResults.hidden=true;aiStatus.textContent=''};
next.onclick=()=>batch();
if(window.SHUBH_DATA_READY?.then)window.SHUBH_DATA_READY.then(c=>{core=c;library=build();search(input.value,false)}).catch(()=>{meta.textContent='હમણાં મેસેજ લોડ ન થયા.'});
else meta.textContent='મેસેજ લોડ થઈ રહ્યા છે...';
})();
