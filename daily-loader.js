(function(){
'use strict';
let messages=[];
window.ShubhDaily={
 get:(category,language)=>messages.filter(m=>m.category===category&&m.language===language).map(m=>({body:m.body,title:'',source:'ai_daily',generated_on:m.date,created_at:m.date})),
 all:()=>messages.slice()
};
fetch('daily-content.json?v='+new Date().toISOString().slice(0,10),{cache:'no-store'})
 .then(r=>r.ok?r.json():{messages:[]})
 .then(data=>{messages=Array.isArray(data.messages)?data.messages.filter(m=>m&&typeof m.body==='string'&&typeof m.category==='string'&&['gu','hi','en'].includes(m.language)):[];document.dispatchEvent(new Event('shubh-daily-ready'));})
 .catch(()=>{});
})();