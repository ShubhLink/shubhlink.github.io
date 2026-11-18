(()=>{'use strict';
const el=document.getElementById('readyPosterGrid');if(!el||!window.ShubhPosterArt)return;
const designs=[
 ['morning','દરેક સવાર નવી આશા લઈને આવે'],
 ['birthday','તમારા જીવનમાં ખુશીઓ ખીલતી રહે'],
 ['night','ચાંદની જેવી શાંતિ જીવનમાં રહે'],
 ['thought','સુંદર વિચારો જીવનને ઉજ્જવળ બનાવે'],
 ['festival','ઘરમાં આનંદ અને સમૃદ્ધિ છવાય'],
 ['morning','આજનો દિવસ યાદગાર બની રહે'],
 ['birthday','સપનાંઓને નવી પાંખો મળે'],
 ['night','મીઠાં સપનાંઓની સુંદર રાત'],
 ['thought','સારા કર્મો જ સાચી ઓળખ છે'],
 ['festival','પ્રેમ અને પ્રકાશથી જીવન ઝળહળે']
];
function render(){el.replaceChildren();designs.forEach(([key,message],i)=>{const art=window.ShubhPosterArt.artwork(i),a=document.createElement('a');a.href='poster-maker.html?occasion='+key+'&design='+i;a.className='ready-poster-card';a.setAttribute('aria-label',message+' — પોસ્ટર બનાવો');
const img=document.createElement('img');img.src=window.ShubhPosterPhotos?window.ShubhPosterPhotos.url(i,720):art.src;img.onerror=()=>{img.onerror=null;img.src=art.src};img.alt='સુંદર પ્રીમિયમ પોસ્ટર બેકગ્રાઉન્ડ';img.loading=i<4?'eager':'lazy';a.appendChild(img);
const overlay=document.createElement('div');overlay.className='ready-poster-overlay';const quote=document.createElement('strong');quote.textContent=message;overlay.appendChild(quote);a.appendChild(overlay);
const edit=document.createElement('span');edit.className='ready-poster-edit';edit.textContent='✦ તમારું નામ ઉમેરો';a.appendChild(edit);el.appendChild(a)})}
render();document.addEventListener('shubh-artwork-ready',render);
})();