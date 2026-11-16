// ShubhLink — server-only daily Gemini publisher; requires Vault cron authorization.
type Plan={category_id:string;language:"gu"|"hi"|"en";focus:string};
const url=Deno.env.get("SUPABASE_URL")||"";
const service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
const gemini=Deno.env.get("GEMINI_API_KEY")||"";
const cats=["morning","birthday","suvichar","friendship","night","newthought","festival","anniversary","congrats"];
const subjects:Record<string,string>={
 morning:"good morning warmth using a specific fresh everyday scene",
 birthday:"birthday love and personal family or friendship memories",
 suvichar:"a novel insight about kindness, honesty, gratitude and everyday courage",
 friendship:"the bond between real friends and specific memories",
 night:"quiet good night comfort and restful imagery",
 newthought:"an original positive insight with a practical human example",
 festival:"celebration, family, joy and tradition, without made-up festival dates",
 anniversary:"years of understanding, respect and companionship",
 congrats:"hard-won achievement, congratulations with genuinely personal warmth"
};
const headers={"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"};
const reply=(obj:unknown,status=200)=>new Response(JSON.stringify(obj),{status,headers});
const today=()=>new Date(Date.now()+19800000).toISOString().slice(0,10);
const brief=(x:unknown,n=650)=>String(x??"").trim().slice(0,n);
async function rpc(name:string,args:Record<string,unknown>){
 const resp=await fetch(url.replace(/\/$/,"")+"/rest/v1/rpc/"+name,{
  method:"POST",headers:{apikey:service,Authorization:"Bearer "+service,"Content-Type":"application/json"},
  body:JSON.stringify(args)
 });
 if(!resp.ok)throw Error("db_"+name+"_"+resp.status);
 return resp.json();
}
async function recentMessages(){
 const resp=await fetch(url.replace(/\/$/,"")+"/rest/v1/shubhlink_messages?select=language,title,body&is_published=eq.true&order=created_at.desc&limit=15",{
  headers:{apikey:service,Authorization:"Bearer "+service}
 });
 if(!resp.ok)return [];
 const a=await resp.json();
 return Array.isArray(a)?a.map((x:Record<string,unknown>)=>brief(x.language+": "+x.title+" — "+x.body,200)):[];
}
function plan(date:string):Plan[]{
 const n=Math.floor(Date.parse(date+"T00:00:00Z")/86400000);
 const c=(i:number)=>cats[(n+i)%cats.length];
 const pick=(category_id:string,language:Plan["language"])=>({category_id,language,focus:subjects[category_id]});
 return [
  pick("morning","gu"),pick("suvichar","gu"),pick(c(0),"gu"),
  pick(c(3),"gu"),pick(c(5),"hi"),pick(c(7),"en")
 ];
}
async function generate(plans:Plan[],recent:string[]){
 const briefs=plans.map((p,i)=>(i+1)+". category_id="+p.category_id+", language="+p.language+": "+p.focus).join("\n");
 const instructions=[
  "Write SIX ORIGINAL, premium WhatsApp greetings and short heartfelt thoughts for ShubhLink in India.",
  "One fresh title and full message per listed brief. EXACT category_id and language from each brief, in the same order.",
  "Four Gujarati messages in proper Gujarati script, one fluent Hindi in Devanagari, one natural English.",
  "Each body 75-300 characters, 2-3 meaningful sentences, unique human details, memorable original imagery.",
  "Avoid all tired formulas like 'તમારા જીવનમાં ખુશીઓ', 'આ ખાસ દિવસે', 'May all dreams come true'. No repetitive openings or closings.",
  "Make each distinct in idea and structure, not merely different emoji; not overly flowery or fake personal specifics.",
  "Titles 8-60 characters, artistic but clear. Max two tasteful emoji per body. No hashtags, links, phone numbers, made-up calendar dates.",
  "BRIEFS:\n"+briefs,
  "AVOID copying or paraphrasing these recent messages:\n"+recent.join("\n"),
  "Return valid JSON ONLY: {\"messages\":[{\"category_id\":\"morning\",\"language\":\"gu\",\"title\":\"...\",\"body\":\"...\"}, ...]}. Exactly six objects."
 ].join("\n");
 const requestBody=JSON.stringify({contents:[{parts:[{text:instructions}]}],generationConfig:{
  temperature:1.07,topP:0.97,maxOutputTokens:2400,responseMimeType:"application/json"
 }});
 const call=()=>fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",{
  method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":gemini},
  body:requestBody,signal:AbortSignal.timeout(24000)
 });
 let resp=await call();
 if(resp.status===503){await resp.text().catch(()=>undefined);await new Promise(r=>setTimeout(r,800));resp=await call()}
 if(!resp.ok)throw Error("gemini_"+resp.status);
 const obj=await resp.json();
 const raw=brief(obj?.candidates?.[0]?.content?.parts?.map((p:{text?:string})=>p.text||"").join(""),16000);
 let parsed;try{parsed=JSON.parse(raw)}catch{throw Error("invalid_ai_json")}
 if(!Array.isArray(parsed?.messages))throw Error("invalid_ai_messages");
 const result=[],seen=new Set();
 for(let i=0;i<Math.min(6,parsed.messages.length);i++){
  const v=parsed.messages[i],p=plans[i];
  if(v?.language!==p.language||v?.category_id!==p.category_id)continue;
  const body=brief(v.body),title=brief(v.title,125);
  if(body.length<30||title.length<4)continue;
  const key=body.toLowerCase().replace(/\s+/g,"");
  if(seen.has(key))continue;seen.add(key);
  result.push({language:p.language,category_id:p.category_id,title,body});
 }
 if(result.length<3)throw Error("insufficient_unique_ai_messages");
 return result;
}
Deno.serve(async(req:Request)=>{
 if(req.method!=="POST")return reply({error:"method"},405);
 if(!url||!service||!gemini)return reply({error:"configuration"},503);
 const token=req.headers.get("x-shubhlink-job-token")||"";
 if(token.length!==64)return reply({error:"unauthorized"},401);
 try{if(await rpc("verify_shubhlink_daily_token",{p_token:token})!==true)return reply({error:"unauthorized"},401)}
 catch{return reply({error:"authorization_unavailable"},503)}
 const date=today();
 try{if(await rpc("shubhlink_daily_claim",{p_day:date})!==true)return reply({status:"already_published_or_running",date})}
 catch{return reply({error:"claim_failed"},503)}
 try{
  const messages=await generate(plan(date),await recentMessages());
  const total=await rpc("shubhlink_daily_publish",{p_day:date,p_rows:messages});
  console.log("ShubhLink AI daily messages published",date,total);
  return reply({status:"published",date,count:total});
 }catch(err){
  const code=err instanceof Error?err.message.slice(0,70):"unknown";
  console.warn("ShubhLink daily generator failed",date,code);
  await rpc("shubhlink_daily_fail",{p_day:date,p_error:code}).catch(()=>undefined);
  return reply({error:"generation_failed",code},503);
 }
});
