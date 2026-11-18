/* ShubhLink chat-style AI Message Studio — browser-local conversation, no user account. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const form=$('aiChatForm');if(!form)return;
const prompt=$('aiPrompt'),lang=$('aiLang'),tone=$('aiTone'),board=$('aiConversation'),status=$('aiStatus'),send=$('aiSend');
const config=window.SHUBHLINK_BACKEND||{};
const searchParams=new URLSearchParams(location.search);
const validLang=['gu','hi','en'];
let isBusy=false,topic='',history=[],avoid=[],round=0;
function memoryKey(q){
 const v=String(q||'').toLocaleLowerCase().slice(0,90);let h=2166136261;
 for(let i=0;i<v.length;i++){h=Math.imul(h^v.charCodeAt(i),16777619)}
 return 'shubhlink_studio_recent_v2_'+lang.value+'_'+(h>>>0).toString(36)
}
function loadRecent(q){try{const a=JSON.parse(sessionStorage.getItem(memoryKey(q))||'[]');return Array.isArray(a)?a.slice(-9):[]}catch(_){return []}}
function saveRecent(q,items){try{sessionStorage.setItem(memoryKey(q),JSON.stringify([...loadRecent(q),...items].slice(-9)))}catch(_){}}

const replyWords={gu:['હૃદયસ્પર્શી','કાવ્યમય','ટૂંકું અને ખાસ'],hi:['दिल से','शायराना','खास और नया'],en:['Heartfelt','Poetic','Memorable']};
const starter=[
 {label:'🎂 જન્મદિવસ',text:'મારી બહેનના જન્મદિવસ માટે પ્રેમ અને બાળપણની યાદોથી ભરેલો સુંદર મેસેજ લખો'},
 {label:'🌞 સુપ્રભાત',text:'વહેલી સવાર માટે એક તાજો, મીઠો, ખૂબ સુંદર સુપ્રભાત સંદેશ લખો'},
 {label:'💛 મિત્રતા',text:'દૂર રહેતા બાળપણના મિત્ર માટે યાદગાર અને લાગણીભર્યો મેસેજ'},
 {label:'🪔 તહેવાર',text:'આવતા તહેવાર માટે પરિવાર અને મિત્રો સાથે શેર કરવા એક અલગ મેસેજ'}
];
const small=(s,max=250)=>String(s||'').trim().slice(0,max);
function el(tag,cls,txt){
 const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e
}
function chatScroll(){board.scrollTop=board.scrollHeight}
function welcome(){
 board.replaceChildren();
 const v=el('div','ai-welcome'),icon=el('span','ai-welcome-icon','💌'),h=el('h2','','કોણ માટે મેસેજ બનાવીએ?'),list=el('div','ai-starters');
 for(const x of starter){
  const btn=el('button','',x.label);btn.type='button';btn.onclick=()=>{prompt.value=x.text;prompt.focus();prompt.scrollIntoView({block:'nearest'})};
  list.append(btn)
 }
 v.append(icon,h,list);board.append(v);
}
function messageTurn(role,text){
 if(board.querySelector('.ai-welcome'))board.replaceChildren();
 const row=el('div','ai-turn '+role);
 row.append(el('div',role==='user'?'ai-user-bubble':'ai-error-bubble',text));
 board.append(row);chatScroll();return row
}
function working(){
 const row=el('div','ai-turn assistant'),b=el('div','ai-working'),dots=el('span','ai-pulse');
 for(let i=0;i<3;i++)dots.append(el('b'));
 b.append(dots,document.createTextNode('શબ્દો રચાઈ રહ્યા છે...'));
 row.append(b);board.append(row);chatScroll();return row;
}
function editUrl(message){
 const u=new URL('create.html',location.href);
 u.searchParams.set('l',lang.value);
 const category=/જન્મદિવસ|birthday|जन्मदिन/i.test(topic)?'birthday':
 /સવાર|સુપ્રભાત|good morning|सुप्रभात/i.test(topic)?'morning':
 /રાત્રિ|night|शुभ रात्रि/i.test(topic)?'night':
 /મિત્ર|દોસ્ત|friend|दोस्त/i.test(topic)?'friendship':
 /દિવાળી|નવરાત્રી|ઉત્તરાયણ|holi|diwali|festival|त्योहार/i.test(topic)?'festival':
 /લગ્ન|વર્ષગાંઠ|anniversary/i.test(topic)?'anniversary':'newthought';
 u.searchParams.set('c',category);
 u.searchParams.set('title',small(topic,90)||'તમારા માટે ખાસ');
 u.searchParams.set('m',small(message,500));
 return u.href
}
async function copy(text,btn){
 try{
  if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(text);
  else{
   const t=el('textarea');t.value=text;t.style.position='fixed';t.style.left='-10000px';document.body.append(t);t.select();document.execCommand('copy');t.remove()
  }
  const old=btn.textContent;btn.textContent='✓ કોપી થયું';setTimeout(()=>btn.textContent=old,1500)
 }catch{status.textContent='કોપી ન થયું. મેસેજ લાંબો દબાવીને કોપી કરો.'}
}
function output(messages){
 const row=el('div','ai-turn assistant'),box=el('div','ai-assistant-bubble');
 box.append(el('div','ai-response-top','✦ ShubhLink AI'));
 const options=el('div','ai-options');
 messages.forEach((raw,i)=>{
  const msg=small(raw,650),card=el('article','ai-message-card');
  card.append(el('div','ai-card-label',(replyWords[lang.value]||replyWords.gu)[i]||'ખાસ મેસેજ'));
  card.append(el('p','ai-message-body',msg));
  const buttons=el('div','ai-message-actions');
  const share=el('button','whatsapp','◉ WhatsApp પર શેર કરો');
  share.type='button';
  share.onclick=()=>window.ShubhShare.open({title:'',body:msg,language:lang.value,category:'newthought'});
  const poster=el('button','ai-poster-action','✨ પોસ્ટર બનાવો');poster.type='button';poster.onclick=()=>{const data={body:msg,title:topic,language:lang.value};try{sessionStorage.setItem('shubhlink-poster-message',JSON.stringify(data));window.location.assign('poster-maker.html?from=message')}catch(e){status.textContent='Poster Editor ખોલી શકાયું નથી. ફરી પ્રયાસ કરો.'}};buttons.append(share,poster);card.append(buttons);options.append(card)
 });
 box.append(options);
 const refine=el('div','ai-refine');
 const optionsNames=[
  {label:'💖 વધુ લાગણીભર્યું',instruction:'આમાંથી પ્રેરણા લઈને પણ સાવ નવા શબ્દોમાં વધુ લાગણીભર્યા, સ્પર્શી જાય એવા ત્રણ મેસેજ લખો. અગાઉના મેસેજ ફરી ના લખતા.'},
  {label:'✨ કાવ્યમય બનાવો',instruction:'ખૂબ સુંદર નવા ચિત્રો અને કાવ્યાત્મક ગુજરાતી અભિવ્યક્તિથી ત્રણ અલગ અને યાદગાર મેસેજ લખો. અગાઉનું લખાણ ન દોહરાવો.'},
  {label:'⚡ ટૂંકું કરો',instruction:'અગાઉના વિચારને ધ્યાને લઈને બહુ ટૂંકા પણ ઊંડા અને શેર કરવા જેવા ત્રણ નવા મેસેજ લખો.'},
  {label:'🔄 તદ્દન નવા',instruction:'આગળના મેસેજ જેવા નહીં, તદ્દન જુદા દૃષ્ટિકોણથી ત્રણ અનોખા મેસેજ આપો. શરૂઆત અને અંત પણ જુદા હોવા જોઈએ.'}
 ];
 for(const it of optionsNames){
  const b=el('button','',it.label);b.type='button';b.onclick=()=>run(it.instruction,true);refine.append(b)
 }
 box.append(refine);row.append(box);board.append(row);row.scrollIntoView({block:"start",behavior:"smooth"})
}
const knownErrors={
 rate_limit:'આજના મફત AI મેસેજની મર્યાદા પૂરી થઈ ગઈ છે. આવતીકાલે ફરી બનાવશો.',
 ai_quota_exceeded:'AI ના મફત ઉપયોગની મર્યાદા હાલ પૂરી થઈ છે.',
 ai_provider_busy:'હમણાં AI વ્યસ્ત છે. થોડા સમય પછી ફરી પ્રયાસ કરો.',
 ai_temporarily_unavailable:'હમણાં મેસેજ બની શક્યો નથી. ફરી પ્રયાસ કરો.',
 ai_model_unavailable:'AI મોડેલ હમણાં ઉપલબ્ધ નથી.',
 ai_not_configured:'AI સેવા હાલ ઉપલબ્ધ નથી.',
 quota_check_unavailable:'મેસેજ બનાવવામાં હંગામી મુશ્કેલી આવી છે.'
};
async function run(input,isFollowup=false){
 const text=small(input,240);
 if(isBusy||text.length<2)return;
 if(!config.url||!config.publishableKey){status.textContent='હમણાં AI ઉપલબ્ધ નથી.';return}
 if(!topic||!isFollowup){if(!topic){topic=text;avoid=loadRecent(topic)}}
 isBusy=true;send.disabled=true;
 let succeeded=false;
 messageTurn('user',text);
 prompt.value='';
 status.textContent='';
 const indicator=working();
 try{
  const request={
   topic:small(topic,180),language:lang.value,tone:tone.value,
   instruction:round>0?text:'',history:history.slice(-5),avoid:avoid.slice(-9)
  };
  const response=await fetch(config.url.replace(/\/$/,'')+'/functions/v1/compose-wish',{
   method:'POST',headers:{'content-type':'application/json','apikey':config.publishableKey},
   body:JSON.stringify(request)
  });
  const data=await response.json().catch(()=>({}));
  indicator.remove();
  if(!response.ok)throw Error(knownErrors[data.error]||'હમણાં AI મેસેજ નથી મળ્યો.');
  const list=Array.isArray(data.messages)?data.messages.filter(x=>typeof x==='string'&&x.length>8).slice(0,3):[];
  if(!list.length)throw Error('નવા મેસેજ નથી મળ્યા. ફરી પ્રયાસ કરો.');
  output(list);
  succeeded=true;
  round++;
  history.push('User: '+text,'AI ideas: '+list.map(x=>small(x,130)).join(' | '));
  history=history.slice(-5);
  avoid.push(...list);avoid=avoid.slice(-9);
  saveRecent(topic,list);
  status.textContent='';
 }catch(e){
  indicator.remove();
  if(round===0)topic='';
  messageTurn('assistant',e?.message||'મેસેજ નથી બન્યો.');
 }finally{isBusy=false;send.disabled=false;if(!succeeded)chatScroll()}
}
form.onsubmit=e=>{e.preventDefault();const text=prompt.value.trim();if(text.length<2){status.textContent='મેસેજ વિશે બે શબ્દ લખો.';return}run(text,round>0)};
prompt.onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();form.requestSubmit()}};
$('aiNewChat').onclick=()=>{topic='';history=[];avoid=[];round=0;prompt.value='';status.textContent='';welcome();prompt.focus()};
lang.value=validLang.includes(searchParams.get('l'))?searchParams.get('l'):'gu';
const text=searchParams.get('q')||searchParams.get('prompt')||'';
prompt.value=small(text,240);
welcome();
})();
