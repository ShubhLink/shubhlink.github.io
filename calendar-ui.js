/* Daily and upcoming calendar presentation; date selection uses Asia/Kolkata. */
(function(){
'use strict';
const C=window.ShubhCalendar;if(!C)return;
const $=id=>document.getElementById(id);
const zone=C.indiaTime();
const localDate=new Date(zone.date+'T06:00:00Z');
const todayLabel=new Intl.DateTimeFormat('gu-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Kolkata'}).format(localDate);
if($('todayDate'))$('todayDate').textContent=todayLabel;
function panel(title,detail,emoji,href,caption,featured){
 const a=document.createElement('a');a.href=href;a.className='smart-feature'+(featured?' is-featured':'');
 const ico=document.createElement('div');ico.className='sf-emoji';ico.textContent=emoji;
 const wrap=document.createElement('div');const over=document.createElement('small');over.textContent=caption;
 const h=document.createElement('h3');h.textContent=title;
 const p=document.createElement('p');p.textContent=detail;
 const go=document.createElement('span');go.className='sf-link';go.textContent='વધુ મેસેજ જુઓ ↗';
 wrap.append(over,h,p,go);a.append(ico,wrap);return a;
}
const names={
 morning:['સુપ્રભાત 🌞','સવારનો સૂરજ તો દરરોજ ઊગે છે, પણ આજે તમારા ચહેરાનું સ્મિત કોઈનો આખો દિવસ ઉજાળી દે. ☀️','🌅'],
 afternoon:['શુભ બપોર 🍃','કામની દોડમાં એક ક્ષણનું સ્મિત સાચવી રાખજો; ક્યારેક નાની ખુશી પણ આખા દિવસની સૌથી મોટી કમાણી હોય છે.','☀️'],
 night:['શુભરાત્રિ 🌙','આજનો થાક ચાંદનીને સોંપી દો. જે સપના અધૂરા છે, તેમને કાલે ફરી ઉડવાની તક મળશે. 🌙','🌙']
};
const current=C.currentCategory();
if($('todayFeatures')){
 const t=$('todayFeatures');const n=names[current];
 t.append(panel(n[0],n[1],n[2],'wishes.html?c='+current+'&l=gu','આ સમય માટે ખાસ',true));
 const todays=C.todayEvents();
 if(todays.length){
  for(const e of todays.slice(0,2)){
   t.append(panel(e.gu,'ઘરના દીવડાથી મોટો પ્રકાશ એ સ્નેહ છે, જે આપણે એકબીજાના હૃદયમાં પ્રગટાવીએ છીએ. ✨',e.emoji,'search.html?q='+encodeURIComponent(e.gu)+'&l=gu','આજનો તહેવાર',false))
  }
 }else{
  const next=C.upcoming(1)[0];
  if(next)t.append(panel(next.gu,'ઉજવણી નજીક છે. દિલથી લખેલા શબ્દો એ સૌથી સુંદર ભેટ હોય છે.',next.emoji,'search.html?q='+encodeURIComponent(next.gu)+'&l=gu',C.dateLabel(next.date),false));
  else t.append(panel('આજનો સુંદર વિચાર','પ્રેરણાદાયી સુવિચાર વાંચો અને શેર કરો.','🌷','wishes.html?c=suvichar&l=gu','આજની પસંદ',false));
 }
}
const upcoming=$('upcomingEvents');
if(upcoming){
 const future=C.upcoming(8);
 upcoming.replaceChildren();
 for(const e of future){
  const a=document.createElement('a');a.href='search.html?q='+encodeURIComponent(e.gu)+'&l=gu';a.className='upcoming-event';
  const date=document.createElement('span');date.className='event-day';date.textContent=C.dateLabel(e.date).replace(/ ?૨૦૨૬| ?૨૦૨૭/g,'');
  const em=document.createElement('span');em.className='event-icon';em.textContent=e.emoji;
  const title=document.createElement('strong');title.textContent=e.gu;
  const meta=document.createElement('small');const days=C.diffDays(e.date,zone.date);meta.textContent=days===0?'આજે':days===1?'આવતીકાલે':days+' દિવસ પછી';
  a.append(date,em,title,meta);upcoming.append(a);
 }
 if(!future.length)upcoming.textContent='આગામી તહેવારોની તારીખો હજી ઉમેરવાની બાકી છે.';
}
const month=$('monthCalendar');
if(month){
 let y=Number(zone.date.slice(0,4)),m=Number(zone.date.slice(5,7))-1;
 const title=$('monthHeading'),back=$('prevMonth'),next=$('nextMonth'),reset=$('thisMonth');
 function render(){
  const start=new Date(Date.UTC(y,m,1));const daysIn=new Date(Date.UTC(y,m+1,0)).getUTCDate();
  const label=new Intl.DateTimeFormat('gu-IN',{month:'long',year:'numeric',timeZone:'UTC'}).format(start);
  title.textContent=label;month.replaceChildren();
  for(const d of ['રવિ','સોમ','મંગળ','બુધ','ગુરુ','શુક્ર','શનિ']){
   const el=document.createElement('div');el.className='cal-weekday';el.textContent=d;month.append(el);
  }
  for(let k=0;k<start.getUTCDay();k++){const blank=document.createElement('div');month.append(blank)}
  for(let day=1;day<=daysIn;day++){
   const date=y+'-'+String(m+1).padStart(2,'0')+'-'+String(day).padStart(2,'0');
   const event=C.events.filter(x=>x.date===date);
   const el=document.createElement('button');el.type='button';el.className='cal-day'+(date===zone.date?' today':'')+(event.length?' has-event':'');
   el.textContent=new Intl.NumberFormat('gu-IN',{useGrouping:false}).format(day);
   if(event.length){el.title=event.map(x=>x.gu).join(', ');
    el.setAttribute('aria-label',day+' '+event.map(x=>x.gu).join(', '));
    el.onclick=()=>{location.href='search.html?q='+encodeURIComponent(event[0].gu)+'&l=gu'};
   }else{
    el.title='આ તારીખ માટે હજુ ખાસ પ્રસંગ સૂચિબદ્ધ નથી';el.onclick=()=>{const desc=$('calendarHint');if(desc)desc.textContent='આ તારીખ માટે કોઈ ખાસ પ્રસંગ સૂચિબદ્ધ નથી.'};
   }
   month.append(el);
  }
  if($('calendarHint'))$('calendarHint').textContent='રંગીન તારીખ પર ટૅપ કરો અને તે પ્રસંગના મેસેજ જુઓ. ચંદ્ર પંચાંગની તારીખો સ્થાનિક રીતે બદલાઈ શકે છે.';
 }
 back.onclick=()=>{m--;if(m<0){m=11;y--}render()};
 next.onclick=()=>{m++;if(m>11){m=0;y++}render()};
 reset.onclick=()=>{y=Number(zone.date.slice(0,4));m=Number(zone.date.slice(5,7))-1;render()};
 render();
}
})();
