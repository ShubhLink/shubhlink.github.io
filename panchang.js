/* ShubhLink Gujarati Panchang
   Calculated locally at Ahmedabad sunrise (23.0225°N, 72.5714°E).
   Astronomy Engine (MIT) + approximate Lahiri ayanamsha.
   Amanta lunar months, Gujarati month names, tithi & nakshatra.
   Not an official muhurat or religious decision calendar. */
(function(){
"use strict";
const A=window.Astronomy;
const months=["ચૈત્ર","વૈશાખ","જેઠ","અષાઢ","શ્રાવણ","ભાદરવો","આસો","કારતક","માગશર","પોષ","મહા","ફાગણ"];
const tithis=["એકમ","બીજ","ત્રીજ","ચોથ","પાંચમ","છઠ","સાતમ","આઠમ","નોમ","દશમ","અગિયારસ","બારસ","તેરસ","ચૌદસ","પૂનમ"];
const nakshatras=["અશ્વિની","ભરણી","કૃત્તિકા","રોહિણી","મૃગશીર્ષ","આર્દ્રા","પુનર્વસુ","પુષ્ય","આશ્લેષા","મઘા","પૂર્વાફાલ્ગુની","ઉત્તરાફાલ્ગુની","હસ્ત","ચિત્રા","સ્વાતિ","વિશાખા","અનુરાધા","જ્યેષ્ઠા","મૂળ","પૂર્વાષાઢા","ઉત્તરાષાઢા","શ્રવણ","ધનિષ્ઠા","શતભિષા","પૂર્વાભાદ્રપદા","ઉત્તરાભાદ્રપદા","રેવતી"];
const gu=n=>new Intl.NumberFormat("gu-IN",{useGrouping:false}).format(n);
const geo=A?new A.Observer(23.0225,72.5714,53):null;
const cache=new Map(),years=new Map();
const dayMS=86400000;
const mod=(x,n)=>(x%n+n)%n;
function dayStart(date){return new Date(date+"T00:00:00+05:30")}
function nextDate(date){return new Date(dayStart(date).getTime()+dayMS).toLocaleDateString("en-CA",{timeZone:"Asia/Kolkata"}).replace(/^(\d{4})-(\d{2})-(\d{2})$/,"$1-$2-$3")}
function localISO(date){
 const obj=Object.fromEntries(new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(date).filter(x=>x.type!=="literal").map(x=>[x.type,x.value]));
 return obj.year+"-"+obj.month+"-"+obj.day;
}
function sunrise(date){
 if(!A)return null;
 const time=A.SearchRiseSet(A.Body.Sun,geo,+1,dayStart(date),1);
 return time?.date||null;
}
function ayanamsa(date){
 const year=date.getUTCFullYear()+(date.getUTCMonth()+date.getUTCDate()/30)/12;
 return 24.2325+(year-(2026+10.5/12))*0.013969;
}
function solarSign(date){
 const lon=A.SunPosition(date).elon;
 return Math.floor(mod(lon-ayanamsa(date),360)/30);
}
function nextNewMoon(after){
 return A.SearchMoonPhase(0,new Date(after.getTime()+3600000),40)?.date||null
}
function lunaAt(date){
 const prev=A.SearchMoonPhase(0,date,-36)?.date;
 if(!prev)return null;
 const next=nextNewMoon(prev);
 if(!next)return null;
 const first=solarSign(prev),following=solarSign(next);
 const monthIndex=(first+1)%12;
 const leap=first===following;
 return {monthIndex,month:months[monthIndex],leap,next,prev,skipped:mod(following-first,12)>1};
}
function newYearDate(year){
 if(years.has(year))return years.get(year);
 let probe=A.SearchMoonPhase(0,new Date(Date.UTC(year,8,1)),40)?.date;
 let answer=null;
 for(let k=0;k<5&&probe;k++){
  const next=nextNewMoon(probe);if(!next)break;
  const sign=solarSign(probe);
  if(sign===6&&solarSign(next)!==sign){
   const day=localISO(probe),rise=sunrise(day);
   answer=rise&&probe.getTime()<rise.getTime()?day:localISO(new Date(dayStart(day).getTime()+dayMS));
   break;
  }
  probe=next;
 }
 years.set(year,answer);return answer;
}
function forDate(date){
 if(cache.has(date))return cache.get(date);
 if(!A){cache.set(date,null);return null}
 try{
  const rise=sunrise(date);if(!rise)throw Error("No sunrise");
  const phase=A.MoonPhase(rise);
  const tithiNo=Math.max(1,Math.min(30,Math.floor(phase/12)+1));
  const sud=tithiNo<=15,dayNo=sud?tithiNo:tithiNo-15;
  const tithi=tithiNo===15?"પૂનમ":tithiNo===30?"અમાસ":tithis[dayNo-1];
  const paksha=sud?"સુદ":"વદ";
  const lunar=lunaAt(rise);if(!lunar)throw Error("No lunar month");
  const nlon=A.EclipticGeoMoon(rise).lon;
  const nIndex=Math.floor(mod(nlon-ayanamsa(rise),360)/(360/27));
  const gy=Number(date.slice(0,4)),ny=newYearDate(gy);
  const samvat=gy+(ny&&date>=ny?57:56);
  const monthText=(lunar.leap?"અધિક ":"")+lunar.month;
  const answer={date,sunrise:rise,month:monthText,paksha,tithi,tithiNo,dayNo,nakshatra:nakshatras[nIndex],samvat,
   short:(sud?"સુદ ":"વદ ")+(tithiNo===15||tithiNo===30?tithi:gu(dayNo)),
   full:monthText+" "+paksha+" "+tithi,
   displayDate:new Intl.DateTimeFormat("gu-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric",timeZone:"UTC"}).format(new Date(date+"T12:00:00Z")),
   verified:false};
  cache.set(date,answer);return answer;
 }catch(err){console.warn("Panchang calculation failed",date,err);cache.set(date,null);return null}
}
window.ShubhPanchang={forDate,months,gu,available:!!A,city:"અમદાવાદ",basis:"સ્થાનિક સૂર્યોદય",newYearDate};
})();
