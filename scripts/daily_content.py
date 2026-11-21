#!/usr/bin/env python3
"""Daily ShubhLink publisher. Requires Gemini API key for fresh AI-written messages.
No secret is committed to the repository. Safely skips when key is missing.
"""
import datetime, json, os, pathlib, urllib.request, urllib.error, time, socket, itertools
ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / "daily-content.json"
CATS = ["birthday","morning","suvichar","newthought","night","rakhi","friendship","anniversary","congrats"]
LANGS = {"gu":"Gujarati","hi":"Hindi","en":"English"}

# Free fallback: real, category-specific daily greetings without a paid API.
FALLBACK = {
 "gu": {
  "birthday":["જન્મદિવસની હાર્દિક શુભકામનાઓ!","આજનો દિવસ તમારા જીવનમાં આનંદની નવી શરૂઆત બને.","પરિવારનો પ્રેમ અને પ્રિયજનોનો સાથ હંમેશાં મળતો રહે.","તમારા દરેક સારા સપનાને નવી ઉડાન મળે.","આવતું વર્ષ સુખ, સ્વાસ્થ્ય અને સફળતાથી ભરેલું રહે."],
  "morning":["સુપ્રભાત! નવી સવાર સાથે નવી આશા લઈને આગળ વધો.","આજનો સૂર્યપ્રકાશ તમારા મનમાં નવી હિંમત જગાવે.","નાના સારા પ્રયાસો પણ મોટા પરિવર્તનની શરૂઆત બને છે.","પરિવાર સાથેનો દરેક ક્ષણ પ્રેમથી ઉજવો.","તમારો આખો દિવસ શાંતિ અને ખુશીઓથી ભરેલો રહે."],
  "suvichar":["સુંદર વિચાર જીવનની દિશા બદલી શકે છે.","સાચી સફળતા માત્ર મેળવવામાં નહીં, બીજાને મદદ કરવામાં પણ છે.","ધીરજ રાખનાર વ્યક્તિ મુશ્કેલ સમયમાં પણ રસ્તો શોધે છે.","સારા શબ્દો કોઈના દિવસને સુંદર બનાવી શકે છે.","દરેક દિવસ થોડું સારું બનવાનો એક નવો અવસર છે."],
  "newthought":["નવો વિચાર નવી શક્યતાઓના દરવાજા ખોલે છે.","ગઈકાલની ભૂલને આજનો પાઠ બનાવો.","નાનું પગલું પણ યોગ્ય દિશામાં હોય તો મૂલ્યવાન છે.","પોતાના પર વિશ્વાસ રાખીને સતત પ્રયત્ન કરતા રહો.","તમારી મહેનત એક દિવસ સુંદર પરિણામ લાવશે."],
  "night":["શુભ રાત્રિ! દિવસભરની ચિંતા થોડા સમય માટે બાજુએ મૂકો.","આજે મળેલી નાની ખુશીઓ માટે આભાર માનો.","તમારા મનને શાંતિ અને શરીરને આરામ મળે.","સુંદર સપનાઓ સાથે આજની રાત પસાર થાય.","આવતી સવાર તમારા માટે નવી આશા લઈને આવે."],
  "rakhi":["રક્ષાબંધનની હાર્દિક શુભકામનાઓ!","ભાઈ-બહેનનો પ્રેમ જીવનભર મજબૂત રહે.","બાળપણની યાદો અને હાસ્ય હંમેશાં તાજાં રહે.","એકબીજાની ખુશીમાં ખુશ થવાનો આ સુંદર સંબંધ છે.","તમારા પરિવાર પર પ્રેમ અને સુખની વર્ષા થતી રહે."],
  "friendship":["સાચી મિત્રતા જીવનની અમૂલ્ય ભેટ છે.","મુશ્કેલ સમયમાં સાથે ઊભો રહે તે જ સાચો મિત્ર.","સુંદર યાદો અને નિઃસ્વાર્થ સાથ સંબંધને ખાસ બનાવે છે.","મિત્રતામાં વિશ્વાસ અને આદર હંમેશાં જળવાઈ રહે.","આપણી મિત્રતાની ખુશી વર્ષો સુધી વધતી રહે."],
  "anniversary":["લગ્નવર્ષગાંઠની હાર્દિક શુભકામનાઓ!","તમારો પ્રેમ દર વર્ષે વધુ ઊંડો અને મજબૂત બને.","સાથે વિતાવેલી દરેક ક્ષણ નવી સુંદર યાદ બને.","જીવનના દરેક પડાવે એકબીજાનો વિશ્વાસ અને સાથ મળે.","તમારું ઘર હંમેશાં સુખ અને શાંતિથી ભરેલું રહે."],
  "congrats":["તમારી સિદ્ધિ બદલ હાર્દિક અભિનંદન!","તમારી મહેનત અને સમર્પણનું આ સુંદર પરિણામ છે.","આ સફળતા તમને નવી ઊંચાઈઓ સુધી પહોંચવાની પ્રેરણા આપે.","તમારા પરિવાર અને મિત્રો માટે આ ગર્વની ક્ષણ છે.","આગળના દરેક પગલે વધુ સુંદર તકો મળતી રહે."]},
 "hi": {
  "birthday":["जन्मदिन की हार्दिक शुभकामनाएँ!","आपका यह खास दिन नई खुशियाँ लेकर आए।","परिवार का प्यार और अपनों का साथ हमेशा बना रहे।","आपके सुंदर सपनों को नई उड़ान मिले।","आने वाला वर्ष सुख, स्वास्थ्य और सफलता से भरा रहे।"],
  "morning":["सुप्रभात! नई सुबह नई उम्मीदें लेकर आई है।","आज का उजाला आपके मन में नया उत्साह जगाए।","छोटी अच्छी कोशिश भी बड़े बदलाव की शुरुआत होती है।","अपनों के साथ बिताया हर पल अनमोल बने।","आपका पूरा दिन शांति और मुस्कान से भरा रहे।"],
  "suvichar":["एक अच्छा विचार जीवन की दिशा बदल सकता है।","सच्ची सफलता दूसरों के काम आने में भी है।","धैर्य रखने वाला मुश्किल समय में भी रास्ता खोज लेता है।","प्यार से बोले गए शब्द किसी का दिन सुंदर बना देते हैं।","हर दिन बेहतर इंसान बनने का नया अवसर है।"],
  "newthought":["नई सोच नई संभावनाओं का द्वार खोलती है।","बीते कल की गलती को आज की सीख बनाइए।","सही दिशा में छोटा कदम भी बहुत कीमती होता है।","खुद पर विश्वास रखकर आगे बढ़ते रहिए।","मेहनत का सुंदर परिणाम सही समय पर मिलता है।"],
  "night":["शुभ रात्रि! दिनभर की चिंताओं को थोड़ी देर के लिए छोड़ दीजिए।","आज मिली छोटी खुशियों को याद कीजिए।","मन को सुकून और शरीर को पूरा आराम मिले।","आपकी रात प्यारे सपनों से सजी रहे।","कल की सुबह आपके लिए नई उम्मीद लेकर आए।"],
  "rakhi":["रक्षाबंधन की हार्दिक शुभकामनाएँ!","भाई-बहन का स्नेह जीवनभर बना रहे।","बचपन की मीठी यादें हमेशा मुस्कान देती रहें।","एक-दूसरे का साथ इस रिश्ते को और खास बनाता है।","आपके परिवार में प्यार और खुशहाली बनी रहे।"],
  "friendship":["सच्ची दोस्ती जिंदगी का अनमोल तोहफा है।","मुश्किल वक्त में साथ निभाने वाला ही सच्चा दोस्त होता है।","मीठी यादें और निस्वार्थ अपनापन रिश्ते को खास बनाते हैं।","हमारे बीच विश्वास और सम्मान हमेशा बना रहे।","दोस्ती की ये खुशियाँ हर साल बढ़ती रहें।"],
  "anniversary":["शादी की सालगिरह की हार्दिक शुभकामनाएँ!","आप दोनों का प्यार हर साल और गहरा हो।","साथ बिताया हर पल खूबसूरत याद बन जाए।","जीवन के हर मोड़ पर एक-दूसरे का भरोसा और साथ मिले।","आपका घर सुख, शांति और खुशियों से भरा रहे।"],
  "congrats":["आपकी उपलब्धि पर हार्दिक बधाई!","आपकी मेहनत और लगन रंग लाई है।","यह सफलता नई ऊँचाइयों की प्रेरणा बने।","अपनों के लिए यह गर्व और खुशी का पल है।","आगे भी आपको बेहतरीन अवसर मिलते रहें।"]},
 "en": {
  "birthday":["Wishing you a wonderful birthday!","May this special day open a beautiful new chapter.","May the love of family and friends always surround you.","May your cherished dreams find room to grow.","Wishing you health, happiness and meaningful success in the year ahead."],
  "morning":["Good morning! A fresh day brings fresh possibilities.","May today's sunlight lift your spirits and renew your hope.","Even small acts of kindness can make a lasting difference.","Treasure the moments you share with those you love.","Wishing you a peaceful day filled with genuine smiles."],
  "suvichar":["A thoughtful idea can change the direction of a life.","True success also means helping others along the way.","Patience can reveal a path even in difficult moments.","Kind words may brighten someone's entire day.","Every day is another chance to become a little better."],
  "newthought":["A new perspective can open unexpected doors.","Let yesterday's mistakes become today's lessons.","A small step in the right direction still matters.","Keep believing in yourself as you move forward.","Your steady effort can create a beautiful tomorrow."],
  "night":["Good night! Give yourself permission to set today's worries aside.","Remember the small moments that made you smile.","May your mind find calm and your body find rest.","Wishing you gentle dreams and a peaceful night.","May tomorrow greet you with renewed hope."],
  "rakhi":["Warm wishes on Raksha Bandhan!","May the bond between siblings stay strong through every season.","May childhood memories always bring a smile.","Caring for each other makes this relationship truly special.","Wishing your family love, laughter and togetherness."],
  "friendship":["True friendship is one of life's most precious gifts.","A real friend stays beside you when days are difficult.","Shared memories and selfless care make this bond special.","May trust and respect always guide our friendship.","Here's to many more years of laughter and support."],
  "anniversary":["Happy anniversary to a wonderful couple!","May your love grow deeper with every passing year.","May every shared moment become a treasured memory.","Keep finding strength and comfort in each other.","Wishing your home lasting peace, joy and warmth."],
  "congrats":["Heartfelt congratulations on your achievement!","Your dedication and hard work have brought you here.","May this success inspire even greater possibilities.","This is a proud moment for everyone who cares about you.","Wishing you many more rewarding opportunities ahead."]}}

