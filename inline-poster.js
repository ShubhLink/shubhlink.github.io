/* ShubhLink: font-safe, responsive poster rendering, zero paid image calls. */
(()=>{'use strict';
const W=900,H=1200;
const palettes=[['#251b46','#9763a5'],['#073f48','#53a18c'],['#4b214a','#d48d60'],['#18254f','#697ac5']];
async function fontReady(){try{await document.fonts.load('600 42px "Noto Sans Gujarati"');await document.fonts.ready}catch(_){}}
function wrap(ctx,text,max){const words=String(text).replace(/\s+/g,' ').trim().split(' '),rows=[];let line='';for(const word of words){if(!word)continue;const candidate=line?line+' '+word:word;if(ctx.measureText(candidate).width<=max){line=candidate;continue}if(line)rows.push(line);line=word;if(ctx.measureText(line).width>max){const chars=Array.from(word);line='';for(const ch of chars){if(line&&ctx.measureText(line+ch).width>max){rows.push(line);line=''}line+=ch}}}if(line)rows.push(line);return rows}
function cover(ctx,img,x,y,w,h){const scale=Math.min(w/img.width,h/img.height),dw=img.width*scale,dh=img.height*scale;ctx.fillStyle='#1c1728';ctx.fillRect(x,y,w,h);ctx.drawImage(img,x+(w-dw)/2,y+(h-dh)/2,dw,dh)}
async function draw(canvas,message,index,photo){
 await fontReady();const ctx=canvas.getContext('2d');const [a,b]=palettes[index%palettes.length];const grad=ctx.createLinearGradient(0,0,W,H);grad.addColorStop(0,a);grad.addColorStop(1,b);ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
 const glow=ctx.createRadialGradient(690,160,5,690,160,630);glow.addColorStop(0,'#ffffff36');glow.addColorStop(1,'#ffffff00');ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);
 ctx.strokeStyle='#ffffff70';ctx.lineWidth=2;ctx.strokeRect(32,32,W-64,H-64);
 const hasPhoto=!!photo;let panelY=hasPhoto?650:270,panelH=hasPhoto?345:655;
 if(hasPhoto){try{const img=new Image();img.src=photo;await img.decode();ctx.save();ctx.beginPath();ctx.roundRect(82,60,736,560,30);ctx.clip();cover(ctx,img,82,60,736,560);ctx.restore()}catch(_){panelY=270;panelH=655}}
 else{ctx.fillStyle='#f7dbab';ctx.font='76px serif';ctx.textAlign='center';ctx.fillText('✦',450,180)}
 ctx.fillStyle='#fffaf3';ctx.beginPath();ctx.roundRect(75,panelY,750,panelH,30);ctx.fill();
 ctx.save();ctx.beginPath();ctx.rect(112,panelY+30,676,panelH-60);ctx.clip();
 let size=48,rows=[];while(size>=24){ctx.font='600 '+size+'px "Noto Sans Gujarati",sans-serif';rows=wrap(ctx,message,640);if(rows.length*size*1.7<=panelH-95)break;size-=2}
 const lh=size*1.7;ctx.font='600 '+size+'px "Noto Sans Gujarati",sans-serif';ctx.fillStyle='#422b43';ctx.textAlign='center';ctx.textBaseline='middle';
 const limit=Math.floor((panelH-80)/lh);const shown=rows.slice(0,limit);if(rows.length>limit&&shown.length)shown[shown.length-1]=shown[shown.length-1].slice(0,-3)+'…';
 let y=panelY+panelH/2-(shown.length-1)*lh/2;for(const line of shown){ctx.fillText(line,450,y,640);y+=lh}ctx.restore();
 ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.fillStyle='#fff';ctx.font='bold 34px Inter,sans-serif';ctx.fillText('✦ ShubhLink',450,1083);ctx.font='23px Inter,sans-serif';ctx.fillText('shubhlink.github.io',450,1122);
}
function attach(target,message,topic,index,lang,photo){
 const holder=document.createElement('div');holder.className='ai-direct-poster';
 const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;canvas.setAttribute('aria-label','પોસ્ટર Preview ખોલો');canvas.setAttribute('role','button');canvas.tabIndex=0;
 let current=message,ready=draw(canvas,current,index,photo);
 const save=async()=>{await ready;const a=document.createElement('a');a.download='ShubhLink-poster.png';a.href=canvas.toDataURL('image/png');a.click()};
 const share=async()=>{try{await ready;const blob=await new Promise(ok=>canvas.toBlob(ok,'image/png'));if(!blob)return;const file=new File([blob],'ShubhLink-poster.png',{type:'image/png'});if(navigator.canShare?.({files:[file]}))await navigator.share({files:[file],title:'ShubhLink'});else await save()}catch(e){if(e.name!=='AbortError')await save()}};
 const overlay=document.createElement('div');overlay.className='ai-poster-modal';overlay.hidden=true;overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','પોસ્ટર Preview');
 const head=document.createElement('div');head.className='ai-poster-modal-head';const title=document.createElement('strong');title.textContent='પોસ્ટર Preview';
 const edit=document.createElement('button');edit.type='button';edit.textContent='✎ Edit';
 const down=document.createElement('button');down.type='button';down.textContent='↓ Download';down.onclick=save;
 const close=document.createElement('button');close.type='button';close.textContent='✕';close.setAttribute('aria-label','બંધ કરો');
 head.append(title,edit,down,close);
 const preview=document.createElement('canvas');preview.width=W;preview.height=H;preview.className='ai-poster-modal-canvas';
 const editor=document.createElement('div');editor.className='ai-poster-editor';editor.hidden=true;
 const textarea=document.createElement('textarea');textarea.value=current;textarea.rows=4;textarea.setAttribute('aria-label','પોસ્ટરનો મેસેજ બદલો');
 const apply=document.createElement('button');apply.type='button';apply.textContent='✓ ફેરફાર સાચવો';apply.onclick=async()=>{current=textarea.value.trim()||current;ready=draw(canvas,current,index,photo);await ready;preview.getContext('2d').drawImage(canvas,0,0);editor.hidden=true};
 editor.append(textarea,apply);
 const bottom=document.createElement('div');bottom.className='ai-poster-modal-actions';const shareBtn=document.createElement('button');shareBtn.type='button';shareBtn.textContent='↗ Share';shareBtn.onclick=share;bottom.append(shareBtn);
 overlay.append(head,preview,editor,bottom);document.body.append(overlay);
 const open=async()=>{overlay.hidden=false;document.body.classList.add('ai-poster-open');await ready;preview.getContext('2d').drawImage(canvas,0,0)};
 const hide=()=>{overlay.hidden=true;document.body.classList.remove('ai-poster-open');editor.hidden=true};
 close.onclick=hide;overlay.addEventListener('click',e=>{if(e.target===overlay)hide()});edit.onclick=()=>{editor.hidden=!editor.hidden;if(!editor.hidden)textarea.focus()};
 canvas.onclick=open;canvas.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}};
 const buttons=document.createElement('div');buttons.className='ai-direct-poster-actions';
 const openBtn=document.createElement('button');openBtn.type='button';openBtn.textContent='◱ Preview';openBtn.onclick=open;
 const download=document.createElement('button');download.type='button';download.textContent='↓ Download';download.onclick=save;
 buttons.append(openBtn,download);holder.append(canvas,buttons);target.append(holder);return holder
}
window.ShubhInlinePoster={attach};
})();
