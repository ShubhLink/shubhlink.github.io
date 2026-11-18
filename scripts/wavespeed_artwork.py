#!/usr/bin/env python3
"""Generate one ShubhLink background using WaveSpeed. Run only via manual GitHub Action.
Never put the API key in frontend code. One submission per invocation (may incur charges).
"""
import json, os, pathlib, re, time, urllib.request, urllib.error
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/"artwork"/"generated"
PROMPTS={
 "morning":"Photorealistic luxury sunrise over an Indian lakeside, warm golden rays, marigold flowers and soft mist, refined editorial photography, elegant calm composition, rich depth, generous clean space in the center for Gujarati greeting typography, vertical greeting poster background, no text, no logo, no watermark",
 "birthday":"Premium photorealistic birthday still life, elegant cake with fresh flowers, soft golden bokeh and tasteful pastel palette, sophisticated Indian celebration, spacious uncluttered center for typography, vertical greeting card background, no text, no logo, no watermark",
 "night":"Cinematic moonlit lake, delicate white flowers, midnight indigo and violet, tranquil starry sky, luxury photographic greeting background, central negative space for Gujarati message, vertical composition, no text, no logo, no watermark",
 "festival":"Premium Indian festive photography, ornate brass diyas, marigold garlands, warm glowing fairy lights, beautiful rangoli details, elegant rich lighting, clear central negative space for message, vertical poster background, no text, no logo, no watermark",
 "thought":"Photorealistic peaceful garden at dawn, lotus flowers, elegant natural light, tasteful botanical composition, clean center for inspirational Gujarati typography, vertical greeting poster background, no text, no logo, no watermark"
}
def request(url,key,data=None):
 headers={"Authorization":"Bearer "+key,"Content-Type":"application/json"}
 payload=json.dumps(data).encode() if data is not None else None
 req=urllib.request.Request(url,data=payload,headers=headers,method="POST" if data is not None else "GET")
 with urllib.request.urlopen(req,timeout=65) as res:return json.load(res)
def main():
 key=os.environ.get("WAVESPEED_API_KEY","").strip()
 if not key:raise SystemExit("WAVESPEED_API_KEY secret is missing")
 category=os.environ.get("ART_CATEGORY","morning").strip()
 if category not in PROMPTS:raise SystemExit("Unsupported category")
 model="wavespeed-ai/z-image/turbo"
 print("Submitting ONE image generation. This may consume paid API credits.",flush=True)
 try:
  submitted=request("https://api.wavespeed.ai/api/v3/"+model,key,{"prompt":PROMPTS[category],"size":"1024*1024"})
 except urllib.error.HTTPError as e:
  detail=e.read(4000).decode("utf-8","replace")
  detail=re.sub(r'(?i)(bearer\\s+|wsk_live_)[a-z0-9._-]+',r'\\1[REDACTED]',detail)
  raise SystemExit(f"Submission HTTP {e.code}: {detail[:1200]}") from e
 except Exception as e:raise SystemExit("Submission uncertain; check WaveSpeed History before rerunning to avoid double billing") from e
 task=submitted.get("data",submitted)
 if not task.get("id"):raise SystemExit("No task ID returned. Check WaveSpeed History before rerunning.")
 task_id=task["id"]
 print("Prediction ID:",task_id,flush=True)
 result_url="https://api.wavespeed.ai/api/v3/predictions/"+task_id+"/result"
 for attempt in range(45):
  time.sleep(5)
  try:result=request(result_url,key)
  except (urllib.error.URLError,TimeoutError):continue
  data=result.get("data",result)
  status=data.get("status")
  if status=="completed":
   urls=data.get("outputs",[])
   if not urls:raise SystemExit("Task completed without image URL")
   url=urls[0]
   if not isinstance(url,str) or not url.startswith("https://"):raise SystemExit("Unexpected output URL")
   with urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":"ShubhLink-Artwork-Publisher"}),timeout=60) as resp:
    content_type=resp.headers.get("Content-Type","")
    image=resp.read(12_000_001)
   if len(image)>12_000_000 or not (image.startswith(bytes.fromhex("ffd8ff")) or image.startswith(bytes.fromhex("89504e470d0a1a0a")) or image.startswith(b"RIFF") and image[8:12]==b"WEBP"):
    raise SystemExit("Downloaded file is not a supported image or exceeds 12MB")
   ext=".png" if image.startswith(bytes.fromhex("89504e47")) else ".webp" if image.startswith(b"RIFF") else ".jpg"
   OUT.mkdir(parents=True,exist_ok=True)
   filename=f"{category}-{task_id[:16]}{ext}"
   (OUT/filename).write_bytes(image)
   manifest=ROOT/"artwork"/"manifest.json"
   try: records=json.loads(manifest.read_text()) if manifest.exists() else []
   except (ValueError,OSError): records=[]
   records=[{"category":category,"url":"artwork/generated/"+filename,"source":"wavespeed"}]+[item for item in records if item.get("url")!="artwork/generated/"+filename]
   manifest.write_text(json.dumps(records[:100],ensure_ascii=False,indent=2)+"\\n")
   print("Saved",filename,flush=True)
   return
  if status in ("failed","cancelled","timeout","deleted"):raise SystemExit("Prediction "+str(status))
 raise SystemExit("Prediction still processing. ID: "+task_id+"; check WaveSpeed History.")
if __name__=="__main__":main()
