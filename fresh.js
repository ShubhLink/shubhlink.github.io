/* ShubhLink Fresh Picks — anonymous browser-based novelty, not IP tracking.
   Keeps a small rolling record of public message IDs already shown on this device.
   Never stores or requests phone numbers, logins or visitor identifiers. */
(function(){
'use strict';
const prefix='shubhlink_seen_v2_',cache=new Map(),maxSaved=200;
function hash(x){let v=2166136261;for(let i=0;i<x.length;i++){v^=x.charCodeAt(i);v=Math.imul(v,16777619)}return (v>>>0).toString(36)}
function id(item){return hash(typeof item==='string'?item:String(item?.body||item?.id||JSON.stringify(item)))}
function load(key){
 if(cache.has(key))return cache.get(key);
 let arr=[];try{arr=JSON.parse(localStorage.getItem(prefix+hash(key))||'[]');if(!Array.isArray(arr))arr=[]}catch(_){}
 const list=arr.slice(-maxSaved);cache.set(key,list);return list
}
function save(key,arr){cache.set(key,arr.slice(-maxSaved));try{localStorage.setItem(prefix+hash(key),JSON.stringify(arr.slice(-maxSaved)))}catch(_){}}
function shuffle(items){const arr=items.slice();for(let i=arr.length-1;i>0;i--){let j;if(globalThis.crypto?.getRandomValues){const b=new Uint32Array(1);crypto.getRandomValues(b);j=b[0]%(i+1)}else j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]}return arr}
function choose(items,key,limit=12,opts={}){
 if(!Array.isArray(items)||!items.length)return [];
 const ids=new Set(),unique=[];
 for(const item of items){const x=id(item);if(!ids.has(x)){ids.add(x);unique.push(item)}}
 let history=load(key),used=new Set(history);
 let fresh=unique.filter(x=>!used.has(id(x)));
 // A collection can be finite; when exhausted, restart a new randomized cycle.
 if(fresh.length===0){history=[];used=new Set();fresh=unique.slice()}
 const priority=x=>Number(opts.quality?.(x)||0);
 const group=shuffle(fresh).sort((a,b)=>priority(b)-priority(a));
 let chosen=group.slice(0,limit);
 if(chosen.length<limit){
  // Avoid double-showing within the same batch.
  const seenInBatch=new Set(chosen.map(id));
  const others=shuffle(unique.filter(x=>!seenInBatch.has(id(x)))).sort((a,b)=>priority(b)-priority(a));
  chosen.push(...others.slice(0,limit-chosen.length));
 }
 history.push(...chosen.map(id));save(key,history);
 return chosen
}
function pick(items,key,opts){return choose(items,key,1,opts)[0]}
window.ShubhFresh={choose,pick,shuffle,id};
})();