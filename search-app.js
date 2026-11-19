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
 for(const m of (window.ShubhDaily?.all()||[])){
  if(!m?.body||!m?.category||!m?.language)continue;
  out.push({category:m.category,language:m.language,title:core.titleFor(m.body,m.category,m.language),body:m.body,featured:false,event:false});
 }
 const seen=new Set();return out.filter(m=>{const key=m.language+"|"+m.category+"|"+m.body.trim().toLocaleLowerCase();if(seen.has(key))return false;seen.add(key);return true});
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
 'દીકરો':['દીકરો','દીકરા','દીકરાને','દીકરાનો','દીકરાના'],'દીકરી':['દીકરી','દીકરીને','દીકરીનો','દીકરીની'],
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
 // More specific festivals must not leak into a broader exact event search:
 // "દિવાળી" != "દેવ દિવાળી"; "નવું વર્ષ" != "ગુજરાતી નવું વર્ષ".
 const ownName=norm(event.gu);
 const differentLonger=(C?.events||[]).filter(other=>{
  const otherName=norm(other.gu);
  return otherName!==ownName&&otherName.length>ownName.length&&otherName.includes(ownName);
 });
 if(differentLonger.some(other=>text.includes(norm(other.gu))))return false;
 const sharedAliases=new Set((C?.events||[])
  .filter(other=>other.gu!==event.gu)
  .flatMap(other=>[other.gu,other.hi,other.en,...other.aliases]).map(norm));
 const ownNames=new Set([event.gu,event.hi,event.en].map(norm));
 const variants=[event.gu,event.hi,event.en,...event.aliases]
  .map(norm).filter(x=>x.length>=3&&!genericTokens.has(x)&&(!sharedAliases.has(x)||ownNames.has(x)));
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
 const world=window.ShubhWorldFestivals?.match(q);
 if(world)return window.ShubhWorldFestivals.messages(world,locale).map(x=>({...x,score:1000}));
 const topic=window.ShubhSearchTopics?.match(q);
 const event=topic?null:selectedEvent(q);
 const cat=category(q);
 const parts=wordParts(q);
 let list=library.filter(x=>x.language===locale);
 if(topic){
  const aliases=topic.aliases.map(norm);
  const matches=list.filter(m=>m.category===topic.category&&aliases.some(a=>a.length>3&&normalizedText(m).includes(a)));
  const prepared=window.ShubhSearchTopics.messages(topic,locale);
  const seen=new Set();
  list=[...prepared,...matches].filter(m=>{const k=norm(m.body);if(seen.has(k))return false;seen.add(k);return true});
 }else if(q){
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
async function generateUnknownFestival(){
 const q=currentQuery.trim();if(!q)return;
 const btn=document.getElementById('searchAiGenerate');if(btn){btn.disabled=true;btn.textContent='AI મેસેજ બનાવી રહ્યું છે...'}
 const config=window.SHUBHLINK_BACKEND||{};
 if(!config.url||!config.publishableKey){if(btn){btn.disabled=false;btn.textContent='AI ઉપલબ્ધ નથી — AI Studio ખોલો'}return}
 try{
  const instruction='The user searched for the cultural/religious festival or occasion: '+q+'. First assess whether it is a real named festival. If real, create culturally appropriate greetings specifically for that festival, without inventing dates, rituals, religious beliefs, historical claims, or unrelated holidays. If ambiguous or unknown, do not invent facts: write neutral greetings that explicitly mention the searched name. No unrelated festival greetings.';
  const response=await fetch(config.url.replace(/\\/$/,'')+'/functions/v1/compose-wish',{method:'POST',headers:{'content-type':'application/json','apikey':config.publishableKey},body:JSON.stringify({topic:q,language:lang(),tone:'warm',instruction,history:[],avoid:[]})});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw Error(data.error||'AI હમણાં ઉપલબ્ધ નથી');
  const messages=(Array.isArray(data.messages)?data.messages:[]).filter(x=>typeof x==='string'&&x.trim().length>10).slice(0,3);
  if(!messages.length)throw Error('મેસેજ મળ્યા નથી');
  pool=messages.map(body=>({category:'festival',language:lang(),title:q+' · શુભેચ્છાઓ',body,event:true,featured:false,score:1000}));
  batch();const note=document.createElement('p');note.className='search-ai-note';note.textContent='✦ આ મેસેજ AI દ્વારા બનાવાયા છે. અજાણ્યા તહેવાર વિશેની પરંપરા અને વિગતો જાતે ચકાસો.';holder.prepend(note);
 }catch(err){if(btn){btn.disabled=false;btn.textContent='ફરી AI મેસેજ બનાવો'}const note=document.createElement('p');note.className='search-ai-note';note.textContent='AI સેવા હાલમાં જવાબ આપી શકી નથી. AI Studio માં ફરી પ્રયાસ કરો.';holder.append(note)}
}
function batch(){
 if(!pool.length){
  holder.replaceChildren();
  const noResults=document.createElement('div');noResults.className='search-empty';
  const heading=document.createElement('strong');heading.textContent='આ વિષયના તૈયાર મેસેજ મળ્યા નથી.';
  const body=document.createElement('p');body.textContent='હાલની મેસેજ લાઇબ્રેરીમાં આ ચોક્કસ વિષય મળ્યો નથી. AI માં આ જ વિષય લખીને નવો મેસેજ બનાવી શકો છો.';
  const a=document.createElement('a');const u=new URL('ai.html',location.href);
  if(currentQuery)u.searchParams.set('q',currentQuery);u.searchParams.set('l',lang());
  a.href=u.href;a.textContent='✦ AI માં આ વિષયનો મેસેજ બનાવો';
  const generate=document.createElement('button');generate.type='button';generate.id='searchAiGenerate';generate.className='search-more';generate.textContent='✦ આ વિષયના AI મેસેજ બનાવો';generate.onclick=generateUnknownFestival;if(currentQuery.trim().length>2)noResults.append(heading,body,generate,a);else noResults.append(heading,body,a);holder.append(noResults);
  meta.textContent='0 સંબંધિત મેસેજ';next.hidden=true;return
 }
 const size=Math.min(9,pool.length);
 const chosen=pool.slice(0,size);
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
 wa.type='button';wa.className='wish-whatsapp search-whatsapp';
 wa.innerHTML='<svg class="wa-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 3.5A11.8 11.8 0 0 0 2.1 17.7L.5 23.5l5.9-1.6A11.8 11.8 0 1 0 20.5 3.5Zm-8.5 18a9.5 9.5 0 0 1-4.8-1.3l-.3-.2-3.5 1 1-3.4-.2-.4A9.5 9.5 0 1 1 12 21.5Zm5.3-7.1c-.3-.1-1.7-.8-2-1-.3-.1-.5-.1-.7.2s-.8 1-1 1.2c-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.7l.5-.6.3-.5c.1-.2 0-.4 0-.6l-.9-2.1c-.2-.5-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4s-1.2 1.2-1.2 2.8 1.2 3.2 1.4 3.4 2.4 3.6 5.7 4.9c.8.3 1.4.5 1.9.6.8.2 1.5.2 2.1.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3Z"/></svg><span>શેર કરો</span>';
 wa.addEventListener('click',()=>window.ShubhShare.open({title:it.title,body:it.body,language:it.language,category:it.category}));
 const other=document.createElement('button');other.type='button';other.className='share-secondary';other.setAttribute('aria-label','અન્ય એપમાં શેર કરો');other.innerHTML='<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.7 10.7 6.6-4.4M8.7 13.3l6.6 4.4"/></svg>';other.onclick=async()=>{const text=it.title+'\n'+it.body;try{if(navigator.share)await navigator.share({text});else await copyText(text,other)}catch(e){if(e.name!=='AbortError')await copyText(text,other)}};actions.append(wa,other);node.append(label,head,body,actions);return node
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
document.addEventListener('shubh-daily-ready',()=>{if(core){library=build();search(input.value,false)}});
})();
