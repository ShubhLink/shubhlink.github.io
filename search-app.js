/* Search all ShubhLink wishes without guest accounts.
   AI is only used when secure Edge Function has GEMINI_API_KEY configured. */
(function(){
'use strict';
const $=id=>document.getElementById(id),C=window.ShubhCalendar;
const root=$('smartSearchInput');if(!root)return;
const params=new URLSearchParams(location.search);
const language=$('smartSearchLang'),results=$('smartSearchResults'),meta=$('smartSearchCount'),load=$('smartLoadMore');
const composer=$('smartComposer'),queryBox=$('smartComposeQuery'),tone=$('smartComposeTone'),composeLang=$('smartComposeLang'),composeBtn=$('smartComposeButton'),draftHost=$('smartComposeOutput'),feedback=$('smartComposeStatus');
const phrases={
 morning:['morning','good morning','સુપ્રભાત','સવાર','પ્રભાત','सुबह','सुप्रभात','prabhat','savare'],
 afternoon:['afternoon','બપોર','शुभ दोपहर','दोपहर','bapor'],
 night:['night','good night','શુભરાત્રિ','રાત','शुभरात्रि','नींद','sleep'],
 birthday:['birthday','happy birthday','જન્મદિવસ','બર્થડે','janamdin','जन्मदिन','बर्थडे','happy bday'],
 suvichar:['suvichar','સુવિચાર','विचार','wisdom','quote','quotes','પ્રેરણા','positive quote'],
 newthought:['motivation','inspiration','motivate','નવા વિચાર','સફળતા','नई सोच','प्रेरणा','success'],
 friendship:['friend','dost','દોસ્ત','મિત્ર','मित्र','दोस्ती','friendship','yaar','યાર'],
 festival:['festival','tihar','તહેવાર','त्योहार','festive','diwali','દિવાળી','દીપાવલી','navratri','garba','holy','holi'],
 anniversary:['anniversary','wedding','લગ્ન','વર્ષગાંઠ','સાલગિરહ','शादी','सालगिरह','marriage'],
 congrats:['congratulations','congrats','અભિનંદન','બધાઈ','बधाई','જીત','promotion','new job','સફળતા']
};
const specialTerms=['friend','best friend','sister','brother','mother','father','wife','husband','teacher','boss','lover','girlfriend','boyfriend','son','daughter','friendship','બહેન','ભાઈ','માતા','પિતા','પત્ની','પતિ','દોસ્ત','મિત્ર','મમ્મી','પપ્પા','દીકરી','દીકરો','बहन','भाई','मां','पापा','दोस्त','मित्र','बेटी','बेटा'];
const stop=new Set(['for','and','with','message','messages','msg','wishes','wish','send','to','my','the','a','of','the','new','best','please','મેસેજ','માટે','સંદેશ','શુભેચ્છા','मेसेज','संदेश','के','लिए']);
const norm=s=>C?C.normalize(s):String(s||'').toLocaleLowerCase().trim();
const matcher=(text,word)=>norm(text).includes(norm(word));
function categoryFrom(q){
 const query=norm(q);
 const ev=C?.findEvents(query)||[];
 if(ev.length)return 'festival';
 let best=null,score=0;
 for(const [category,words] of Object.entries(phrases)){
  for(const term of words){const t=norm(term);if(query.includes(t)&&t.length>=2){const s=t.length+(query===t?8:0);if(s>score){score=s;best=category}}}
 }
 return best;
}
function festivalMatches(q){
 if(!C||!q)return [];
 const ms=C.findEvents(q);
 const unique=new Map();for(const e of ms)unique.set(e.gu,e);
 return [...unique.values()].slice(0,3);
}
function occasionMessages(e,lang){
 const nm=e[lang]||e.gu;
 const intros={
  gu:['આજનો '+nm+' આપણા જીવનમાં પ્રેમ અને ઉમંગ લઈને આવે.','આ '+nm+'ના સુંદર પ્રસંગે આપને દિલથી શુભેચ્છા.','આજે '+nm+'ની ઉજવણીમાં સૌના ચહેરા પર સ્મિત ખીલે.','આ '+nm+'ની યાદગાર પળો સંબંધોમાં નવી હૂંફ ભરે.'],
  hi:['आज का '+nm+' आपके जीवन में खुशी और अपनापन लेकर आए।','इस '+nm+' के सुंदर मौके पर दिल से शुभकामनाएं।','आज '+nm+' का जश्न हर चेहरे पर मुस्कान ले आए।','यह '+nm+' रिश्तों में नई गर्माहट और यादें भर दे।'],
  en:['May '+nm+' bring warmth and joy into your life.','Sending heartfelt wishes for '+nm+' and all the moments it brings.','Let the celebration of '+nm+' spread kindness and smiles.','May '+nm+' become a lovely memory shared with people you care about.']
 };
 const ends={
  gu:['તમારું ઘર શાંતિ, સ્નેહ અને હાસ્યથી ભરેલું રહે.','એકબીજાને દિલથી યાદ કરીને ખુશીઓ વધુ સુંદર બનાવીએ.','આજનો દિવસ નવી આશા અને મીઠી યાદો આપી જાય.'],
  hi:['आपका घर प्यार, सुकून और हंसी से भरा रहे।','अपनों को याद करके खुशियां और खूबसूरत बनाइए।','यह दिन नई उम्मीद और प्यारी यादें देकर जाए।'],
  en:['May your home be filled with laughter, peace, and love.','Remember someone you care about and make the celebration brighter.','May today leave you with fresh hope and a beautiful memory.']
 };
 const arr=[];
 for(let i=0;i<12;i++){
  const j=i%4,k=Math.floor(i/4);
  arr.push({category:'festival',language:lang,title:e.emoji+' '+nm+' · '+(lang==='gu'?'ખાસ શુભેચ્છા':lang==='hi'?'खास शुभकामना':'Special wishes'),body:e.emoji+' '+intros[lang][j]+'\n'+ends[lang][k],event:true,score:500-i});
 }
 return arr;
}
let core=null,all=[],matched=[],visible=24,typingTimer=null,activeQuery='';
function collect(){
 const out=[];
 for(const lang of ['gu','hi','en']){
  for(const [category,messages] of Object.entries(core.D.wishes[lang]||{})){
   for(let i=0;i<messages.length;i++){
    const body=messages[i];
    const title=core.titleFor(body,category,lang);
    out.push({category,language:lang,title,body,index:i,event:false});
   }
  }
 }
 return out;
}
function chosenLang(){return ['gu','hi','en'].includes(language.value)?language.value:'gu'}
function scoreItem(item,q,selectedCategory,terms){
 const text=norm(item.title+' '+item.body);
 const full=norm(q);
 let score=0;
 if(item.category===selectedCategory)score+=50;
 if(full&&text.includes(full))score+=55;
 for(const term of terms){if(text.includes(term))score+=13}
 const special=specialTerms.filter(x=>full.includes(norm(x)));
 for(const word of special){if(text.includes(norm(word)))score+=9}
 if(item.language==='gu'&&chosenLang()==='gu')score+=2;
 return score;
}
function search(){
 const q=root.value.trim().slice(0,100),l=chosenLang(),cat=categoryFrom(q);
 const tokens=norm(q).split(' ').filter(w=>w.length>1&&!stop.has(w));
 const matchedEvents=festivalMatches(q),tokensN=tokens.length;
 const selected=all.filter(it=>it.language===l).map(it=>({...it,score:scoreItem(it,q,cat,tokens)}));
 selected.sort((a,b)=>b.score-a.score);
 let arr=selected;
 if(q&&cat)arr=selected.filter(x=>x.category===cat||x.score>=55);
 else if(q){
  const matches=selected.filter(x=>x.score>=10);
  arr=matches.length?matches:selected.filter(x=>x.category===(C?.currentCategory()||'morning'));
 }
 if(matchedEvents.length){
  const ceremonial=matchedEvents.flatMap(e=>occasionMessages(e,l));
  arr=[...ceremonial,...arr];
 }
 if(!q){
  const current=C?.currentCategory()||'morning';
  const today=C?.todayEvents()||[];
  arr=selected.filter(x=>x.category===current);
  if(today.length)arr=[...today.flatMap(e=>occasionMessages(e,l)),...arr];
 }
 const seen=new Set();
 matched=arr.filter(x=>{const key=x.category+'|'+x.body;if(seen.has(key))return false;seen.add(key);return true}).slice(0,500);
 visible=24;activeQuery=q;
 if(queryBox&&q)queryBox.value=q;
 updateUrl();renderResults();
}
function updateUrl(){
 const u=new URL(location.href);if(activeQuery)u.searchParams.set('q',activeQuery);else u.searchParams.delete('q');
 u.searchParams.set('l',chosenLang());history.replaceState(null,'',u);
}
function titleForCategory(c,l){const cat=core.D.categories.find(x=>x.id===c);return cat?.[l]||cat?.gu||c}
function resultCard(it){
 const card=document.createElement('article');card.className='search-message';
 const label=document.createElement('div');label.className='s-label';label.textContent=(it.event?'📅 ખાસ પ્રસંગ · ':'')+titleForCategory(it.category,it.language);
 const h=document.createElement('h3');h.textContent=it.title;const p=document.createElement('p');p.textContent=it.body;
 const actions=document.createElement('div');actions.className='search-actions';
 const personalise=document.createElement('a');
 const u=new URL('create.html',location.href);
 u.searchParams.set('c',it.category);u.searchParams.set('l',it.language);u.searchParams.set('title',it.title.slice(0,100));u.searchParams.set('m',it.body.slice(0,500));
 personalise.href=u.href;personalise.textContent='✍️ નામ ઉમેરી શેર કરો';
 const share=document.createElement('a');share.href='https://api.whatsapp.com/send?text='+encodeURIComponent(it.title+'\n\n'+it.body+'\n\nhttps://shubhlink.github.io/');share.target='_blank';share.rel='noopener noreferrer';share.textContent='WhatsApp શેર';
 actions.append(personalise,share);card.append(label,h,p,actions);return card;
}
function renderResults(){
 if(!core)return;results.replaceChildren();
 if(!matched.length){
  const empty=document.createElement('p');empty.className='search-meta';empty.textContent='આ શબ્દ માટે તૈયાર મેસેજ નથી મળ્યો. નીચે મેસેજ બનાવો અથવા અલગ શબ્દ અજમાવો.';results.append(empty)
 }else for(const it of matched.slice(0,visible))results.append(resultCard(it));
 meta.textContent=matched.length+' સંબંધિત મેસેજ · '+(activeQuery?'શોધ: '+activeQuery:'આજની પસંદ');
 load.hidden=matched.length<=visible;
}
function smartDrafts(q,lang,style){
 const normalized=q.trim();
 const occasion=festivalMatches(q)[0];
 if(occasion)return occasionMessages(occasion,lang).slice(0,3).map(x=>x.body);
 const topic=normalized||({gu:'આજની શુભેચ્છા',hi:'आज की शुभकामना',en:'Today’s wishes'})[lang];
 const patterns={
  gu:[
   ['🌷 '+topic+' માટે દિલથી એક ખાસ સંદેશ.','તમારા જીવનમાં ખુશીઓ, શાંતિ અને નવી આશાઓનો સુંદર સંગમ થતો રહે.'],
   ['✨ '+topic+'ની આ સુંદર પળ યાદગાર બની રહે.','પ્રિયજનોનો સ્નેહ તમારા ચહેરા પર સ્મિત અને મનમાં વિશ્વાસ ભરે.'],
   ['💖 '+topic+' માટે આ નાની શુભેચ્છા ખાસ તમારા માટે.','દરેક આવતીકાલ આજ કરતાં વધુ સ્નેહભરી અને આનંદદાયક બને.']
  ],
  hi:[
   ['🌷 '+topic+' के लिए दिल से एक खास संदेश।','आपकी जिंदगी में खुशियां, सुकून और नई उम्मीदें बनी रहें।'],
   ['✨ '+topic+' का यह सुंदर पल यादगार बन जाए।','अपनों का प्यार चेहरे पर मुस्कान और मन में विश्वास भरता रहे।'],
   ['💖 '+topic+' के लिए यह छोटी सी शुभकामना।','हर आने वाला दिन आज से थोड़ा और खूबसूरत हो।']
  ],
  en:[
   ['🌷 A heartfelt note about '+topic+'.','May happiness, peace, and fresh hope find a place in your days.'],
   ['✨ A special moment for '+topic+'.','May the kindness of loved ones bring smiles and lasting confidence.'],
   ['💖 A warm wish for '+topic+'.','May each new day carry a little more warmth and joy than the last.']
  ]
 };
 const arr=patterns[lang]||patterns.gu;
 return arr.map((part,i)=>part.join('\n'));
}
function renderDrafts(drafts,isAI){
 draftHost.replaceChildren();
 const note=document.createElement('p');note.className='search-disclosure';
 note.textContent=isAI?'આ મેસેજ AI દ્વારા બનાવવામાં આવ્યા છે; શેર કરતાં પહેલાં વાંચીને તપાસો.':'આ મેસેજ મફત નિયમ-આધારિત Smart Draft છે, AI દ્વારા બનાવેલા નથી; જરૂરી હોય તો Edit કરો.';
 draftHost.append(note);
 for(const text of drafts){
  const div=document.createElement('div');div.className='search-compose-msg';const p=document.createElement('p');p.textContent=text;
  const u=new URL('create.html',location.href);const l=composeLang.value;const cat=categoryFrom(queryBox.value)||'newthought';
  u.searchParams.set('c',cat);u.searchParams.set('l',l);u.searchParams.set('title',queryBox.value.slice(0,100)||'તમારી ખાસ શુભેચ્છા');u.searchParams.set('m',text.slice(0,500));
  const a=document.createElement('a');a.href=u.href;a.textContent='✍️ Edit કરીને શેર કરો';div.append(p,a);draftHost.append(div);
 }
}
async function compose(){
 const q=queryBox.value.trim().slice(0,100);
 if(q.length<2){feedback.textContent='પહેલાં ઓછામાં ઓછા બે અક્ષરમાં પ્રસંગ કે વિષય લખો.';return}
 const l=composeLang.value,style=tone.value;
 composeBtn.disabled=true;feedback.textContent='તમારા વિષય માટે મેસેજ તૈયાર થઈ રહ્યા છે...';
 try{
  const cfg=window.SHUBHLINK_BACKEND||{};
  if(!cfg.url||!cfg.publishableKey)throw Error('AI backend unavailable');
  const res=await fetch(cfg.url.replace(/\/$/,'')+'/functions/v1/compose-wish',{
   method:'POST',headers:{'Content-Type':'application/json',apikey:cfg.publishableKey},
   body:JSON.stringify({topic:q,language:l,tone:style})
  });
  if(!res.ok)throw Error('AI service not configured');
  const data=await res.json();
  if(!Array.isArray(data.messages)||!data.messages.length)throw Error('No AI output');
  renderDrafts(data.messages.slice(0,3).map(x=>String(x).slice(0,600)),true);
  feedback.textContent='✓ AI દ્વારા નવા મેસેજ બનાવ્યા.';
 }catch(_e){
  renderDrafts(smartDrafts(q,l,style),false);
  feedback.textContent='હાલ AI સેવા સક્રિય નથી; તેના બદલે મફત Smart Draft તૈયાર કર્યો છે.';
 }finally{composeBtn.disabled=false}
}
load.onclick=()=>{visible+=24;renderResults()};
root.value=params.get('q')||'';
language.value=['gu','hi','en'].includes(params.get('l'))?params.get('l'):'gu';
composeLang.value=language.value;
function suggest(q){root.value=q;queryBox.value=q;search()}
for(const w of ['સુપ્રભાત','જન્મદિવસ બહેન','દિવાળી','મિત્રતા','સુવિચાર','રક્ષાબંધન']){
 const b=document.createElement('button');b.type='button';b.className='search-chip';b.textContent=w;b.onclick=()=>suggest(w);$('smartSearchChips').append(b)
}
$('smartSearchForm').onsubmit=e=>{e.preventDefault();search()};
root.oninput=()=>{clearTimeout(typingTimer);typingTimer=setTimeout(search,250)};
language.onchange=()=>{composeLang.value=language.value;search()};
composeBtn.onclick=compose;
const whenReady=window.SHUBH_DATA_READY;
if(whenReady&&typeof whenReady.then==='function'){
 whenReady.then(v=>{core=v;all=collect();search()}).catch(e=>{meta.textContent='મેસેજ લોડ ન થયા. Refresh કરો.';console.warn(e)});
}else{
 meta.textContent='મેસેજ ડેટા હાલ ઉપલબ્ધ નથી.';
}
})();
