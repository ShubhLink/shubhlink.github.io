/* ShubhLink category messages — show messages immediately, no intermediary 'more' step.
   Static originals render at once; newest published Supabase messages hydrate in place. */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const data=window.SHUBHLINK_DATA||{categories:[],wishes:{}};
const backend=window.SHUBHLINK_BACKEND||{};
const list=$("wishGrid"), catSel=$("filterCat"), langSel=$("filterLang"),search=$("filterSearch");
if(!list||!catSel||!langSel||!search)return;
const params=new URLSearchParams(location.search);
const languages=["gu","hi","en"];
const categories=data.categories.filter(c=>c.id!=="afternoon");
const festivals=window.ShubhWorldFestivals?.items||[];
for(const f of festivals)if(!categories.some(c=>c.id===f.id))categories.push({id:f.id,gu:f.gu,hi:f.hi,en:f.en,emoji:"🌺"});
const cache=new Map();
const short=s=>String(s||"").replace(/[\u0000-\u001f]/g," ").trim();
const label=(cat,l)=>cat?.[l]||cat?.gu||"મેસેજ";
const fallbackTitle=(body,cat)=>{
  const plain=short(body).replace(/^[^\p{L}\p{N}]+/u,"");
  const sentences=plain.split(/[.!?।॥
]/).map(v=>v.trim()).filter(Boolean);
  const title=sentences.find(v=>v.length>7)||sentences[0]||cat?.gu||"ખાસ મેસેજ";
  return title.length>65?title.slice(0,62)+"…":title;
};
const requestedCat=params.get("c");
let currentCat=categories.some(c=>c.id===requestedCat)?requestedCat:"morning";
let currentLang=languages.includes(params.get("l"))?params.get("l"):"gu";
let fetchSequence=0;
let visibleCount=30;
function addCategory(c){
 if(!c||c.id==="afternoon"||categories.some(item=>item.id===c.id))return;
 categories.push(c);
 const option=document.createElement("option");
 option.value=c.id;option.textContent=(c.emoji||"💌")+" "+c.gu;catSel.append(option);
}
categories.forEach(c=>{
 const option=document.createElement("option");option.value=c.id;
 option.textContent=(c.emoji||"💌")+" "+c.gu;catSel.append(option);
});
catSel.value=currentCat;langSel.value=currentLang;
function builtIn(category,language){
 return (data.wishes?.[language]?.[category]||[]).map((body,i)=>({
   body,title:fallbackTitle(body,categories.find(c=>c.id===category)),
   published:false,created_at:"",key:"old-"+i,featured:false
 }));
}
function assembled(category,language){
 const key=category+"|"+language;
 const base=builtIn(category,language);
 if(language==="gu"&&window.ShubhExpandedMessages){const fest=festivals.find(f=>f.id===category);for(const [i,body] of window.ShubhExpandedMessages.generate(category,fest?.gu).entries())base.push({body,title:fest?.gu||categories.find(c=>c.id===category)?.gu,key:"expanded-"+i});}
 const saved=[...(window.ShubhDaily?.get(category,language)||[]),...(cache.get(key)||[])];
 const seen=new Set();
 const rows=[];
 for(const m of [...saved,...base]){
  const body=short(m.body);
  if(!body||seen.has(body))continue;
  seen.add(body);
  rows.push({...m,body});
 }
 return rows;
}
function messageCard(message,category,language){
 const info=categories.find(c=>c.id===category);
 const card=document.createElement("article");card.className="wishitem";card.tabIndex=0;card.setAttribute("role","button");card.setAttribute("aria-label","મેસેજનું Preview જુઓ");
 const tag=document.createElement("span");tag.className="wishtag";
 tag.textContent=(info?.emoji||"💌")+" "+label(info,language);
 const today=new Date(Date.now()+19800000).toISOString().slice(0,10);
 if(message.source==="ai_daily"&&message.generated_on===today){
  const fresh=document.createElement("span");fresh.className="wish-daily-label";
  fresh.textContent="✨ આજે નવું";card.append(fresh);
 }
 const h=document.createElement("h3");h.textContent=message.title||fallbackTitle(message.body,info);
 const p=document.createElement("p");p.textContent=message.body;
 const actions=document.createElement("div");actions.className="wish-actions";
 const share=document.createElement("button");
 share.type="button";share.className="wish-whatsapp";
 share.textContent="◉ WhatsApp પર શેર કરો";
 share.onclick=()=>{
  if(window.ShubhShare?.open){
   window.ShubhShare.open({title:h.textContent,body:message.body,language,category});
  }else{
   const text=h.textContent+"

"+message.body+"

🔗 ShubhLink પર મેસેજ બનાવો
https://shubhlink.github.io/";
   window.open("https://api.whatsapp.com/send?text="+encodeURIComponent(text),"_blank","noopener");
  }
 };
 const preview=()=>window.ShubhShare?.open({title:h.textContent,body:message.body,language,category});
 card.addEventListener("click",e=>{if(e.target.closest("button,a,input,select"))return;preview()});
 card.addEventListener("keydown",e=>{if(e.target===card&&(e.key==="Enter"||e.key===" ")){e.preventDefault();preview()}});
 actions.append(share);card.append(tag,h,p,actions);
 return card;
}
document.addEventListener('shubh-daily-ready',()=>render());
function render(){
 const c=catSel.value,l=langSel.value;
 const info=categories.find(x=>x.id===c);
 if(!info)return;
 $("wishHeading").textContent=(info.emoji||"💌")+" "+label(info,l);
 const intro=$("wishIntro");if(intro)intro.hidden=true;
 const query=short(search.value).toLocaleLowerCase();
 const rows=assembled(c,l).filter(m=>!query||(m.body+" "+m.title).toLocaleLowerCase().includes(query));
 // Rotate visible messages on every page opening/refresh, without changing search results.
 if(!query&&rows.length>1){
  const storageKey="shubhlink-last-first:"+c+":"+l;
  let previous="";try{previous=sessionStorage.getItem(storageKey)||""}catch(_e){}
  for(let i=rows.length-1;i>0;i--){
   const j=Math.floor(Math.random()*(i+1));[rows[i],rows[j]]=[rows[j],rows[i]];
  }
  if(rows[0].body===previous){const swapIndex=rows.findIndex(x=>x.body!==previous);if(swapIndex>0)[rows[0],rows[swapIndex]]=[rows[swapIndex],rows[0]];}
  try{sessionStorage.setItem(storageKey,rows[0].body)}catch(_e){}
 }
 const frag=document.createDocumentFragment();
 for(const row of rows.slice(0,visibleCount))frag.append(messageCard(row,c,l));
 list.replaceChildren(frag);
 if(rows.length>visibleCount){const more=document.createElement("button");more.type="button";more.className="refresh-wishes";more.textContent="વધુ મેસેજ જુઓ ("+(rows.length-visibleCount)+" બાકી)";more.onclick=()=>{visibleCount+=30;render()};list.append(more);}
 const meta=$("resultMeta");
 if(meta)meta.textContent=rows.length+" મેસેજ";
 if(!rows.length){
  const empty=document.createElement("p");empty.className="empty";
  empty.textContent="આ વિષયનો મેસેજ મળ્યો નથી.";
  list.append(empty);
 }
 const url=new URL(location.href);
 url.searchParams.set("c",c);url.searchParams.set("l",l);
 history.replaceState(null,"",url);
}
async function hydrate(category,language){
 const key=category+"|"+language;
 if(cache.has(key)){render();return;}
 if(!backend.url||!backend.publishableKey)return;
 const sequence=++fetchSequence;
 try{
  const url=backend.url.replace(/\/$/,"")+"/rest/v1/shubhlink_messages?select=id,category_id,language,title,body,featured,created_at,source,generated_on"+
   "&category_id=eq."+encodeURIComponent(category)+
   "&language=eq."+encodeURIComponent(language)+
   "&is_published=eq.true&order=created_at.desc&limit=500";
  const response=await fetch(url,{headers:{apikey:backend.publishableKey},cache:"no-store"});
  if(!response.ok)throw Error("Messages API failed");
  const records=await response.json();
  cache.set(key,records.map(m=>({...m,published:true})));
  if(sequence===fetchSequence&&catSel.value===category&&langSel.value===language)render();
 }catch(err){
  console.warn("Showing built-in ShubhLink messages",err);
 }
}
async function loadCategories(){
 if(!backend.url||!backend.publishableKey)return;
 try{
  const url=backend.url.replace(/\/$/,"")+"/rest/v1/shubhlink_categories?select=id,emoji,name_gu,name_hi,name_en,description_gu,color&is_active=eq.true";
  const response=await fetch(url,{headers:{apikey:backend.publishableKey}});
  if(!response.ok)return;
  const rows=await response.json();
  for(const c of rows)addCategory({
   id:c.id,emoji:c.emoji,gu:c.name_gu,hi:c.name_hi,en:c.name_en,
   desc:c.description_gu,color:c.color
  });
  if(requestedCat&&categories.some(c=>c.id===requestedCat)&&catSel.value!==requestedCat){
   catSel.value=requestedCat;
   changeCategory();
  }
 }catch(_err){}
}
function changeCategory(){
 visibleCount=30;
 currentCat=catSel.value;currentLang=langSel.value;
 render();
 hydrate(currentCat,currentLang);
}
catSel.onchange=changeCategory;langSel.onchange=changeCategory;
search.oninput=()=>render();
render(); // Critical: static messages are visible before any fetch finishes.
hydrate(currentCat,currentLang);
loadCategories();
})();
