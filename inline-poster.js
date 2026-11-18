/* ShubhLink: font-safe, responsive poster rendering, zero paid image calls. */
(()=>{'use strict';
const W=900,H=1200;
const palettes=[['#251b46','#9763a5'],['#073f48','#53a18c'],['#4b214a','#d48d60'],['#18254f','#697ac5']];
async function fontReady(){try{await document.fonts.load('600 42px "Noto Sans Gujarati"');await document.fonts.ready}catch(_){}}
function wrap(ctx,text,max){const words=String(text).replace(/\s+/g,' ').trim().split(' '),rows=[];let line='';for(const word of words){if(!word)continue;const candidate=line?line+' '+word:word;if(ctx.measureText(candidate).width<=max){line=candidate;continue}if(line)rows.push(line);line=word;if(ctx.measureText(line).width>max){const chars=Array.from(word);line='';for(const ch of chars){if(line&&ctx.measureText(line+ch).width>max){rows.push(line);line=''}line+=ch}}}if(line)rows.push(line);return rows}
function cover(ctx,img,x,y,w,h){const scale=Math.max(w/img.width,h/img.height),dw=img.width*scale,dh=img.height*scale;ctx.drawImage(img,x+(w-dw)/2,y+(h-dh)/2,dw,dh)}
async function draw(canvas,message,index,photo){
 await fontReady();const ctx=canvas.getContext('2d');const [a,b]=palettes[index%palettes.length];const grad=ctx.createLinearGradient(0,0,W,H);grad.addColorStop(0,a);grad.addColorStop(1,b);ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
 const glow=ctx.createRadialGradient(690,160,5,690,160,630);glow.addColorStop(0,'#ffffff36');glow.addColorStop(1,'#ffffff00');ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);
 ctx.strokeStyle='#ffffff70';ctx.lineWidth=2;ctx.strokeRect(32,32,W-64,H-64);
 const hasPhoto=!!photo;let panelY=hasPhoto?535:270,panelH=hasPhoto?460:655;
 if(hasPhoto){try{const img=new Image();img.src=photo;await img.decode();ctx.save();ctx.beginPath();ctx.roundRect(82,78,736,420,30);ctx.clip();cover(ctx,img,82,78,736,420);ctx.restore()}catch(_){panelY=270;panelH=655}}
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
 const holder=document.createElement('div');holder.className='ai-direct-poster';const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;canvas.setAttribute('aria-label','ShubhLink પોસ્ટર');holder.append(canvas);
 let ready=draw(canvas,message,index,photo);const buttons=document.createElement('div');buttons.className='ai-direct-poster-actions';
 const download=document.createElement('button');download.type='button';download.textContent='⬇ PNG ડાઉનલોડ';download.onclick=async()=>{await ready;const link=document.createElement('a');link.download='ShubhLink-poster.png';link.href=canvas.toDataURL('image/png');link.click()};
 const share=document.createElement('button');share.type='button';share.textContent='↗ પોસ્ટર શેર કરો';share.onclick=async()=>{try{await ready;const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('PNG unavailable');const file=new File([blob],'ShubhLink-poster.png',{type:'image/png'});if(navigator.canShare?.({files:[file]})){await navigator.share({files:[file],title:'ShubhLink Poster'})}else download.click()}catch(e){if(e.name!=='AbortError')download.click()}};
 buttons.append(download,share);holder.append(buttons);target.append(holder);return holder
}
window.ShubhInlinePoster={attach};
})();