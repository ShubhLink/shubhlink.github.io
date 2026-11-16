/* ShubhLink festival calendar: Gujarat-focused, calendar year 2026–2027.
   Movable observances are manually curated; review annually.
   Sources: Gujarat GAD 2027 notification 04-Nov-2026 and 2026 Gujarati Panchang.
   Dates are indicative, particularly lunar/Muslim observances. */
(function(){
'use strict';
const items=[
["2026-11-14","લાભ પંચમ","लाभ पंचमी","Labh Pancham","🌼","festival","labh pancham,લાભ પાંચમ,લાભ પંચમી,लाभ पंचम"],
["2026-11-16","જલારામ બાપા જયંતિ","जलाराम बापा जयंती","Jalaram Jayanti","🙏","festival","jalaram,jalaram bapa,જલારામ,जलाराम"],
["2026-11-20","દેવઉઠી એકાદશી","देवउठनी एकादशी","Dev Uthani Ekadashi","🪔","festival","ekadashi,એકાદશી,एकादशी,devuthani"],
["2026-11-21","તુલસી વિવાહ","तुलसी विवाह","Tulsi Vivah","🌿","festival","tulsi,tulasi,તુલસી,तुलसी विवाह"],
["2026-11-24","દેવ દિવાળી","देव दीपावली","Dev Diwali","🪔","festival","dev diwali,dev deepawali,દેવ દિવાળી,देव दिवाली,kartik purnima"],
["2026-11-24","ગુરુ નાનક જયંતિ","गुरु नानक जयंती","Guru Nanak Jayanti","🙏","festival","gurunanak,guru nanak,ગુરુ નાનક,गुरु नानक"],
["2026-12-25","નાતાલ","क्रिसमस","Christmas","🎄","festival","christmas,xmas,નાતાલ,क्रिसमस"],
["2027-01-01","નવું વર્ષ","नया साल","New Year","🎉","festival","new year,happy new year,નવું વર્ષ,नया साल"],
["2027-01-14","ઉત્તરાયણ","मकर संक्रांति","Uttarayan","🪁","festival","uttarayan,makar sankranti,ઉત્તરાયણ,મકરસંક્રાંતિ,मकर संक्रांति"],
["2027-01-26","ગણતંત્ર દિવસ","गणतंत्र दिवस","Republic Day","🇮🇳","festival","republic day,26 january,ગણતંત્ર,गणतंत्र"],
["2027-02-11","વસંત પંચમી","वसंत पंचमी","Vasant Panchami","🌼","festival","vasant panchami,saraswati puja,વસંત પંચમી,सरस्वती"],
["2027-03-06","મહાશિવરાત્રી","महाशिवरात्रि","Maha Shivratri","🔱","festival","shivratri,mahadev,મહાશિવરાત્રી,शिवरात्रि"],
["2027-03-10","રમઝાન ઈદ","ईद-उल-फितर","Eid al-Fitr","🌙","festival","eid,ramzan eid,રમઝાન ઈદ,ईद"],
["2027-03-23","ધૂળેટી","धुलेंडी","Holi / Dhuleti","🎨","festival","holi,dhuleti,હોળી,ધૂળેટી,होली"],
["2027-04-07","ચેટીચાંદ","चेटीचंड","Cheti Chand","🌺","festival","cheti chand,ચેટીચાંદ,चेटीचंड"],
["2027-04-14","આંબેડકર જયંતિ","आंबेडकर जयंती","Ambedkar Jayanti","🇮🇳","festival","ambedkar,આંબેડકર,आंबेडकर"],
["2027-04-15","રામ નવમી","राम नवमी","Ram Navami","🚩","festival","ram navami,ramnavami,રામ નવમી,राम नवमी"],
["2027-04-19","મહાવીર જયંતિ","महावीर जयंती","Mahavir Jayanti","🪷","festival","mahavir,મહાવીર,महावीर"],
["2027-05-09","અખાત્રીજ","अक्षय तृतीया","Akshaya Tritiya","✨","festival","akhatrij,akshaya tritiya,અખાત્રીજ,अक्षय तृतीया"],
["2027-07-05","રથયાત્રા","रथ यात्रा","Rath Yatra","🚩","festival","rath yatra,jagannath,રથયાત્રા,रथयात्रा"],
["2027-08-15","સ્વતંત્રતા દિવસ","स्वतंत्रता दिवस","Independence Day","🇮🇳","festival","independence day,15 august,સ્વતંત્રતા,स्वतंत्रता"],
["2027-08-17","રક્ષાબંધન","रक्षाबंधन","Raksha Bandhan","🧵","festival","rakshabandhan,rakhi,રક્ષાબંધન,રાખડી,राखी"],
["2027-08-25","જન્માષ્ટમી","जन्माष्टमी","Janmashtami","🦚","festival","janmashtami,krishna,કૃષ્ણ,જન્માષ્ટમી,जन्माष्टमी"],
["2027-09-04","ગણેશ ચતુર્થી","गणेश चतुर्थी","Ganesh Chaturthi","🐘","festival","ganesh,gannapati,ગણેશ,गणेश"],
["2027-09-30","નવરાત્રી પ્રારંભ","नवरात्रि प्रारंभ","Navratri Begins","💃","festival","navratri,garba,નવરાત્રી,ગરબા,नवरात्रि"],
["2027-10-02","ગાંધી જયંતિ","गांधी जयंती","Gandhi Jayanti","🇮🇳","festival","gandhi,ગાંધી,गांधी"],
["2027-10-09","દશેરા","दशहरा","Dussehra","🏹","festival","dussehra,vijayadashami,દશેરા,दशहरा"],
["2027-10-29","દિવાળી","दीवाली","Diwali","🪔","festival","diwali,deepawali,દિવાળી,दीवाली,દિપાવલી"],
["2027-10-30","ગુજરાતી નવું વર્ષ","गुजराती नव वर्ष","Gujarati New Year","🎊","festival","bestu varas,gujarati new year,બેસતું વર્ષ,નવું વર્ષ"],
["2027-10-31","ભાઈબીજ","भाई दूज","Bhai Beej","💛","festival","bhai beej,bhai dooj,ભાઈબીજ,भाई दूज"],
["2027-11-14","ગુરુ નાનક જયંતિ","गुरु नानक जयंती","Guru Nanak Jayanti","🙏","festival","gurunanak,guru nanak,ગુરુ નાનક,गुरु नानक"],
["2027-12-25","નાતાલ","क्रिसमस","Christmas","🎄","festival","christmas,xmas,નાતાલ,क्रिसमस"]
].map(([date,gu,hi,en,emoji,category,aliases])=>({date,gu,hi,en,emoji,category,aliases:aliases.split(',')}));
function indiaTime(d=new Date()){
 const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'}).formatToParts(d);
 const obj=Object.fromEntries(parts.filter(p=>p.type!=='literal').map(x=>[x.type,x.value]));
 return {date:obj.year+'-'+obj.month+'-'+obj.day,hour:Number(obj.hour)};
}
function diffDays(a,b){return Math.round((Date.parse(a+'T00:00:00Z')-Date.parse(b+'T00:00:00Z'))/86400000)}
function dateLabel(date,language='gu'){
 return new Intl.DateTimeFormat(language==='gu'?'gu-IN':language==='hi'?'hi-IN':'en-IN',{day:'numeric',month:'short',year:'numeric',timeZone:'Asia/Kolkata'}).format(new Date(date+'T06:00:00Z'))
}
function currentCategory(){
 const h=indiaTime().hour;
 return h>=5&&h<12?'morning':h>=20||h<5?'night':'suvichar';
}
function upcoming(limit=8){const today=indiaTime().date;return items.filter(e=>e.date>=today).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,limit)}
function todayEvents(){const today=indiaTime().date;return items.filter(e=>e.date===today)}
function normalize(s){return String(s||'').toLocaleLowerCase().normalize('NFKC').replace(/[^\p{L}\p{M}\p{N}]+/gu,' ').trim()}
function findEvents(query){
 const q=normalize(query);
 if(!q)return [];
 return items.filter(e=>[e.gu,e.hi,e.en,...e.aliases].some(x=>normalize(x).includes(q)||q.includes(normalize(x)))).slice(0,12)
}
window.ShubhCalendar={events:items,indiaTime,currentCategory,upcoming,todayEvents,dateLabel,diffDays,findEvents,normalize};
})();