def publish_fallback():
    today=(datetime.datetime.now(datetime.timezone.utc)+datetime.timedelta(hours=5,minutes=30)).date().isoformat()
    history=json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else {"messages":[]}
    rows=history.get("messages",[])
    seen={str(m.get("body","")).strip().casefold() for m in rows}
    day=datetime.date.fromisoformat(today).toordinal()
    added=0
    for lang,by_cat in FALLBACK.items():
        for cat,lines in by_cat.items():
            if any(m.get("date")==today and m.get("category")==cat and m.get("language")==lang for m in rows):continue
            # Rotate 120 distinct arrangements per category and language without duplicating text.
            arrangements=list(itertools.permutations(lines))
            for shift in range(len(arrangements)):
                order=arrangements[(shift+day)%len(arrangements)]
                body="\n\n".join([order[0], " ".join(order[1:4]), order[4]])
                if body.casefold() in seen:continue
                rows.append({"date":today,"category":cat,"language":lang,"body":body})
                seen.add(body.casefold());added+=1
                break
    history["messages"]=rows[-30000:]
    OUT.write_text(json.dumps(history,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(f"Published {added} unique fallback messages for {today}",flush=True)

def main():
    key = os.getenv("GEMINI_API_KEY", "").strip() or os.getenv("OPENAI_API_KEY", "").strip()
    if not key:
        print("No Gemini key: using original built-in daily messages.",flush=True)
        publish_fallback()
        return
    today = (datetime.datetime.now(datetime.timezone.utc)+datetime.timedelta(hours=5,minutes=30)).date().isoformat()
    history = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else {"messages":[]}
    rows = history.get("messages", [])
    existing = {str(x.get("body","")).strip().casefold() for x in rows}
    if sum(x.get("date")==today for x in rows)>=270:
        print("Today's messages already published.")
        return
    failures=[]
    quota_exhausted=False
    for lang, language in LANGS.items():
        if quota_exhausted: break
        for cat in CATS:
            if quota_exhausted: break
            if sum(x.get("date")==today and x.get("language")==lang and x.get("category")==cat for x in rows)>=10:
                continue
            print(f"Generating {language}/{cat}", flush=True)
            prompt = (f"Write exactly 12 original, natural, high-quality {language} detailed, heartfelt, shareable greeting messages "
                      f"for the category {cat}. Each should be 4-7 sentences, warm, culturally appropriate, "
                      "not repetitive, no numbered lists, no generic repeated endings. "
                      "Return ONLY a JSON object with key 'messages' containing an array of 12 strings.")
            payload = json.dumps({"contents":[{"parts":[{"text":prompt}]}],"generationConfig":{"temperature":1.0,"responseMimeType":"application/json"}}).encode()
            endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
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
                        quota_exhausted=True
                        break
                except (TimeoutError, socket.timeout, urllib.error.URLError, ValueError, KeyError, IndexError) as exc:
                    print(f"Gemini attempt {attempt+1}/3 failed on {language}/{cat}: {exc}",flush=True)
                if attempt<2 and not quota_exhausted:time.sleep(3*(attempt+1))
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
    if quota_exhausted: print("Free-tier quota exhausted; preserving successfully generated messages.",flush=True)
    if sum(x.get("date")==today for x in rows)==0:
        print("AI unavailable or quota exhausted: using built-in messages.",flush=True)
        publish_fallback()
        return
    history["messages"]=rows[-30000:]
    OUT.write_text(json.dumps(history,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(f"Published {sum(x.get('date')==today for x in rows)} messages for {today}")
if __name__=="__main__":main()
