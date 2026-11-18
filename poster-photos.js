(()=>{'use strict';
/* Curated Unsplash photo assets. Keep image credits and licensing review before commercial release. */
const photos=[
'photo-1470252649378-9c29740c9fa8',
'photo-1490750967868-88aa4486c946',
'photo-1519681393784-d120267933ba',
'photo-1441974231531-c6227db76b6e',
'photo-1518837695005-2083093ee35b',
'photo-1500534623283-312aade485b7',
'photo-1464366400600-7168b8af9bc3',
'photo-1518173946687-a4c8892bbd9f',
'photo-1470071459604-3b5ec3a7fe05',
'photo-1493246507139-91e8fad9978e'
];
function url(i,width=1080){return 'https://images.unsplash.com/'+photos[((i%photos.length)+photos.length)%photos.length]+'?auto=format&fit=crop&w='+width+'&h='+Math.round(width*1.25)+'&q=85'}
window.ShubhPosterPhotos={url,count:photos.length};
})();