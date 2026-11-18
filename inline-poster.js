/* Free, browser-rendered AI message poster with ShubhLink footer branding. */
(function(){'use strict';
function poster(message,topic,index,lang){
 const W=900,H=1200,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
 const palette=[['#33274e','#ad6d96'],['#123b4b','#4c9e94'],['#3e2450','#cf875d'],['#222d59','#6d77b9'],['#493047','#c27d83']][index%5];
 const grad=x.createLinearGradient(0,0,W,H);grad.addColorStop(0,palette[0]);grad.addColorStop(1,palette[1]);x.fillStyle=grad;x.fillRect(0,0,W,H);
 const shine=x.createRadialGradient(690,230,20,690,230,500);shine.addColorStop(0,'rgba(255,227,170,.45)');shine.addColorStop(1,'rgba(255,227,170,0)');x.fillStyle=shine;x.fillRect(0,0,W,H);
 x.strokeStyle='rgba(255,235,203,.32)';x.lineWidth=2;x.strokeRect(35,35,W-70,H-70);x.strokeRect(47,47,W-94,H-94);
 x.fillStyle='rgba(255,255,255,.09)';for(let i=0;i<18;i++){const px=(i*173+89)%W,py=(i*233+97)%H;x.beginPath();x.arc(px,py,6+(i%4)*9,0,Math.PI*2);x.fill()}
 x.textAlign='center';x.fillStyle='#fff3d6';x.font='65px serif';x.fillText('✦',W/2,205);
 const boxX=74,boxY=280,boxW=W-148,boxH=655;x.fillStyle='rgba(255,252,248,.94)';x.beginPath();x.roundRect(boxX,boxY,boxW,boxH,38);x.fill();
 x.fillStyle='#50394f';x.textBaseline='middle';
 function lines(txt,maxWidth,font){x.font=font;const words=String(txt).trim().split(/\s+/);let result=[],line='';for(const word of words){const test=line?line+' '+word:word;if(x.measureText(test).width<=maxWidth){line=test;continue}if(line)result.push(line);line='';for(const ch of Array.from(word)){if(x.measureText(line+ch).width>maxWidth&&line){result.push(line);line=''}line+=ch}}if(line)result.push(line);return result}
 let size=49,wrapped=[];do{wrapped=lines(message,boxW-100,'600 '+size+'px "Noto Sans Gujarati",sans-serif');if(wrapped.length*size*1.7<boxH-120)break;size-=2}while(size>25);
 const lh=size*1.65;let y=boxY+boxH/2-(Math.min(wrapped.length,13)-1)*lh/2;
 x.font='600 '+size+'px "Noto Sans Gujarati",sans-serif';for(const line of wrapped.slice(0,13)){x.fillText(line,W/2,y);y+=lh}
 x.textBaseline='alphabetic';x.fillStyle='#fff';x.font='bold 33px Inter,sans-serif';x.fillText('✦ ShubhLink',W/2,1080);x.font='22px Inter,sans-serif';x.fillText('shubhlink.github.io',W/2,1120);
 return c
}
function attach(target,message,topic,index,lang,photo){
 const holder=document.createElement('div');holder.className='ai-direct-poster';const canvas=poster(message,topic,index,lang);canvas.setAttribute('aria-label','તમારું ShubhLink પોસ્ટર');holder.append(canvas);if(photo){const img=new Image();img.onload=()=>{const x=canvas.getContext('2d');x.save();x.beginPath();x.roundRect(115,65,670,260,26);x.clip();const ratio=Math.max(670/img.width,260/img.height),w=img.width*ratio,h=img.height*ratio;x.drawImage(img,450-w/2,195-h/2,w,h);x.restore();x.fillStyle='rgba(255,255,255,.94)';x.fillRect(75,345,750,580);x.fillStyle='#50394f';x.textAlign='center';x.textBaseline='middle';let size=43,words=String(message).trim().split(/\\s+/),lines=[];do{lines=[];x.font='600 '+size+'px "Noto Sans Gujarati",sans-serif';let line='';for(const word of words){const t=line?line+' '+word:word;if(x.measureText(t).width>670&&line){lines.push(line);line=word}else line=t}if(line)lines.push(line);if(lines.length*size*1.55<520)break;size-=2}while(size>23);let y=635-(lines.length-1)*size*.78;for(const line of lines.slice(0,14)){x.fillText(line,450,y);y+=size*1.55}};img.src=photo;}
 const buttons=document.createElement('div');buttons.className='ai-direct-poster-actions';
 const download=document.createElement('button');download.type='button';download.textContent='⬇ PNG ડાઉનલોડ';download.onclick=()=>{const a=document.createElement('a');a.href=canvas.toDataURL('image/png');a.download='ShubhLink-poster.png';a.click()};
 const share=document.createElement('button');share.type='button';share.textContent='↗ પોસ્ટર શેર કરો';share.onclick=async()=>{try{const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('PNG unavailable');const file=new File([blob],'ShubhLink-poster.png',{type:'image/png'});if(navigator.canShare?.({files:[file]})){await navigator.share({files:[file],title:'ShubhLink Poster'});return}download.click()}catch(e){if(e.name!=='AbortError')download.click()}};
 buttons.append(download,share);holder.append(buttons);target.append(holder);return holder
}
window.ShubhInlinePoster={attach};
})();