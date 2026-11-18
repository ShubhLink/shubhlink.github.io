#!/usr/bin/env python3
"""Generate one premium ShubhLink poster background using OpenAI image API.
Manual GitHub Actions only. One request may incur API charges.
"""
import base64, json, os, pathlib, urllib.request, urllib.error, uuid
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/"artwork"/"generated"
PROMPTS={
 "morning":"Photorealistic luxury sunrise over an Indian lakeside, warm golden rays, marigold flowers and soft mist, refined editorial photography, elegant calm composition, rich depth, generous clean space in the center for Gujarati greeting typography, vertical greeting poster background, no text, no logo, no watermark",
 "birthday":"Premium photorealistic birthday still life, elegant cake with fresh flowers, soft golden bokeh and tasteful pastel palette, sophisticated Indian celebration, spacious uncluttered center for typography, vertical greeting card background, no text, no logo, no watermark",
 "night":"Cinematic moonlit lake, delicate white flowers, midnight indigo and violet, tranquil starry sky, luxury photographic greeting background, central negative space for Gujarati message, vertical composition, no text, no logo, no watermark",
 "festival":"Premium Indian festive photography, ornate brass diyas, marigold garlands, warm glowing fairy lights, beautiful rangoli details, elegant rich lighting, clear central negative space for message, vertical poster background, no text, no logo, no watermark",
 "thought":"Photorealistic peaceful garden at dawn, lotus flowers, elegant natural light, tasteful botanical composition, clean center for inspirational Gujarati typography, vertical greeting poster background, no text, no logo, no watermark"
}
def main():
 key=os.environ.get("OPENAI_API_KEY2","").strip()
 if not key: raise SystemExit("Missing GitHub Actions secret OPENAI_API_KEY2")
 category=os.environ.get("ART_CATEGORY","morning")
 if category not in PROMPTS: raise SystemExit("Unsupported category")
 body=json.dumps({"model":"gpt-image-1.5","prompt":PROMPTS[category],"size":"1024x1536","quality":"low","n":1}).encode("utf-8")
 req=urllib.request.Request("https://api.openai.com/v1/images/generations",data=body,headers={"Authorization":"Bearer "+key,"Content-Type":"application/json"},method="POST")
 print("Requesting ONE OpenAI premium image (API billing may apply)",flush=True)
 try:
  with urllib.request.urlopen(req,timeout=240) as resp: data=json.load(resp)
 except urllib.error.HTTPError as e:
  try: detail=json.loads(e.read(4000).decode("utf-8","replace")).get("error",{})
  except Exception: detail={}
  raise SystemExit("OpenAI HTTP %s: %s"%(e.code,str(detail.get("message","Request rejected"))[:700])) from e
 except Exception as e: raise SystemExit("Request interrupted. Check OpenAI usage before retrying.") from e
 items=data.get("data",[])
 if not items or not items[0].get("b64_json"): raise SystemExit("No base64 image returned")
 image=base64.b64decode(items[0]["b64_json"],validate=True)
 if not image.startswith(bytes.fromhex("89504e470d0a1a0a")): raise SystemExit("Unexpected image format")
 if len(image)>20_000_000: raise SystemExit("Image exceeds 20MB")
 OUT.mkdir(parents=True,exist_ok=True)
 filename=category+"-"+uuid.uuid4().hex[:12]+".png"
 (OUT/filename).write_bytes(image)
 manifest=ROOT/"artwork"/"manifest.json"
 try: records=json.loads(manifest.read_text()) if manifest.exists() else []
 except (ValueError,OSError): records=[]
 records=[{"category":category,"url":"artwork/generated/"+filename,"source":"openai"}]+[x for x in records if isinstance(x,dict) and x.get("url")!="artwork/generated/"+filename]
 manifest.write_text(json.dumps(records[:100],ensure_ascii=False,indent=2)+"\n")
 print("Saved artwork:",filename,flush=True)
if __name__=="__main__": main()
