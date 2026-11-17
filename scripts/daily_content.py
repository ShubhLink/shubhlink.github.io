#!/usr/bin/env python3
"""Daily ShubhLink publisher. Requires Gemini API key for fresh AI-written messages.
No secret is committed to the repository. Safely skips when key is missing.
"""
import datetime, json, os, pathlib, urllib.request, urllib.error, time, socket
ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / "daily-content.json"
CATS = ["birthday","morning","suvichar","newthought","night","festival","friendship","anniversary","congrats"]
LANGS = {"gu":"Gujarati","hi":"Hindi","en":"English"}
def main():
    key = os.getenv("GEMINI_API_KEY", "").strip() or os.getenv("OPENAI_API_KEY", "").strip()
    if not key:
        raise RuntimeError("Gemini API key missing: set GEMINI_API_KEY or existing OPENAI_API_KEY secret")
    today = (datetime.datetime.now(datetime.timezone.utc)+datetime.timedelta(hours=5,minutes=30)).date().isoformat()
    history = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else {"messages":[]}
    rows = history.get("messages", [])
    existing = {str(x.get("body","")).strip().casefold() for x in rows}
    if sum(x.get("date")==today for x in rows)>=270:
        print("Today's messages already published.")
        return
    failures=[]
    for lang, language in LANGS.items():
        for cat in CATS:
            if sum(x.get("date")==today and x.get("language")==lang and x.get("category")==cat for x in rows)>=10:
                continue
            print(f"Generating {language}/{cat}", flush=True)
            prompt = (f"Write exactly 12 original, natural, high-quality {language} short shareable messages "
                      f"for the category {cat}. Each must be 1-3 sentences, warm, culturally appropriate, "
                      "not repetitive, no numbered lists, no generic repeated endings. "
                      "Return ONLY a JSON object with key 'messages' containing an array of 12 strings.")
            payload = json.dumps({"contents":[{"parts":[{"text":prompt}]}],"generationConfig":{"temperature":1.0,"responseMimeType":"application/json"}}).encode()
            endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent"
            req = urllib.request.Request(endpoint,payload,
                    {"x-goog-api-key":key,"Content-Type":"application/json"},method="POST")
            generated=None
            for attempt in range(3):
                try:
                    with urllib.request.urlopen(req,timeout=35) as res:
                        answer=json.load(res)
                    generated=json.loads(answer["candidates"][0]["content"]["parts"][0]["text"])["messages"]
                    break
                except urllib.error.HTTPError as exc:
                    details=exc.read().decode("utf-8","replace")[:600]
                    print(f"Gemini HTTP {exc.code} on {language}/{cat}: {details}",flush=True)
                    if exc.code in (400,401,403,404):
                        raise RuntimeError(f"Gemini API configuration error HTTP {exc.code}: {details}") from exc
                    if exc.code==429:
                        failures.append(f"{language}/{cat}: quota exceeded")
                        break
                except (TimeoutError, socket.timeout, urllib.error.URLError, ValueError, KeyError, IndexError) as exc:
                    print(f"Gemini attempt {attempt+1}/3 failed on {language}/{cat}: {exc}",flush=True)
                if attempt<2:time.sleep(3*(attempt+1))
            if generated is None:
                failures.append(f"{language}/{cat}: no response")
                continue
            count=0
            for body in generated:
                if not isinstance(body,str): continue
                body=body.strip()
                if len(body)<25 or body.casefold() in existing: continue
                rows.append({"date":today,"category":cat,"language":lang,"body":body})
                existing.add(body.casefold())
                count+=1
                if count==10:break
    if failures: print("Skipped batches: "+", ".join(failures),flush=True)
    if sum(x.get("date")==today for x in rows)==0:
        raise RuntimeError("No new messages generated. Check Gemini API free-tier quota, key and logs.")
    history["messages"]=rows[-30000:]
    OUT.write_text(json.dumps(history,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(f"Published {sum(x.get('date')==today for x in rows)} messages for {today}")
if __name__=="__main__":main()
