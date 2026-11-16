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
 suvichar:['આજનો સુવિચાર 🌷','સાચી સમૃદ્ધિ કેટલી વસ્તુઓ ભેગી કરી તેમાં નહીં, કેટલી ખુશીઓ વહેંચી તેમાં રહેલી છે.','🌷'],
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
 const P=window.ShubhPanchang;
 let y=Number(zone.date.slice(0,4)),m=Number(zone.date.slice(5,7))-1;
 const title=$('monthHeading'),back=$('prevMonth'),next=$('nextMonth'),reset=$('thisMonth');
 const hint=$('calendarHint'),detail=$('calDayDetail'),citySelect=$('panchangCity');
 const make=(tag,cls,text)=>{
  const el=document.createElement(tag);
  if(cls)el.className=cls;
  if(text!==undefined)el.textContent=text;
  return el;
 };
 function selectDay(date){
  if(!detail)return;
  const t=P?.forDate(date)||null;
  const events=C.events.filter(e=>e.date===date);
  detail.replaceChildren();
  if(!t){detail.append(make('p','cal-notice','તિથિની માહિતી અત્યારે લોડ થઈ નથી.'));return}
  const heading=make('div','cal-detail-top');
  const icon=make('span','cal-moonicon',t.paksha==='સુદ'?'🌔':'🌘');
  const info=make('div','cal-detail-heading');
  info.append(make('strong','',t.full),make('small','',t.displayDate));
  heading.append(icon,info);detail.append(heading);
  const grid=make('div','cal-facts');
  for(const [label,value] of [
   ['તિથિ',t.paksha+' '+t.tithi],
   ['ગુજરાતી માસ',t.month],
   ['નક્ષત્ર',t.nakshatra],
   ['વિક્રમ સંવત',P.gu(t.samvat)],
   ['સ્થળ',P.city]
  ]){
   const line=make('div','cal-fact');
   line.append(make('small','',label),make('strong','',value));grid.append(line);
  }
  detail.append(grid);
  if(events.length){
   const ebox=make('div','cal-festival-info');
   ebox.append(make('strong','','🎉 '+events.map(e=>e.gu).join(' · ')));
   const a=make('a','cal-event-link','આ પ્રસંગના મેસેજ જુઓ ↗');
   a.href='search.html?q='+encodeURIComponent(events[0].gu)+'&l=gu';
   ebox.append(a);detail.append(ebox);
  }
  const footer=make('p','cal-method','સૂર્યોદયની તિથિ · '+P.city+' · સ્થાનિક પંચાંગ મુજબ થોડો ફરક શક્ય');
  detail.append(footer);
  for(const button of month.querySelectorAll('.cal-day')){
   button.classList.toggle('selected',button.dataset.date===date);
   button.setAttribute('aria-pressed',String(button.dataset.date===date));
  }
 }
 function render(){
  const start=new Date(Date.UTC(y,m,1));
  const daysIn=new Date(Date.UTC(y,m+1,0)).getUTCDate();
  const label=new Intl.DateTimeFormat('gu-IN',{month:'long',year:'numeric',timeZone:'UTC'}).format(start);
  const firstDate=new Date(Date.UTC(y,m,1)).toISOString().slice(0,10);
  const lastDate=new Date(Date.UTC(y,m,daysIn)).toISOString().slice(0,10);
  const first=P?.forDate(firstDate),last=P?.forDate(lastDate);
  const lunar=first&&last?(first.month===last.month?first.month:first.month+' – '+last.month):'ગુજરાતી પંચાંગ';
  title.textContent=label;
  if($('lunarMonthHeading'))$('lunarMonthHeading').textContent=lunar+(first?' · વિ.સં. '+P.gu(first.samvat):'');
  month.replaceChildren();
  for(const d of ['રવિ','સોમ','મંગળ','બુધ','ગુરુ','શુક્ર','શનિ']){
   const el=make('div','cal-weekday',d);
   month.append(el);
  }
  for(let k=0;k<start.getUTCDay();k++)month.append(make('div','cal-empty'));
  for(let day=1;day<=daysIn;day++){
   const date=new Date(Date.UTC(y,m,day)).toISOString().slice(0,10);
   const event=C.events.filter(x=>x.date===date),p=P?.forDate(date);
   const el=make('button','cal-day'+(date===zone.date?' today':'')+(event.length?' has-event':'')+(p?.tithi==='પૂનમ'||p?.tithi==='અમાસ'?' moon-day':''));
   el.type='button';el.dataset.date=date;
   el.append(make('span','cal-number',P?P.gu(day):String(day)));
   el.append(make('small','cal-tithi',p?p.short:'—'));
   if(event.length)el.append(make('span','cal-event-dot','•'));
   el.title=(p?p.full:'તિથિ ઉપલબ્ધ નથી')+(event.length?' · '+event.map(e=>e.gu).join(', '):'');
   el.setAttribute('aria-label',date+' · '+(p?p.full:'તિથિ ઉપલબ્ધ નથી')+(event.length?' · '+event.map(e=>e.gu).join(' · '):''));
   el.onclick=()=>selectDay(date);
   month.append(el);
  }
  const selected=(y===Number(zone.date.slice(0,4))&&m===Number(zone.date.slice(5,7))-1)?zone.date:firstDate;
  selectDay(selected);
  if(hint)hint.textContent='દરેક તારીખમાં તિથિ · રંગીન ચિહ્ન તહેવાર · તારીખ પસંદ કરો';
 }
 back.onclick=()=>{m--;if(m<0){m=11;y--}render()};
 next.onclick=()=>{m++;if(m>11){m=0;y++}render()};
 reset.onclick=()=>{y=Number(zone.date.slice(0,4));m=Number(zone.date.slice(5,7))-1;render()};
 if(citySelect&&P)citySelect.onchange=()=>{P.setCity(citySelect.value);render()};
 render();
}

