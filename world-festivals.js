/* Curated worldwide festival names; not an exhaustive global calendar. */
(function(){'use strict';
const allItems=[
{id:"diwali",gu:"દિવાળી",hi:"दिवाली",en:"Diwali",aliases:["diwali","deepavali","deepawali","divali","દિવાળી","दीपावली"]},
{id:"holi",gu:"હોળી",hi:"होली",en:"Holi",aliases:["holi","holika","હોળી","होली"]},
{id:"navratri",gu:"નવરાત્રી",hi:"नवरात्रि",en:"Navratri",aliases:["navratri","navratree","garba","નવરાત્રી","नवरात्रि"]},
{id:"dussehra",gu:"દશેરા",hi:"दशहरा",en:"Dussehra",aliases:["dussehra","dasara","vijayadashami","દશેરા","दशहरा"]},
{id:"janmashtami",gu:"જન્માષ્ટમી",hi:"जन्माष्टमी",en:"Janmashtami",aliases:["janmashtami","janmastami","krishna janmashtami","જન્માષ્ટમી","जन्माष्टमी"]},
{id:"ganesh",gu:"ગણેશ ચતુર્થી",hi:"गणेश चतुर्थी",en:"Ganesh Chaturthi",aliases:["ganesh chaturthi","ganpati","ganeshotsav","ગણેશ ચતુર્થી","गणेश चतुर्थी"]},
{id:"eidfitr",gu:"ઈદ-ઉલ-ફિત્ર",hi:"ईद-उल-फ़ित्र",en:"Eid al-Fitr",aliases:["eid ul fitr","eid al fitr","ramzan eid","ramadan eid","ઈદ","ईद"]},
{id:"eidadha",gu:"ઈદ-ઉલ-અઝહા",hi:"ईद-उल-अज़हा",en:"Eid al-Adha",aliases:["eid al adha","bakrid","bakra eid","બકરી ઈદ","बकरीद"]},
{id:"ramadan",gu:"રમઝાન",hi:"रमज़ान",en:"Ramadan",aliases:["ramadan","ramzan","ramadhan","રમઝાન","रमजान"]},
{id:"christmas",gu:"નાતાલ",hi:"क्रिसमस",en:"Christmas",aliases:["christmas","xmas","cristmas","નાતાલ","क्रिसमस"]},
{id:"easter",gu:"ઈસ્ટર",hi:"ईस्टर",en:"Easter",aliases:["easter","easter sunday","ઈસ્ટર","ईस्टर"]},
{id:"goodfriday",gu:"ગુડ ફ્રાઇડે",hi:"गुड फ्राइडे",en:"Good Friday",aliases:["good friday","goodfriday","ગુડ ફ્રાઇડે","गुड फ्राइडे"]},
{id:"newyear",gu:"નવું વર્ષ",hi:"नया साल",en:"New Year",aliases:["new year","happy new year","newyear","નવું વર્ષ","नया साल"]},
{id:"chinesenewyear",gu:"ચાઇનીઝ નવું વર્ષ",hi:"चीनी नव वर्ष",en:"Chinese New Year",aliases:["chinese new year","lunar new year","spring festival","ચાઇનીઝ નવું વર્ષ"]},
{id:"vesak",gu:"બુદ્ધ પૂર્ણિમા",hi:"बुद्ध पूर्णिमा",en:"Vesak",aliases:["vesak","buddha purnima","buddha jayanti","બુદ્ધ પૂર્ણિમા","बुद्ध पूर्णिमा"]},
{id:"gurunanak",gu:"ગુરુ નાનક જયંતિ",hi:"गुरु नानक जयंती",en:"Guru Nanak Jayanti",aliases:["gurunanak","guru nanak jayanti","gurpurab","ગુરુ નાનક","गुरु नानक"]},
{id:"baisakhi",gu:"વૈશાખી",hi:"बैसाखी",en:"Vaisakhi",aliases:["vaisakhi","baisakhi","વૈશાખી","बैसाखी"]},
{id:"onam",gu:"ઓણમ",hi:"ओणम",en:"Onam",aliases:["onam","ઓણમ","ओणम"]},
{id:"pongal",gu:"પોંગલ",hi:"पोंगल",en:"Pongal",aliases:["pongal","thai pongal","પોંગલ","पोंगल"]},
{id:"lohri",gu:"લોહડી",hi:"लोहड़ी",en:"Lohri",aliases:["lohri","લોહડી","लोहड़ी"]},
{id:"makarsankranti",gu:"મકરસંક્રાંતિ",hi:"मकर संक्रांति",en:"Makar Sankranti",aliases:["makar sankranti","uttarayan","ઉત્તરાયણ","મકરસંક્રાંતિ","मकर संक्रांति"]},
{id:"mahavir",gu:"મહાવીર જયંતિ",hi:"महावीर जयंती",en:"Mahavir Jayanti",aliases:["mahavir jayanti","mahavir janma kalyanak","મહાવીર જયંતિ","महावीर जयंती"]},
{id:"paryushan",gu:"પર્યુષણ",hi:"पर्युषण",en:"Paryushan",aliases:["paryushan","paryusana","પર્યુષણ","पर्युषण"]},
{id:"hanukkah",gu:"હનુક્કાહ",hi:"हनुक्का",en:"Hanukkah",aliases:["hanukkah","chanukah","chanukkah","હનુક્કાહ","हनुक्का"]},
{id:"passover",gu:"પાસઓવર",hi:"पासओवर",en:"Passover",aliases:["passover","pesach","પાસઓવર","पासओवर"]},
{id:"roshhashanah",gu:"રોશ હશાનાહ",hi:"रोश हशाना",en:"Rosh Hashanah",aliases:["rosh hashanah","roshhashana","રોશ હશાનાહ"]},
{id:"yomkippur",gu:"યોમ કિપ્પુર",hi:"योम किप्पुर",en:"Yom Kippur",aliases:["yom kippur","yomkippur","યોમ કિપ્પુર"]},
{id:"nowruz",gu:"નવરોઝ",hi:"नवरोज़",en:"Nowruz",aliases:["nowruz","navroz","norooz","persian new year","નવરોઝ","नवरोज"]},
{id:"halloween",gu:"હેલોવીન",hi:"हैलोवीन",en:"Halloween",aliases:["halloween","haloween","હેલોવીન","हैलोवीन"]},
{id:"thanksgiving",gu:"થેન્ક્સગિવિંગ",hi:"थैंक्सगिविंग",en:"Thanksgiving",aliases:["thanksgiving","thanks giving","થેન્ક્સગિવિંગ"]},
{id:"oktoberfest",gu:"ઓક્ટોબરફેસ્ટ",hi:"ऑक्टोबरफेस्ट",en:"Oktoberfest",aliases:["oktoberfest","octoberfest","ઓક્ટોબરફેસ્ટ"]},
{id:"dia",gu:"દિયા દે લોસ મુએર્તોસ",hi:"दिया दे लॉस मुएर्तोस",en:"Día de los Muertos",aliases:["dia de los muertos","day of the dead","dia muertos"]},
{id:"songkran",gu:"સોંગક્રાન",hi:"सोंगक्रान",en:"Songkran",aliases:["songkran","thai new year","સોંગક્રાન"]},
{id:"loykrathong",gu:"લોય ક્રાથોંગ",hi:"लोय क्रथोंग",en:"Loy Krathong",aliases:["loy krathong","loi krathong"]},
{id:"tet",gu:"ટેટ",hi:"टेट",en:"Tết",aliases:["tet","vietnamese new year","tet nguyen dan"]},
{id:"midautumn",gu:"મિડ-ઓટમ ફેસ્ટિવલ",hi:"मिड ऑटम फेस्टिवल",en:"Mid-Autumn Festival",aliases:["mid autumn","moon festival","mooncake festival"]},
{id:"dragonboat",gu:"ડ્રેગન બોટ ફેસ્ટિવલ",hi:"ड्रैगन बोट फेस्टिवल",en:"Dragon Boat Festival",aliases:["dragon boat","duanwu","dragonboat"]},
{id:"chuseok",gu:"ચુસોક",hi:"चुसोक",en:"Chuseok",aliases:["chuseok","korean harvest festival"]},
{id:"seollal",gu:"સેઓલ્લાલ",hi:"सोल्लाल",en:"Seollal",aliases:["seollal","korean new year"]},
{id:"obon",gu:"ઓબોન",hi:"ओबोन",en:"Obon",aliases:["obon","bon festival","japan obon"]},
{id:"tanabata",gu:"તાનાબાતા",hi:"तानाबाता",en:"Tanabata",aliases:["tanabata","star festival japan"]},
{id:"setsu",gu:"સેત્સુબુન",hi:"सेत्सुबुन",en:"Setsubun",aliases:["setsubun","bean throwing festival"]},
{id:"intiraymi",gu:"ઇન્ટી રાયમી",hi:"इंटी रायमी",en:"Inti Raymi",aliases:["inti raymi","festival of sun peru"]},
{id:"carnival",gu:"કાર્નિવલ",hi:"कार्निवल",en:"Carnival",aliases:["carnival","karneval","rio carnival"]},
{id:"mardigras",gu:"માર્ડી ગ્રા",hi:"मार्डी ग्रा",en:"Mardi Gras",aliases:["mardi gras","fat tuesday"]},
{id:"stpatrick",gu:"સેન્ટ પેટ્રિક દિવસ",hi:"सेंट पैट्रिक दिवस",en:"St Patrick's Day",aliases:["saint patricks day","st patricks day","st patrick"]},
{id:"kwanzaa",gu:"ક્વાન્ઝા",hi:"क्वांज़ा",en:"Kwanzaa",aliases:["kwanzaa","ક્વાન્ઝા"]},
{id:"juneteenth",gu:"જૂનટીન્થ",hi:"जूनटीन्थ",en:"Juneteenth",aliases:["juneteenth","june nineteenth"]},
{id:"vesakday",gu:"વેસાક દિવસ",hi:"वेसाक दिवस",en:"Buddha Day",aliases:["buddha day","vesak day"]},
{id:"rakhi",gu:"રક્ષાબંધન",hi:"रक्षाबंधन",en:"Raksha Bandhan",aliases:["rakshbandhan","rakshabandhan","raksha bandhan","rakhi","રક્ષાબંધન","रक्षाबंधन"]},
{id:"devdiwali",gu:"દેવ દિવાળી",hi:"देव दिवाली",en:"Dev Diwali",aliases:["dev diwali","dev deepavali","દેવ દિવાળી","देव दिवाली"]},
{id:"bhai",gu:"ભાઈબીજ",hi:"भाई दूज",en:"Bhai Dooj",aliases:["bhai bij","bhaibeej","bhai dooj","ભાઈબીજ","भाई दूज"]},
{id:"tulsivivah",gu:"તુલસી વિવાહ",hi:"तुलसी विवाह",en:"Tulsi Vivah",aliases:["tulsi vivah","tulsi wedding","તુલસી વિવાહ"]},
{id:"ramnavami",gu:"રામ નવમી",hi:"राम नवमी",en:"Ram Navami",aliases:["ram navami","ramnavmi","રામ નવમી","राम नवमी"]},
{id:"mahashivratri",gu:"મહાશિવરાત્રી",hi:"महाशिवरात्रि",en:"Maha Shivratri",aliases:["mahashivratri","shivratri","મહાશિવરાત્રી","महाशिवरात्रि"]},
{id:"hanuman",gu:"હનુમાન જયંતિ",hi:"हनुमान जयंती",en:"Hanuman Jayanti",aliases:["hanuman jayanti","hanuman janmotsav","હનુમાન જયંતિ","हनुमान जयंती"]},
{id:"durga",gu:"દુર્ગા પૂજા",hi:"दुर्गा पूजा",en:"Durga Puja",aliases:["durga puja","durgapuja","દુર્ગા પૂજા","दुर्गा पूजा"]},
{id:"karvachauth",gu:"કરવા ચોથ",hi:"करवा चौथ",en:"Karwa Chauth",aliases:["karwa chauth","karvachauth","કરવા ચોથ","करवा चौथ"]}
]; 
// Only Hindu festival categories are exposed to cards, search matching and wishes.
const hinduFestivalIds=new Set(["diwali","holi","navratri","dussehra","janmashtami","ganesh","newyear","onam","pongal","lohri","makarsankranti","rakhi","devdiwali","bhai","tulsivivah","ramnavami","mahashivratri","hanuman","durga","karvachauth"]);
const items=allItems.filter(item=>hinduFestivalIds.has(item.id));
const norm=s=>String(s||'').toLocaleLowerCase().normalize('NFKC').replace(/[._\\-]+/g,' ').replace(/\\s+/g,' ').trim();
const compact=s=>norm(s).replace(/\\s/g,'');
function dist(a,b){if(Math.abs(a.length-b.length)>3)return 99;let row=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let old=row[0];row[0]=i;for(let j=1;j<=b.length;j++){let temp=row[j];row[j]=Math.min(row[j]+1,row[j-1]+1,old+(a[i-1]===b[j-1]?0:1));old=temp}}return row[b.length]}
function match(input){const q=compact(input);if(q.length<3)return null;let best=null,lowest=99;for(const it of items){for(const name of [it.gu,it.hi,it.en,...it.aliases]){const a=compact(name);if(!a)continue;if(q===a)return it;if(a.length>=5&&q.includes(a)&&q.length-a.length<=10)return it;const d=dist(q,a);if(d<lowest){lowest=d;best=it}}}return lowest<=Math.min(3,Math.floor(q.length*.25))?best:null}
function messages(it,lang){const name=it[lang]||it.en;const lines=lang==='hi'?[name+' के अवसर पर आपके जीवन में सुख, शांति और खुशियाँ बनी रहें। हार्दिक शुभकामनाएँ!',name+' का यह खास अवसर आपके परिवार के लिए प्रेम, आनंद और नई उम्मीदें लेकर आए। शुभकामनाएँ!']:lang==='en'?['Wishing you and your family happiness, peace and togetherness on '+name+'.','May '+name+' bring warm memories, kindness and joy to you and your loved ones.']:[name+'ના અવસરે તમારા જીવનમાં સુખ, શાંતિ અને આનંદ છલકાય. હાર્દિક શુભેચ્છાઓ!',name+'નો આ ખાસ પ્રસંગ તમારા પરિવાર માટે પ્રેમ, ખુશીઓ અને નવી આશાઓ લઈને આવે. શુભકામનાઓ!'];return lines.map(body=>({category:'festival',language:lang,title:name+' · '+(lang==='en'?'Greetings':lang==='hi'?'शुभकामनाएँ':'શુભેચ્છાઓ'),body,featured:true,event:true}))}
window.ShubhWorldFestivals={match,messages,items};
})();