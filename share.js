/* Unified single-tap message preview → name → WhatsApp share.
   Never put Gujarati message content into a second shareable URL; WhatsApp gets readable text only. */
(function(){
'use strict';
const i18n={
 gu:{heading:'મેસેજનું Preview',to:'જેને મોકલવું છે તેનું નામ (વૈકલ્પિક)',from:'તમારું નામ (વૈકલ્પિક)',send:'WhatsApp પર મોકલો',close:'બંધ કરો',yourName:'તમારું નામ',recipient:'મિત્રનું નામ',prefix:'પ્રિય',suffix:'શુભેચ્છાઓ સાથે',noTitle:'દિલથી શુભેચ્છાઓ'},
 hi:{heading:'मैसेज का प्रीव्यू',to:'किसे भेजना है? (वैकल्पिक)',from:'आपका नाम (वैकल्पिक)',send:'WhatsApp पर भेजें',close:'बंद करें',yourName:'आपका नाम',recipient:'प्रिय व्यक्ति का नाम',prefix:'प्रिय',suffix:'शुभकामनाओं सहित',noTitle:'दिल से शुभकामनाएँ'},
 en:{heading:'Message preview',to:'Recipient name (optional)',from:'Your name (optional)',send:'Share on WhatsApp',close:'Close',yourName:'Your name',recipient:'Recipient name',prefix:'Dear',suffix:'With warm wishes',noTitle:'Warm wishes'}
};
let current=null,previousFocus=null,initialized=false,parts=null;
function E(tag,cls,txt){const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n}
function normalize(name,l){let x=String(name||'').replace(/[<>\r\n]/g,' ').trim().slice(0,65);if(l==='gu'&&window.ShubhNames?.prepare)x=window.ShubhNames.prepare(x,'gu');return x}
function format(){
 const l=current.language,t=i18n[l]||i18n.gu;
 const to=normalize(parts.to.value,l),from=normalize(parts.from.value,l);
 const title=String(current.title||'').trim().slice(0,110);
 const body=String(current.body||'').trim().slice(0,1200);
 const blocks=[];
 if(to)blocks.push('💌 '+t.prefix+' '+to+',');
 if(title&&title!==body&&!body.includes(title)&&!/^✦|^◉/.test(title))blocks.push('*'+title.replace(/\*/g,'')+'*');
 blocks.push(body);
 if(from)blocks.push('🌸 '+t.suffix+' — '+from);
 // Keep the actual WhatsApp message clean. Never append editor URLs or encoded query strings.
 return blocks.filter(Boolean).join('\n\n');
}
function update(){
 if(!current)return;
 const l=current.language,t=i18n[l]||i18n.gu;
 parts.heading.textContent=t.heading;parts.toLabel.textContent=t.to;parts.fromLabel.textContent=t.from;
 parts.to.placeholder=t.recipient;parts.from.placeholder=t.yourName;
 parts.sendText.textContent=t.send;parts.close.setAttribute('aria-label',t.close);
 parts.msgTitle.textContent=current.title||t.noTitle;
 parts.msgBody.textContent=current.body;
 parts.preview.textContent=format();
}
function create(){
 if(initialized)return;initialized=true;
 const shade=E('div','sh-share-backdrop');shade.id='shShareBackdrop';shade.hidden=true;
 shade.setAttribute('role','presentation');
 const box=E('section','sh-share-dialog');box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-labelledby','shShareHeading');
 const top=E('div','sh-share-top');const brand=E('div','sh-share-brand');
 brand.append(E('span','sh-share-symbol','✦'),E('span','', 'ShubhLink'));
 const close=E('button','sh-share-close','×');close.type='button';close.setAttribute('aria-label','બંધ કરો');close.addEventListener('click',dismiss);
 top.append(brand,close);
 const heading=E('h2','sh-share-heading');heading.id='shShareHeading';
 const card=E('div','sh-share-card');
 const msgTitle=E('strong','sh-share-title');const msgBody=E('p','sh-share-body');
 card.append(msgTitle,msgBody);
 const fields=E('div','sh-share-fields');
 const toWrapper=E('label','sh-share-field'),fromWrapper=E('label','sh-share-field');
 const toLabel=E('span'),fromLabel=E('span');
 const to=E('input');to.type='text';to.maxLength=65;to.autocomplete='off';
 const from=E('input');from.type='text';from.maxLength=65;from.autocomplete='name';
 const remember=()=>{try{sessionStorage.setItem('shubhlink_sender',from.value.slice(0,65))}catch(_){}};
 toWrapper.append(toLabel,to);fromWrapper.append(fromLabel,from);fields.append(toWrapper,fromWrapper);
 const caption=E('span','sh-share-caption','WhatsApp માં મોકલાતો મેસેજ');
 const preview=E('div','sh-share-final-preview');preview.setAttribute('aria-live','polite');
 const send=E('button','sh-share-send');send.type='button';
 const sendText=E('span');send.append(E('span','','◉'),sendText,E('span','','↗'));
 send.addEventListener('click',()=>{
  if(!current)return;
  remember();
  const text=format(),url='https://api.whatsapp.com/send?text='+encodeURIComponent(text);
  // The URL is only passed to WhatsApp, never appended to the shared text.
  dismiss();
  // Navigate directly from the user gesture so Android WhatsApp opens reliably.
  window.location.assign(url);
 });
 [to,from].forEach(x=>x.addEventListener('input',update));
 box.append(top,heading,card,fields,caption,preview,send);
 shade.append(box);
 shade.addEventListener('click',e=>{if(e.target===shade)dismiss()});
 document.body.append(shade);
 parts={shade,box,heading,close,msgTitle,msgBody,toLabel,fromLabel,to,from,send,sendText,preview};
 document.addEventListener('keydown',e=>{
  if(shade.hidden)return;
  if(e.key==='Escape'){e.preventDefault();dismiss()}
  if(e.key==='Tab'){
   const focusables=[close,to,from,send],first=focusables[0],last=focusables[focusables.length-1];
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
 parts.to.value=String(data.recipient||'').slice(0,65);
 let lastName='';try{lastName=sessionStorage.getItem('shubhlink_sender')||''}catch(_){}
 parts.from.value=String(data.sender||lastName).slice(0,65);
 update();parts.shade.hidden=false;document.documentElement.classList.add('sh-share-open');parts.to.focus();
}
window.ShubhShare={open,dismiss};
})();