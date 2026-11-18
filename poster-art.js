(function(){'use strict';
const themes=[
{a:'#f9d7a0',b:'#ec875c',ink:'#743f36',kind:'sunrise'},
{a:'#f9d9e7',b:'#b66ba1',ink:'#672a58',kind:'flowers'},
{a:'#101d4d',b:'#5d4d9a',ink:'#fff2cb',kind:'moon'},
{a:'#e5e9cc',b:'#84b7a2',ink:'#24534a',kind:'leaves'},
{a:'#2e173f',b:'#b65352',ink:'#ffe8b1',kind:'diya'},
{a:'#dcebf4',b:'#8cb4d1',ink:'#234a64',kind:'mountains'},
{a:'#ffe3c4',b:'#d681a2',ink:'#6c3358',kind:'balloons'},
{a:'#0b4b51',b:'#147f72',ink:'#fff2c8',kind:'mandala'},
{a:'#f5e1c5',b:'#d5a675',ink:'#70482c',kind:'temple'},
{a:'#252c65',b:'#a4569c',ink:'#fff1ce',kind:'stars'}
];
function artwork(i){const t=themes[((i%10)+10)%10];let shapes='';const circle=(x,y,r,fill,extra='')=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+fill+'" '+extra+'/>';
const path=(d,fill,extra='')=>'<path d="'+d+'" fill="'+fill+'" '+extra+'/>';
if(t.kind==='sunrise'){shapes+=circle(540,430,185,'#fff2c2','opacity=".9"');for(let n=0;n<15;n++){const a=n*Math.PI*2/15;shapes+='<path d="M '+(540+205*Math.cos(a))+' '+(430+205*Math.sin(a))+' L '+(540+265*Math.cos(a))+' '+(430+265*Math.sin(a))+'" stroke="#ffe8ad" stroke-width="14" stroke-linecap="round"/>'}shapes+=path('M0 640 Q280 380 560 650 T1080 610 V1350 H0Z','#ad705b','opacity=".32"')+path('M0 760 Q320 580 600 770 T1080 720 V1350 H0Z','#a05251','opacity=".3"')}
if(t.kind==='flowers'){for(let k=0;k<9;k++){const x=k%2?975:95,y=150+k*130;shapes+='<path d="M'+x+' '+y+' q 120 60 10 175" stroke="#476f5c" stroke-width="12" fill="none"/>';for(let j=0;j<6;j++){const a=j*Math.PI/3;shapes+=circle(x+Math.cos(a)*43,y+Math.sin(a)*43,31,k%2?'#f7d2db':'#fff1d7','opacity=".85"')}shapes+=circle(x,y,22,'#dc9d48')}}
if(t.kind==='moon'){shapes+=circle(750,360,170,'#fff4c8')+circle(805,320,170,'#2e2d69');for(let k=0;k<65;k++){const x=(k*173+77)%1080,y=(k*239+67)%1040;shapes+=circle(x,y,k%5===0?5:2,'#fff7d8','opacity=".8"')}shapes+=path('M0 990 Q270 860 550 980 T1080 970 V1350 H0Z','#282756','opacity=".75"')}
if(t.kind==='leaves'){for(let k=0;k<18;k++){const x=k%2?990:90,y=120+Math.floor(k/2)*145,dir=k%2?-1:1;shapes+=path('M'+x+' '+y+' q '+(dir*185)+' -65 '+(dir*155)+' 130 q '+(-dir*165)+' 20 '+(-dir*155)+' -130Z','#4f8b70','opacity=".48"')}}
if(t.kind==='diya'){for(let k=0;k<5;k++){const x=180+k*180,y=250+(k%2)*75;shapes+=path('M'+(x-55)+' '+y+' Q'+x+' '+(y+130)+' '+(x+55)+' '+y+'Z','#efb765')+path('M'+x+' '+(y-20)+' Q'+(x-60)+' '+(y-110)+' '+x+' '+(y-145)+' Q'+(x+60)+' '+(y-85)+' '+x+' '+(y-20)+'Z','#ffe0a0')}shapes+=path('M0 1000 Q500 820 1080 1000 V1350 H0Z','#581e46','opacity=".65"')}
if(t.kind==='mountains'){shapes+=circle(790,270,125,'#fff3d4');shapes+=path('M0 800 L310 350 L630 800 L820 520 L1080 850 V1350 H0Z','#6c94a5','opacity=".62"')+path('M0 930 L410 530 L760 930 L950 680 L1080 870 V1350 H0Z','#406e88','opacity=".65"')}
if(t.kind==='balloons'){for(let k=0;k<10;k++){const x=80+k*105,y=130+(k%4)*100;shapes+=circle(x,y,48,k%3===0?'#fff1c6':k%3===1?'#ef8c9e':'#b67ba9','opacity=".83"')+'<path d="M'+x+' '+(y+48)+' Q'+(x+40)+' '+(y+140)+' '+x+' '+(y+240)+'" fill="none" stroke="#a66a78" stroke-width="3"/>'}}
if(t.kind==='mandala'){for(let ring=0;ring<4;ring++){const r=190+ring*75;for(let k=0;k<20;k++){const a=k*Math.PI/10,x=540+r*Math.cos(a),y=410+r*Math.sin(a);shapes+='<ellipse cx="'+x+'" cy="'+y+'" rx="24" ry="68" transform="rotate('+(a*180/Math.PI+90)+' '+x+' '+y+')" fill="none" stroke="#f1d4a1" stroke-width="4" opacity=".35"/>'}}}
if(t.kind==='temple'){shapes+=circle(540,340,230,'#fff4cf','opacity=".65"')+path('M260 690 L540 240 L820 690Z','#a76e4b','opacity=".6"')+path('M340 690 L540 365 L740 690Z','#fff1d0','opacity=".9"')+path('M250 690 H830 V750 H250Z','#9b6b49','opacity=".75"');for(let k=0;k<6;k++){const x=300+k*90;shapes+='<rect x="'+x+'" y="740" width="22" height="220" fill="#9b6b49" opacity=".45"/>'}}
if(t.kind==='stars'){for(let k=0;k<35;k++){const x=(k*199+91)%1080,y=(k*257+49)%1100;shapes+='<path d="M'+x+' '+(y-12)+' l 6 12 -6 12 -6 -12Z" fill="#fff0c6" opacity=".7"/>'}shapes+=path('M0 950 Q250 720 540 950 T1080 930 V1350 H0Z','#d59ac4','opacity=".2"')}
const svg='<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350"><defs><linearGradient id="bg" x2=".7" y2="1"><stop stop-color="'+t.a+'"/><stop offset="1" stop-color="'+t.b+'"/></linearGradient></defs><rect width="1080" height="1350" fill="url(#bg)"/>'+shapes+'<rect x="35" y="35" width="1010" height="1280" rx="42" fill="none" stroke="'+t.ink+'" stroke-width="5" opacity=".55"/></svg>';
return {svg,ink:t.ink,src:'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)}}
window.ShubhPosterArt={artwork,count:10};
})();