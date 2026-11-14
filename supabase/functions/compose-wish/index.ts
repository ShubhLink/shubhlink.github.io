// ShubhLink optional cloud AI composer.
// Public website has no guest accounts. AI works only after owner sets GEMINI_API_KEY
// as a Supabase Function Secret. Requests limited server-side to 30 per IP per India day.
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
const topicLimit=180;
const tones=["warm","short","festive","formal","poetic","funny"];
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
  if(Number(req.headers.get("content-length")||0)>9000)return json({error:"too_large"},413);
  const key=Deno.env.get("GEMINI_API_KEY");
  if(!key)return json({error:"ai_not_configured"},503);
  const service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),root=Deno.env.get("SUPABASE_URL");
  if(!service||!root)return json({error:"backend_not_configured"},503);
  let payload:Record<string,unknown>;
  try{payload=await req.json()}catch{return json({error:"bad_json"},400)}
  const topic=clean(payload.topic,topicLimit);
  const followUp=clean(payload.instruction,240);
  const history=Array.isArray(payload.history)?payload.history.slice(-5).map((x:unknown)=>clean(x,350)).filter(Boolean):[];
  const avoid=Array.isArray(payload.avoid)?payload.avoid.slice(-9).map((x:unknown)=>clean(x,220)).filter(Boolean):[];
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
    // User-supplied history is short-lived and sent only for this individual request.
    const directions=[
      "You are the creative lead of a premium Gujarati/Indian message-writing studio, not a generic greeting template.",
      "Write THREE fresh, ready-to-share WhatsApp messages that feel unmistakably personal, beautiful, emotionally truthful, and surprising.",
      "Return STRICT JSON with exactly one field named messages containing an array of THREE different message strings. No markdown wrappers, no commentary.",
      "LANGUAGE: "+langLabel[language]+". Do not mix Hindi-script into Gujarati or English into Gujarati; use natural, correct grammar and culturally appropriate language.",
      "DO NOT use stale cliches like 'તમારા જીવનમાં ખુશીઓ, શાંતિ અને સમૃદ્ધિ' or 'આ ખાસ દિવસે દિલથી શુભેચ્છા', 'may all dreams come true', 'on this special day'.",
      "Make three DIFFERENT concepts: (1) touching and specific human warmth, (2) vivid short poetic imagery, (3) memorable crisp modern message with a surprising observation.",
      "Every output must start differently, convey concrete details relevant to the chosen occasion/person and end with a meaningful line, not a repeated boilerplate blessing.",
      "No formulaic two-line combinations, no copying examples, no changing only emoji, no recycled opener/closer, no big exaggerated claims. Avoid clichés and generic 'many happiness' fillers.",
      "Use a few emojis only if they genuinely elevate the writing (at most 2 per message), no hashtags or URLs.",
      "Each message 45–320 characters, suitable for actual WhatsApp sharing. Prefer 2-4 flowing sentences maximum.",
      "Tone/style: "+tone+". For short write 35-100 characters, poetic should sound literary but natural, funny should be witty and gentle, and formal should be dignified.",
      "Occasion and recipient/request: "+JSON.stringify(topic),
      followUp?"User's latest rewrite direction (follow it while preserving the topic): "+JSON.stringify(followUp):"",
      history.length?"Recent chat context (use only to understand the conversation; do not quote verbatim): "+JSON.stringify(history):"",
      avoid.length?"Earlier outputs that MUST NOT be repeated or paraphrased; find new metaphors, structure and angles: "+JSON.stringify(avoid):"",
      "Respect cultural/religious context, do not fabricate dates or stories. Do not include contact details. All content must be original."
    ].filter(Boolean).join("\n");
    const instructions=directions;
    const apiURL="https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent";
    const apiBody=JSON.stringify({contents:[{parts:[{text:instructions}]}],generationConfig:{temperature:1.1,topP:0.97,maxOutputTokens:1500,responseMimeType:"application/json"}});
    const callGemini=()=>fetch(apiURL,{
      method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":key},
      body:apiBody,signal:AbortSignal.timeout(16000)
    });
    let response=await callGemini();
    // Retry once for provider-wide 503 only; never retry quota, auth or malformed requests.
    if(response.status===503){
      await response.text().catch(()=>undefined);
      await new Promise(resolve=>setTimeout(resolve,750));
      response=await callGemini();
    }
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
