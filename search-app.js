/* ShubhLink diverse search: relevant results and a new batch on every repeat. */
(function(){
'use strict';
const $=id=>document.getElementById(id),C=window.ShubhCalendar;
const input=$('smartSearchInput');if(!input)return;
const form=$('smartSearchForm'),language=$('smartSearchLang'),meta=$('smartSearchCount'),holder=$('smartSearchResults'),next=$('smartLoadMore');
const params=new URLSearchParams(location.search);
const phrases={
 morning:['morning','good morning','સુપ્રભાત','સવાર','પ્રભાત','सुबह','सुप्रभात','savare','savare'],
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
const normalizedText=x=>norm(x.title+' '+x.body);
const genericTokens=new Set(['આજે','આજ','કાલે','શ્રી','જી','બાપા','જયંતિ','જન્મજયંતિ','જ્યંતિ','શુભ','પ્રસંગ','ખાસ','લાગણીભર્યો','ભવ્ય','સરસ','new','today','day','jayanti','special','festival','wishes','wish','happy','the','for','and','message','મેસેજ','શુભેચ્છા','પ્રિય','સુંદર','બનાવો','માટે','mara','meri','my','dear','श्री','जी','जयंती','शुभ','सुंदर','प्यारा','के','लिए']);
const synonyms={
 'બહેન':['બહેન','બેન','બહેને'],'બેન':['બહેન','બેન'],'મિત્ર':['મિત્ર','દોસ્ત','મિત્રતા'],
 'દોસ્ત':['દોસ્ત','મિત્ર','મિત્રતા'],'મા':['મા','માતા','મમ્મી'],'મમ્મી':['મા','માતા','મમ્મી'],
 'પિતા':['પિતા','પપ્પા','બાપુ'],'પપ્પા':['પિતા','પપ્પા','બાપુ'],
 'भाई':['भाई','भैया'],'बहन':['बहन','दीदी'],'friend':['friend','friendship','buddy'],
 'sister':['sister','sis'],'brother':['brother','bro'],'mother':['mother','mom','mum']
};
function containsTerm(text,term){
 const t=norm(term);
 if(!t)return false;
 return t.length<=3?text.split(' ').includes(t):text.includes(t);
}
function selectedEvent(q){
 const events=C?.findEvents(q)||[];
 if(!events.length)return null;
 const query=norm(q);
 return events.find(e=>[e.gu,e.hi,e.en,...e.aliases].some(name=>norm(name)===query))||
        events.find(e=>[e.gu,e.hi,e.en,...e.aliases].some(name=>query.includes(norm(name))&&norm(name).length>3))||
        events[0];
}
function eventRelevant(message,event){
 // A named festival/person must appear by its actual name or recognized alias.
 // A message about 'Holi' cannot qualify just because both occasions are festivals.
 if(message.category!=='festival')return false;
 const text=normalizedText(message);
 const variants=[event.gu,event.hi,event.en,...event.aliases]
  .map(norm).filter(x=>x.length>=3&&!genericTokens.has(x));
 return variants.some(alias=>containsTerm(text,alias));
}
function topicRelevant(message,q,cat,terms){
 if(cat&&message.category!==cat)return false;
 const text=normalizedText(message);
 const important=terms.filter(t=>!genericTokens.has(t)&&!kindTerms.has(t));
 if(important.length){
  return important.every(token=>(synonyms[token]||[token]).some(alias=>containsTerm(text,alias)));
 }
 // A general category query (e.g. 'જન્મદિવસ') intentionally returns its category.
 if(cat)return true;
 // An unknown search has no category fallback: show zero rather than off-topic wishes.
 return text.includes(norm(q));
}
function getPool(q,locale){
 const event=selectedEvent(q);
 const cat=category(q);
 const parts=wordParts(q);
 let list=library.filter(x=>x.language===locale);
 if(q){
  list=list.filter(x=>event?eventRelevant(x,event):topicRelevant(x,q,cat,parts));
 }else{
  const active=C?.currentCategory()||'morning';
  list=list.filter(x=>x.category===active);
 }
 const ranked=list.map(x=>({...x,score:score(x,q,cat,parts)}));
 // Featured and freshly added messages come first, but don't hide relevant older wishes.
 ranked.sort((a,b)=>Number(b.featured)-Number(a.featured)||b.score-a.score);
 return ranked;
}
function batch(){
 if(!pool.length){
  holder.replaceChildren();
  const noResults=document.createElement('div');noResults.className='search-empty';
  const heading=document.createElement('strong');heading.textContent='આ વિષયના તૈયાર મેસેજ મળ્યા નથી.';
  const body=document.createElement('p');body.textContent='બીજા પ્રસંગના મેસેજ બતાવવાના બદલે અહીં તમારા વિષય માટે AI થી નવો મેસેજ બનાવો.';
  const a=document.createElement('a');const u=new URL('ai.html',location.href);
  if(currentQuery)u.searchParams.set('q',currentQuery);u.searchParams.set('l',lang());
  a.href=u.href;a.textContent='✦ AI માં આ વિષયનો મેસેજ બનાવો';
  noResults.append(heading,body,a);holder.append(noResults);
  meta.textContent='0 સંબંધિત મેસેજ';next.hidden=true;return
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
function search(q,updateURL=true){
 const text=String(q||'').trim().slice(0,100);
 currentQuery=text;
 currentKey=lang()+'|'+norm(text);
 pool=getPool(text,lang());
 if(updateURL){
  const url=new URL(location.href);
  if(text)url.searchParams.set('q',text);else url.searchParams.delete('q');
  url.searchParams.set('l',lang());
  history.replaceState(null,'',url)
 }
 batch();
}

input.value=params.get('q')||'';
language.value=['gu','hi','en'].includes(params.get('l'))?params.get('l'):'gu';
input.oninput=()=>{};
form.onsubmit=e=>{e.preventDefault();search(input.value)};
language.onchange=()=>search(input.value);
next.onclick=()=>batch();
if(window.SHUBH_DATA_READY?.then)window.SHUBH_DATA_READY.then(c=>{core=c;library=build();search(input.value,false)}).catch(()=>{meta.textContent='હમણાં મેસેજ લોડ ન થયા.'});
else meta.textContent='મેસેજ લોડ થઈ રહ્યા છે...';
})();
