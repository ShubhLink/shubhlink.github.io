const CACHE='shubhlink-shell-v3';
const SHELL=['./','./index.html','./categories.html','./wishes.html','./search.html','./favorites.html','./ai.html','./icon.svg','./site.css','./unified.css','./data.js','./reference-home.js','./daily-loader.js'];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(async cache=>{
  await Promise.allSettled(SHELL.map(url=>cache.add(url)));
 }).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('shubhlink-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET'||new URL(req.url).origin!==location.origin)return;
 const url=new URL(req.url);
 if(url.pathname.endsWith('/categories.html')||url.pathname.endsWith('/site.js')||url.pathname.endsWith('/festival-categories.js')||url.pathname.endsWith('/daily-content.json')){
  event.respondWith(fetch(req,{cache:'no-store'}).catch(()=>caches.match(req)));
  return;
 }
 if(req.mode==='navigate'){
  event.respondWith(fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(cache=>cache.put(req,copy));}return res;}).catch(()=>caches.match(req).then(r=>r||caches.match('./index.html'))));
  return;
 }
 event.respondWith(fetch(req).then(response=>{
  if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(req,copy));}
  return response;
 }).catch(()=>caches.match(req)));
});
