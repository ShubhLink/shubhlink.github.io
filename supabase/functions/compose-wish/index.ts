// ShubhLink optional cloud AI composer.
// Public website has no guest accounts. AI works only after owner sets GEMINI_API_KEY
// as a Supabase Function Secret. Requests limited server-side to 6 per IP per India day.
const allowedOrigin="https://shubhlink.github.io";
const headers={
  "Access-Control-Allow-Origin":allowedOrigin,
  "Access-Control-Allow-Methods":"POST, OPTIONS",
  "Access-Control-Allow-Headers":"content-type, apikey",
  "Vary":"Origin",
  "Content-Type":"application/json; charset=utf-8",
  "Cache-Control":"no-store"
};
const json=(obj:unknown,status=200)=>new Response(JSON.stringify(obj),{status,headers});
const topicLimit=100;
const tones=["warm","short","festive","formal"];
const languages=["gu","hi","en"];
const langLabel:Record<string,string>={gu:"Gujarati (ગુજરાતી લિપિ)",hi:"Hindi (देवनागरी लिपि)",en:"English"};
function clean(x:unknown,max:number){
  return String(x??"").replace(/[\u0000-\u001f]/g," ").trim().slice(0,max);
}
async function digest(value:string){
  const bytes=new TextEncoder().encode(value);
  const h=await crypto.subtle.digest("SHA-256",bytes);
  return Array.from(new Uint8Array(h)).map(x=>x.toString(16).padStart(2,"0")).join("");
}
Deno.serve(async(req:Request)=>{
  const origin=req.headers.get("origin")||"";
  if(origin!==allowedOrigin)return json({error:"origin_not_allowed"},403);
  if(req.method==="OPTIONS")return new Response(null,{status:204,headers});
  if(req.method!=="POST")return json({error:"method_not_allowed"},405);
  if(Number(req.headers.get("content-length")||0)>3500)return json({error:"too_large"},413);
  const key=Deno.env.get("GEMINI_API_KEY");
  if(!key)return json({error:"ai_not_configured"},503);
  const service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),root=Deno.env.get("SUPABASE_URL");
  if(!service||!root)return json({error:"backend_not_configured"},503);
  let payload:Record<string,unknown>;
  try{payload=await req.json()}catch{return json({error:"bad_json"},400)}
  const topic=clean(payload.topic,topicLimit);
  const language=clean(payload.language,4),tone=clean(payload.tone,12);
  if(topic.length<2||!languages.includes(language)||!tones.includes(tone))return json({error:"invalid_input"},400);
  // Best-effort abuse protection. The IP is hashed and only the hash is retained.
  const ip=(req.headers.get("cf-connecting-ip")||req.headers.get("x-real-ip")||req.headers.get("x-forwarded-for")||"unknown").split(",")[0].trim().slice(0,80);
  const hash=await digest(key+"|"+ip+"|shubhlink");
  const date=new Date(Date.now()+19800000).toISOString().slice(0,10);
  try{
    const quota=await fetch(root.replace(/\/$/,"")+"/rest/v1/rpc/claim_shubhlink_ai_quota",{
      method:"POST",headers:{apikey:service,Authorization:"Bearer "+service,"Content-Type":"application/json"},
      body:JSON.stringify({p_fingerprint:hash,p_day:date})
    });
    if(!quota.ok)return json({error:"quota_check_unavailable"},503);
    const remaining=await quota.json();
    if(remaining!==true)return json({error:"rate_limit",message:"Please try again tomorrow."},429);
    const instructions="You write high quality ORIGINAL and varied short WhatsApp greetings for Indian users. Return strictly valid JSON with one field messages containing exactly three DIFFERENT strings. Each message must be 30 to 280 characters and be ready to share. Use only "+langLabel[language]+" script and appropriate cultural context. Style: "+tone+". Include the user's occasion naturally, without repeating the same first line. No markdown, URLs, hashtags, explanations, false facts, dangerous content or personal identifiers. If the occasion is religious, respect the user's context without inventing dates. User topic: "+topic;
    const response=await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent",{
      method:"POST",
      headers:{"Content-Type":"application/json","x-goog-api-key":key},
      body:JSON.stringify({contents:[{parts:[{text:instructions}]}],generationConfig:{temperature:0.92,maxOutputTokens:900,responseMimeType:"application/json"}}),
      signal:AbortSignal.timeout(16000)
    });
    if(!response.ok){
      // Report a provider error category without exposing API keys or prompt contents.
      const failure=await response.json().catch(()=>({}));
      const providerStatus=String(failure?.error?.status||"").slice(0,60);
      const providerCode=response.status;
      console.warn("Gemini upstream failure",providerCode,providerStatus);
      const kind=providerCode===429?"ai_quota_exceeded":
        providerCode===403?"ai_project_access_denied":
        providerCode===401?"ai_key_invalid":
        providerCode===404?"ai_model_unavailable":
        providerCode===400?"ai_provider_bad_request":
        providerCode===503?"ai_provider_busy":"ai_provider_error";
      return json({error:kind,provider_status:providerStatus},503);
    }
    const body=await response.json();
    const output=String(body?.candidates?.[0]?.content?.parts?.map((p:{text?:string})=>p.text||"").join("")||"");
    let parsed;
    try{parsed=JSON.parse(output)}catch{return json({error:"bad_ai_output"},502)}
    const messages=Array.isArray(parsed?.messages)?parsed.messages.filter((x:unknown)=>typeof x==="string").map((x:string)=>clean(x,600)).filter((x:string)=>x.length>15).slice(0,3):[];
    if(messages.length<1)return json({error:"empty_ai_output"},502);
    return json({messages,source:"gemini"});
  }catch(error){console.warn("Gemini function error category",error instanceof Error?error.name:"unknown");return json({error:"ai_temporarily_unavailable"},503)}
});
