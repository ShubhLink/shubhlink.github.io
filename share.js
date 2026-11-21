/* Unified single-tap message preview → name → WhatsApp share.
   Never put Gujarati message content into a second shareable URL; WhatsApp gets readable text only. */
(function(){
'use strict';
const i18n={
 gu:{heading:'મેસેજ મોકલો',to:'જેને મોકલવું છે તેનું નામ (વૈકલ્પિક)',from:'તમારું નામ (વૈકલ્પિક)',send:'WhatsApp પર મોકલો',close:'બંધ કરો',yourName:'તમારું નામ',recipient:'મિત્રનું નામ',prefix:'પ્રિય',suffix:'શુભેચ્છાઓ સાથે',noTitle:'દિલથી શુભેચ્છાઓ'},
 hi:{heading:'मैसेज भेजें',to:'किसे भेजना है? (वैकल्पिक)',from:'आपका नाम (वैकल्पिक)',send:'WhatsApp पर भेजें',close:'बंद करें',yourName:'आपका नाम',recipient:'प्रिय व्यक्ति का नाम',prefix:'प्रिय',suffix:'शुभकामनाओं सहित',noTitle:'दिल से शुभकामनाएँ'},
 en:{heading:'Share message',to:'Recipient name (optional)',from:'Your name (optional)',send:'Share on WhatsApp',close:'Close',yourName:'Your name',recipient:'Recipient name',prefix:'Dear',suffix:'With warm wishes',noTitle:'Warm wishes'}
};
let current=null,previousFocus=null,initialized=false,parts=null;
function E(tag,cls,txt){const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n}
function normalize(name,l){let x=String(name||'').replace(/[<>\r\n]/g,' ').trim().slice(0,65);if(l==='gu'&&window.ShubhNames?.prepare)x=window.ShubhNames.prepare(x,'gu');return x}
function format(){
 const l=current.language,t=i18n[l]||i18n.gu;
 const from=normalize(parts.from.value,l);
 const title=String(current.title||'').trim().slice(0,110);
 const body=String(current.body||'').trim().slice(0,1200);
 const blocks=[];
 if(title&&title!==body&&!body.includes(title)&&!/^✦|^◉/.test(title))blocks.push('*'+title.replace(/\*/g,'')+'*');
 blocks.push(body);
 if(from)blocks.push('🌸 '+t.suffix+' — '+from);
 // Link back to the public site, never to an editor URL containing encoded names/messages.
 // Keep it literal and short so WhatsApp shows one readable clickable link.
 blocks.push((l==='hi'?'🔗 ShubhLink पर अपने नाम से मैसेज बनाएं':l==='en'?'🔗 Create a message with your name on ShubhLink':'🔗 ShubhLink પર તમારા નામથી મેસેજ બનાવો')+'\nhttps://shubhlink.github.io/');
 return blocks.filter(Boolean).join('\n\n');
}
function update(){
 if(!current)return;
 const l=current.language,t=i18n[l]||i18n.gu;
 parts.heading.textContent=t.heading;parts.fromLabel.textContent=t.from;
 parts.from.placeholder=t.yourName;
 parts.sendText.textContent=t.send;parts.close.setAttribute('aria-label',t.close);
 parts.msgTitle.textContent=current.title||t.noTitle;
 parts.msgBody.textContent=current.body;

}
function create(){
 if(initialized)return;initialized=true;
 const shade=E('div','sh-share-backdrop');shade.id='shShareBackdrop';shade.hidden=true;
 shade.setAttribute('role','presentation');
 const box=E('section','sh-share-dialog');box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-labelledby','shShareHeading');
 const top=E('div','sh-share-top');const brand=E('div','sh-share-brand');
 const logo=E('img','sh-share-symbol');logo.src='icon.svg';logo.alt='';brand.append(logo,E('span','', 'ShubhLink'));
 const close=E('button','sh-share-close','×');close.type='button';close.setAttribute('aria-label','બંધ કરો');close.addEventListener('click',dismiss);
 top.append(brand,close);
 const heading=E('h2','sh-share-heading');heading.id='shShareHeading';
 const card=E('div','sh-share-card');
 const msgTitle=E('strong','sh-share-title');const msgBody=E('p','sh-share-body');
 card.append(msgTitle,msgBody);
 const fields=E('div','sh-share-fields');
 const fromWrapper=E('label','sh-share-field');
 const fromLabel=E('span');
 const from=E('input');from.type='text';from.maxLength=65;from.autocomplete='name';
 const remember=()=>{try{sessionStorage.setItem('shubhlink_sender',from.value.slice(0,65))}catch(_){}};
 fromWrapper.append(fromLabel,from);fields.append(fromWrapper);
 const send=E('button','sh-share-send');send.type='button';
 const sendText=E('span');const whatsappIcon=E('span','sh-wa-icon');whatsappIcon.innerHTML='<svg viewBox="0 0 32 32" aria-hidden="true" width="26" height="26" fill="currentColor"><path d="M16 1a15 15 0 0 0-13 22.5L1 31l7.7-2A15 15 0 1 0 16 1zm0 27a12 12 0 0 1-6-1.6l-.5-.3-4.5 1.2 1.2-4.4-.3-.5A12 12 0 1 1 16 28zm6.6-9.1c-.4-.2-2.1-1.1-2.5-1.2-.3-.1-.6-.2-.8.2l-1.1 1.3c-.2.2-.4.3-.8.1-2.2-1.1-3.7-2.3-5-4.3-.4-.7.4-.7 1.1-2.1.1-.2.1-.5 0-.7l-1.2-2.8c-.3-.7-.6-.6-.8-.6h-.7c-.3 0-.7.1-1 .5-.4.4-1.3 1.3-1.3 3.1s1.3 3.6 1.5 3.9c.2.3 2.6 4 6.2 5.5 2.3 1 3.2 1.1 4.3.9 1.3-.2 2.1-1.1 2.4-2 .3-.9.3-1.6.2-1.8-.1-.2-.4-.3-.8-.5z"/></svg>';send.append(whatsappIcon,sendText);
 send.addEventListener('click',()=>{
  if(!current)return;
  remember();
  const text=format(),url='https://api.whatsapp.com/send?text='+encodeURIComponent(text);
  // The URL is only passed to WhatsApp, never appended to the shared text.
  dismiss();
  // Navigate directly from the user gesture so Android WhatsApp opens reliably.
  window.location.assign(url);
 });
 from.addEventListener('input',update);
 const actions=E('div','sh-share-actions');const edit=E('button','sh-share-edit','✎ પોસ્ટર બનાવો');edit.type='button';edit.addEventListener('click',()=>{if(!current)return;remember();const data={body:current.body,title:current.title,language:current.language,sender:from.value};try{sessionStorage.setItem('shubhlink-poster-message',JSON.stringify(data))}catch(_){}window.location.assign('poster-maker.html?from=message')});const other=E('button','sh-share-other');other.innerHTML='<svg viewBox="0 0 24 24" width="25" height="25" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.7 10.7 6.6-4.2m-6.6 8 6.6 3.8"/></svg>';other.type='button';other.setAttribute('aria-label','અન્ય એપમાં શેર કરો');other.addEventListener('click',async()=>{const payload={title:current.title||'ShubhLink',text:format()};if(navigator.share){try{await navigator.share(payload)}catch(e){if(e.name!=='AbortError')console.warn(e)}}else if(navigator.clipboard){await navigator.clipboard.writeText(payload.text);other.textContent='✓'}});actions.append(edit,send,other);box.append(top,heading,card,fields,actions);
 shade.append(box);
 shade.addEventListener('click',e=>{if(e.target===shade)dismiss()});
 document.body.append(shade);
 parts={shade,box,heading,close,msgTitle,msgBody,fromLabel,from,send,sendText,other};
 document.addEventListener('keydown',e=>{
  if(shade.hidden)return;
  if(e.key==='Escape'){e.preventDefault();dismiss()}
  if(e.key==='Tab'){
   const focusables=[close,from,edit,send,other],first=focusables[0],last=focusables[focusables.length-1];
   if(e.shiftKey&&document.activeElement===first){last.focus();e.preventDefault()}
   else if(!e.shiftKey&&document.activeElement===last){first.focus();e.preventDefault()}
  }
 });
}
function dismiss(){
 if(!initialized||parts.shade.hidden)return;
 parts.shade.hidden=true;document.documentElement.classList.remove('sh-share-open');
 current=null;if(previousFocus?.isConnected)previousFocus.focus();
}
function open(data){
 create();
 const l=['gu','hi','en'].includes(data.language)?data.language:'gu';
 const body=String(data.body||'').trim();
 if(!body)return;
 previousFocus=document.activeElement;
 current={body,title:String(data.title||'').trim(),language:l};
 let lastName='';try{lastName=sessionStorage.getItem('shubhlink_sender')||''}catch(_){}
 parts.from.value=String(data.sender||lastName).slice(0,65);
 update();parts.shade.hidden=false;document.documentElement.classList.add('sh-share-open');parts.close.focus({preventScroll:true});
}
window.ShubhShare={open,dismiss};
})();