/* Replace fixed sample text with a fresh, curated wish on each visit.
   Category and event names stay tied to India-time calendar. */
if(window.SHUBH_DATA_READY?.then){
 window.SHUBH_DATA_READY.then(core=>{
  if(!core?.D||!window.ShubhFresh)return;
  const container=$('todayFeatures');if(!container)return;
  const panels=container.querySelectorAll('.smart-feature');
  const first=panels[0];
  const quality=x=>core.dbFeatured?.has('gu|'+current+'|'+x);
  const bank=core.D.wishes.gu?.[current]||[];
  const featured=bank.filter(quality),candidates=featured.length?featured:bank;
  const choice=window.ShubhFresh.pick(candidates,'home-daily-message:'+current);
  if(first&&choice){
   const h=first.querySelector('h3'),p=first.querySelector('p');
   if(h)h.textContent=core.titleFor(choice,current,'gu');
   if(p)p.textContent=choice;
  }
  const second=panels[1],todays=C.todayEvents(),next=C.upcoming(1)[0];
  if(second){
   const ev=todays[0]||next;
   const title=second.querySelector('h3'),body=second.querySelector('p');
   if(ev&&body){
    const fest=(core.D.wishes.gu?.festival||[]).filter(x=>core.dbFeatured?.has('gu|festival|'+x));
    const normal=C.normalize(ev.gu);
    const special=fest.filter(x=>C.normalize(x).includes(normal)||ev.aliases?.some(a=>a.length>=5&&C.normalize(x).includes(C.normalize(a))));
    const relevant=special.length?special:[];
    if(relevant.length){
     const text=window.ShubhFresh.pick(relevant,'home-festival:'+ev.gu);
     if(text)body.textContent=text;
    }else{
     const freshLines=[
      ev.gu+'ની ઉજવણી આવે એટલે એકબીજાને યાદ કરવાનો સુંદર બહાનો મળે છે. આજે કોઈ ખાસ વ્યક્તિને મીઠો સંદેશ મોકલજો. ✨',
      'આ '+ev.gu+' પર ભેટ કરતાં વધુ કિંમતી એક સાચી યાદ છે. કોઈ જૂના સંબંધમાં ફરી હૂંફ ઉમેરવાનો મોકો છે. 💌',
      ev.gu+'—ફક્ત કૅલેન્ડરની તારીખ નહીં, સાથે હસવા અને પ્રેમથી મળવાનો બહાનો. હૃદયથી શુભેચ્છા. 🌼'
     ];
     const txt=window.ShubhFresh.pick(freshLines,'home-festival:'+ev.gu);
     if(txt)body.textContent=txt;
    }
   }
  }
 }).catch(()=>{});
}

})();