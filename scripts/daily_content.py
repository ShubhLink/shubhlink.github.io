#!/usr/bin/env python3
"""Daily ShubhLink publisher. Requires OPENAI_API_KEY for fresh AI-written messages.
No secret is committed to the repository. Safely skips when key is missing.
"""
import datetime, json, os, pathlib, urllib.request
ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / "daily-content.json"
CATS = ["birthday","morning","suvichar","newthought","night","festival","friendship","anniversary","congrats"]
LANGS = {"gu":"Gujarati","hi":"Hindi","en":"English"}
def main():
    key = os.getenv("OPENAI_API_KEY", "").strip()
    if not key:
        raise RuntimeError("OPENAI_API_KEY secret missing: add it to repository Actions secrets")
    today = (datetime.datetime.now(datetime.timezone.utc)+datetime.timedelta(hours=5,minutes=30)).date().isoformat()
    history = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else {"messages":[]}
    rows = history.get("messages", [])
    existing = {str(x.get("body","")).strip().casefold() for x in rows}
    if sum(x.get("date")==today for x in rows)>=270:
        print("Today's messages already published.")
        return
    for lang, language in LANGS.items():
        for cat in CATS:
            if sum(x.get("date")==today and x.get("language")==lang and x.get("category")==cat for x in rows)>=10:
                continue
            prompt = (f"Write exactly 12 original, natural, high-quality {language} short shareable messages "
                      f"for the category {cat}. Each must be 1-3 sentences, warm, culturally appropriate, "
                      "not repetitive, no numbered lists, no generic repeated endings. "
                      "Return ONLY a JSON object with key 'messages' containing an array of 12 strings.")
            payload = json.dumps({"model":"gpt-4o-mini","messages":[{"role":"user","content":prompt}],"response_format":{"type":"json_object"},"temperature":1.0}).encode()
            req = urllib.request.Request("https://api.openai.com/v1/chat/completions",payload,
                    {"Authorization":"Bearer "+key,"Content-Type":"application/json"},method="POST")
            with urllib.request.urlopen(req,timeout=90) as res:
                answer=json.load(res)
            generated=json.loads(answer["choices"][0]["message"]["content"])["messages"]
            count=0
            for body in generated:
                if not isinstance(body,str): continue
                body=body.strip()
                if len(body)<25 or body.casefold() in existing: continue
                rows.append({"date":today,"category":cat,"language":lang,"body":body})
                existing.add(body.casefold())
                count+=1
                if count==10:break
    if sum(x.get("date")==today for x in rows)==0:
        raise RuntimeError("No new messages generated. Check OpenAI billing, API quota and logs.")
    history["messages"]=rows[-30000:]
    OUT.write_text(json.dumps(history,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(f"Published {sum(x.get('date')==today for x in rows)} messages for {today}")
if __name__=="__main__":main()
