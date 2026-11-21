(function(){'use strict';
const visuals={
diwali:['🪔','https://images.pexels.com/photos/1363876/pexels-photo-1363876.jpeg'],
holi:['🎨','https://images.pexels.com/photos/1145977/pexels-photo-1145977.jpeg'],
navratri:['💃','https://images.pexels.com/photos/1701194/pexels-photo-1701194.jpeg'],
dussehra:['🏹','https://images.pexels.com/photos/1363876/pexels-photo-1363876.jpeg'],
janmashtami:['🦚','https://images.pexels.com/photos/161154/stained-glass-spiral-pattern-glass-161154.jpeg'],
ganesh:['🐘','https://images.pexels.com/photos/2090651/pexels-photo-2090651.jpeg'],
christmas:['🎄','https://images.pexels.com/photos/1303081/pexels-photo-1303081.jpeg'],
newyear:['🎆','https://images.pexels.com/photos/1363876/pexels-photo-1363876.jpeg'],
eidfitr:['🌙','https://images.pexels.com/photos/208732/pexels-photo-208732.jpeg'],
eidadha:['🌙','https://images.pexels.com/photos/208732/pexels-photo-208732.jpeg'],
ramadan:['🌙','https://images.pexels.com/photos/208732/pexels-photo-208732.jpeg'],
makarsankranti:['🪁','https://images.pexels.com/photos/163097/sky-clouds-cloudy-weather-163097.jpeg'],
valentine:['❤️','https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg']
};
function render(){
 const host=document.getElementById('festivalCards');if(!host||!window.ShubhWorldFestivals)return;
 host.replaceChildren();
 for(const it of window.ShubhWorldFestivals.items||[]){
  const a=document.createElement('a');a.className='festival-category-card';a.href='wishes.html?c='+encodeURIComponent(it.id);
  const visual=document.createElement('span');visual.className='festival-photo-icon';
  const [emoji,src]=visuals[it.id]||['🌺','https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg'];
  visual.textContent=emoji;
  if(src){const img=document.createElement('img');img.src=src+'?auto=compress&cs=tinysrgb&w=240';img.alt='';img.loading='lazy';img.onerror=()=>img.remove();visual.append(img)}
  const title=document.createElement('strong');title.textContent=it.gu;
  a.append(visual,title);host.append(a);
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render);else render();
})();