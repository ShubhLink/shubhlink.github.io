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
let core=null,library=[],pool=[],seenByQuery=new Map(),currentKey='',currentQuery='';
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
 let value=m.featured?44:0;
 if(c&&m.category===c)value+=72;
 if(q&&txt.includes(norm(q)))value+=85;
 for(const token of parts){
  if(kindTerms.has(token))continue;
  if(txt.includes(token))value+=29;
  else if(txt.includes(token.slice(0,Math.max(3,token.length-1))))value+=7;
 }
 if(!q&&m.category===(C?.currentCategory()||'morning'))value+=60;
 return value;
}
function eventMessages(query,locale){
 if(!query||!C)return [];
 const matches=C.findEvents(query);
 const unique=new Map();
 for(const e of matches){if(!unique.has(e.gu))unique.set(e.gu,e)}
 const arr=[...unique.values()].sort((a,b)=>{
  const rank=e=>([e.gu,e.hi,e.en,...e.aliases].some(x=>norm(x)===norm(query))?100:10);
  return rank(b)-rank(a)
 }).slice(0,2);
 const samples={
 gu:[
  e=>'🌼 '+e.gu+'નો પ્રસંગ કહે છે—સુંદર દિવસો માત્ર કૅલેન્ડરમાં નથી, એ આપણે એકબીજાના જીવનમાં ઉમેરેલા સ્નેહમાં છે. આ ઉજવણી ખાસ બની રહે!',
  e=>'✨ '+e.gu+'ની ઉજવણીમાં ઘરની એક હળવી હસી, કોઈ પોતાનું પૂછેલું “કેમ છો?” અને સાથે ગાળેલી પળો સૌથી મોટી ભેટ બની રહે.',
  e=>'💛 '+e.gu+'ની શુભકામના. આજે કોઈ જૂના સંબંધને યાદ કરજો; એક સાચો સંદેશ પણ વર્ષોની નજીકતાને ફરી જીવંત કરી શકે છે.'
 ],
 hi:[
  e=>'🌼 '+e.hi+' का मौका याद दिलाए कि जिंदगी की असली रौनक अपनों के साथ बिताए लम्हों में होती है। यह दिन यादगार बने।',
  e=>'✨ '+e.hi+' की खुशियों में घर की हंसी, किसी अपने की आवाज और छोटे-छोटे पल सबसे सुंदर तोहफा बनें।',
  e=>'💛 '+e.hi+' पर किसी पुराने रिश्ते को याद कीजिए; दिल से भेजा एक संदेश भी बरसों की दूरी मिटा सकता है।'
 ],
 en:[
  e=>'🌼 '+e.en+' is a gentle reminder that our brightest celebrations live in the kindness we share, not merely on a calendar.',
  e=>'✨ May '+e.en+' be remembered for laughter at home, a familiar voice, and little moments that mean more than gifts.',
  e=>'💛 This '+e.en+', remember someone you miss. A sincere message can make years of distance feel smaller.'
 ]
 };
 return arr.flatMap(e=>(samples[locale]||samples.gu).map((fn,i)=>({
  language:locale,category:'festival',title:e.emoji+' '+e[locale],body:fn(e),featured:true,event:true
 })));
}
function getPool(q,locale){
 const c=category(q),parts=wordParts(q);
 let list=library.filter(x=>x.language===locale).map(x=>({...x,score:score(x,q,c,parts)}));
 if(q){
  const best=list.filter(x=>x.score>=25);
  if(c){
   list=best.filter(x=>x.category===c||x.score>=120);
  }else list=best.filter(x=>x.score>=25);
  if(!list.length){list=best}
 }else{
  const active=C?.currentCategory()||'morning';
  list=list.filter(x=>x.category===active);
 }
 const extra=eventMessages(q,locale).map(x=>({...x,score:240}));
 return [...extra,...list];
}
function batch(){
 const used=seenByQuery.get(currentKey)||new Set();
 if(!pool.length){holder.replaceChildren();meta.textContent='આ વિષયના તૈયાર મેસેજ મળ્યા નથી';next.hidden=true;return}
 let remaining=pool.filter(it=>!used.has(it.category+'|'+it.body));
 if(!remaining.length){used.clear();remaining=pool}
 const mixed=shuffle(remaining).sort((a,b)=>(b.score-a.score));
 const chosen=[],firstLines=new Set();
 function lead(it){
  return norm(it.body.split(/\n|[.!?।]/)[0].replace(/^[^\p{L}\p{N}]+/u,'').slice(0,88));
 }
 for(const item of mixed){
  const first=lead(item);
  if(firstLines.has(first))continue;
  chosen.push(item);firstLines.add(first);
  if(chosen.length>=12)break
 }
 if(chosen.length<12){
  for(const item of mixed){
   if(chosen.includes(item))continue;
   chosen.push(item);
   if(chosen.length>=12)break
  }
 }
 for(const item of chosen)used.add(item.category+'|'+item.body);
 seenByQuery.set(currentKey,used);
 holder.replaceChildren();
 for(const item of chosen)holder.append(card(item));
 const count=pool.length;
 meta.textContent=(chosen.length?chosen.length+' મેસેજ':'મેસેજ મળ્યા નથી')+(count>chosen.length?' · '+count+' ઉપલબ્ધ':'');
 next.hidden=count<=12;
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
 const edit=document.createElement('a');
 const url=new URL('create.html',location.href);
 url.searchParams.set('c',it.category);url.searchParams.set('l',it.language);url.searchParams.set('title',it.title.slice(0,100));url.searchParams.set('m',it.body.slice(0,500));
 edit.href=url.href;edit.textContent='✍️ નામ ઉમેરો';
 const wa=document.createElement('a');wa.textContent='WhatsApp';wa.href='https://api.whatsapp.com/send?text='+encodeURIComponent(it.body+'\n\n✨ https://shubhlink.github.io/');wa.target='_blank';wa.rel='noopener noreferrer';
 const cp=document.createElement('button');cp.type='button';cp.textContent='કોપી';cp.onclick=()=>copyText(it.body,cp);
 actions.append(edit,cp,wa);node.append(label,head,body,actions);return node
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
input.value=params.get('q')||'';
language.value=['gu','hi','en'].includes(params.get('l'))?params.get('l'):'gu';
const chips=['સુપ્રભાત','જન્મદિવસ બહેન','દિવાળી','મિત્રતા','મા માટે','નવરાત્રી','વર્ષગાંઠ'];
for(const txt of chips){
 const btn=document.createElement('button');btn.type='button';btn.className='search-chip';btn.textContent=txt;
 btn.onclick=()=>{input.value=txt;search(txt);input.scrollIntoView({block:'center',behavior:'smooth'})};
 $('smartSearchChips').append(btn)
}
input.oninput=()=>setLink(input.value);
form.onsubmit=e=>{e.preventDefault();search(input.value)};
language.onchange=()=>search(input.value);
next.onclick=()=>batch();
if(window.SHUBH_DATA_READY?.then)window.SHUBH_DATA_READY.then(c=>{core=c;library=build();search(input.value,false)}).catch(()=>{meta.textContent='હમણાં મેસેજ લોડ ન થયા.'});
else meta.textContent='મેસેજ લોડ થઈ રહ્યા છે...';
})();
