/* Small offline Gujarati name transliteration helper.
   User can always edit the result; uncommon names are phonetic approximations. */
(function(){
'use strict';
const names={
divyesh:'દિવ્યેશ',divya:'દિવ્યા',patel:'પટેલ',hardik:'હાર્દિક',kiran:'કિરણ',kiranbhai:'કિરણભાઈ',ramesh:'રમેશ',rameshbhai:'રમેશભાઈ',suresh:'સુરેશ',mahesh:'મહેશ',rahul:'રાહુલ',raj:'રાજ',rajesh:'રાજેશ',jay:'જય',jai:'જય',jayesh:'જયેશ',jignesh:'જિજ્ઞેશ',jigar:'જિગર',paresh:'પરેશ',priya:'પ્રિયા',priyanka:'પ્રિયંકા',pooja:'પૂજા',puja:'પૂજા',geeta:'ગીતા',gita:'ગીતા',bhavesh:'ભાવેશ',bhavin:'ભાવિન',amit:'અમિત',amita:'અમિતા',manish:'મનીષ',rohit:'રોહિત',rohan:'રોહન',mehul:'મેહુલ',neha:'નેહા',sejal:'સેજલ',kinjal:'કિંજલ',bipin:'બિપિન',vivek:'વિવેક',shubham:'શુભમ',nilesh:'નિલેશ',nitin:'નિતિન',dhruv:'ધ્રુવ',yash:'યશ',yashvi:'યશ્વી',krishna:'કૃષ્ણ',dinesh:'દિનેશ',hitesh:'હિતેશ',mayur:'મયૂર',nisha:'નિશા',anil:'અનિલ',sunil:'સુનીલ',kalpesh:'કલ્પેશ',hiren:'હિરેન',hiral:'હીરલ',parth:'પાર્થ',nayan:'નયન',darshan:'દર્શન',vinay:'વિનય',milan:'મિલન',anjali:'અંજલિ',komal:'કોમલ',dipak:'દીપક',deepak:'દીપક',payal:'પાયલ',shah:'શાહ',desai:'દેસાઈ',bhai:'ભાઈ',ben:'બેન',sanjay:'સંજય',sachin:'સચિન',nikhil:'નિખિલ',kishan:'કિશન',ishan:'ઈશાન',ishita:'ઈશિતા',khushi:'ખુશી',krunal:'કૃણાલ',nikita:'નિકિતા',pankaj:'પંકજ',akash:'આકાશ',aakash:'આકાશ',asha:'આશા',ashish:'આશિષ',shreya:'શ્રેયા',shruti:'શ્રુતિ',hetal:'હેતલ',vaishali:'વૈશાલી',rashmi:'રશ્મિ',rekha:'રેખા',sonal:'સોનલ',mohan:'મોહન',mohit:'મોહિત',arjun:'અર્જુન',arvind:'અરવિંદ',pratik:'પ્રતીક',pratiksha:'પ્રતીક્ષા',dipesh:'દીપેશ',sandip:'સંદીપ',sandeep:'સંદીપ',harsh:'હર્ષ',harshad:'હર્ષદ',chintan:'ચિંતન',ravi:'રવિ',raviya:'રવિયા',krupa:'કૃપા',krupali:'કૃપાલી',kanha:'કાન્હા',sita:'સીતા',ram:'રામ',ramji:'રામજી',shyam:'શ્યામ',shyamji:'શ્યામજી',lalit:'લલિત',lalita:'લલિતા',smit:'સ્મિત',smita:'સ્મિતા',dipti:'દીપ્તિ',deepti:'દીપ્તિ',meet:'મીત',mihir:'મિહિર',nidhi:'નિધિ',riddhi:'રિદ્ધિ',siddhi:'સિદ્ધિ',ishwar:'ઈશ્વર',prem:'પ્રેમ',jaydeep:'જયદીપ',tej:'તેજ',tejas:'તેજસ',dev:'દેવ',devang:'દેવાંગ'
};
const con={chh:'છ',kh:'ખ',gh:'ઘ',ch:'ચ',jh:'ઝ',th:'થ',dh:'ધ',ph:'ફ',bh:'ભ',sh:'શ',ng:'ઙ',ny:'ઞ',k:'ક',g:'ગ',c:'ક',j:'જ',t:'ત',d:'દ',n:'ન',p:'પ',b:'બ',m:'મ',y:'ય',r:'ર',l:'લ',v:'વ',w:'વ',s:'સ',h:'હ',f:'ફ',z:'ઝ',q:'ક',x:'ક્સ'};
const vowel={aa:['આ','ા'],ai:['ઐ','ૈ'],au:['ઔ','ૌ'],ee:['ઈ','ી'],ii:['ઈ','ી'],oo:['ઊ','ૂ'],uu:['ઊ','ૂ'],a:['અ',''],e:['એ','ે'],i:['ઇ','િ'],o:['ઓ','ો'],u:['ઉ','ુ']};
function phonetic(word){
 const str=word.toLowerCase().replace(/[^a-z]/g,'');
 if(!str)return word;
 if(names[str])return names[str];
 let out='',i=0,previousConsonant=false;
 while(i<str.length){
  let found=false;
  for(const n of [3,2,1]){
   const x=str.slice(i,i+n);
   if(vowel[x]&&x.length===n){
    out+=previousConsonant?vowel[x][1]:vowel[x][0];
    previousConsonant=false;i+=n;found=true;break;
   }
  }
  if(found)continue;
  for(const n of [3,2,1]){
   const x=str.slice(i,i+n);
   if(con[x]&&x.length===n){
    if(previousConsonant)out+='્';
    out+=con[x];previousConsonant=true;i+=n;found=true;break;
   }
  }
  if(!found){out+=str[i++];previousConsonant=false}
 }
 return out;
}
function convert(input){
 return String(input||'').replace(/[A-Za-z]+/g,word=>{
  const lower=word.toLowerCase();
  return names[lower]||phonetic(word);
 });
}
function prepare(input,language){
 const x=String(input||'').trim();
 return language==='gu'&&/[A-Za-z]/.test(x)?convert(x):x;
}
window.ShubhNames={convert,prepare};
})();
