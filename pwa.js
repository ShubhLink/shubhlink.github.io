(function(){
'use strict';
let pendingInstall=null;
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();pendingInstall=event;});
window.ShubhInstall=async function(){
 if(pendingInstall){
  const prompt=pendingInstall;pendingInstall=null;
  await prompt.prompt();
  return;
 }
 if(window.matchMedia('(display-mode: standalone)').matches){
  alert('ShubhLink App પહેલેથી Install થયેલી છે.');return;
 }
 alert('ShubhLink App Install કરવા Chrome Browser માં સાઇટ ખોલો અને ⋮ → Install app અથવા Add to Home screen પસંદ કરો. સીધી APK ફાઇલ હજી ઉપલબ્ધ નથી.');
};
if('serviceWorker' in navigator){
 window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(err=>console.warn('Offline support unavailable',err)));
}
})();
