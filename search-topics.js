(function(){'use strict';
const subjects=[
{id:'ganpati',aliases:['ganpati','ganesh','ganesha','ganeshji','ganesh chaturthi','ગણપતિ','ગણેશ','ગણેશજી','ગણેશ ચતુર્થી','વિનાયક','બાપ્પા','गणपति','गणेश','गणेशजी','बप्पा','विनायक'],category:'festival',
gu:['ગણપતિ બાપ્પા મોરયા! વિઘ્નહર્તા શ્રી ગણેશ તમારા જીવનમાંથી દરેક અવરોધ દૂર કરે અને સુખ, શાંતિ તથા સમૃદ્ધિના આશીર્વાદ વરસાવે.','શ્રી ગણેશના ચરણોમાં પ્રાર્થના છે કે તમારા દરેક શુભ કાર્યનો સુંદર આરંભ થાય અને પરિવાર હંમેશા આનંદિત રહે. ગણપતિ બાપ્પા મોરયા!','જય શ્રી ગણેશ! બુદ્ધિના દાતા ગણરાય તમારા વિચારોને નવી દિશા આપે અને દરેક સપનું સાકાર કરવાની શક્તિ આપે.','વિઘ્નહર્તા ગણપતિની કૃપાથી ઘરમાં ખુશીઓનો પ્રકાશ રહે, મનમાં શ્રદ્ધા રહે અને જીવનમાં સફળતાનો માર્ગ ખુલ્લો રહે.','ગણેશજીનું સ્મરણ કરીને આજનો દિવસ શરૂ કરો. બાપ્પા તમારા પરિવારને સ્વાસ્થ્ય, પ્રેમ અને સુખનું વરદાન આપે.','ગણપતિ બાપ્પા મોરયા! દરેક મુશ્કેલી નાની બને, દરેક આશા મોટી બને અને તમારા જીવનમાં મંગળ જ મંગળ થાય.'],
hi:['गणपति बप्पा मोरया! विघ्नहर्ता श्री गणेश आपके जीवन से बाधाएँ दूर करें और सुख, शांति व समृद्धि का आशीर्वाद दें।','श्री गणेश के चरणों में प्रार्थना है कि आपके हर शुभ कार्य की मंगल शुरुआत हो और परिवार में खुशियाँ बनी रहें।','जय श्री गणेश! बुद्धि के दाता गणराय आपके विचारों को नई दिशा दें और सपनों को पूरा करने की शक्ति दें।','गणपति बप्पा की कृपा से घर में खुशियों का उजाला, मन में श्रद्धा और जीवन में सफलता बनी रहे।'],
en:['Ganpati Bappa Morya! May Lord Ganesha remove obstacles from your path and bless your home with peace, wisdom and happiness.','May Lord Ganesha guide every new beginning, fill your heart with courage and bring prosperity to your family.','Wishing you blessings of wisdom, strength and joy through the grace of Lord Ganesha. Ganpati Bappa Morya!']},
{id:'krishna',aliases:['krishna','kanha','radha krishna','કૃષ્ણ','કાન્હા','કાના','રાધે','રાધા કૃષ્ણ','कृष्ण','कान्हा','राधे'],category:'festival',
gu:['જય શ્રી કૃષ્ણ! કાનુડાની કૃપાથી તમારા જીવનમાં પ્રેમ, શાંતિ અને આનંદનો અખૂટ પ્રવાહ વહેતો રહે.','રાધે રાધે! શ્રીકૃષ્ણની વાંસળીની મધુરતા જેવી મીઠાશ તમારા દરેક સંબંધમાં રહે.'],
hi:['जय श्री कृष्ण! कान्हा की कृपा से आपके जीवन में प्रेम, शांति और आनंद बना रहे।','राधे राधे! श्रीकृष्ण का आशीर्वाद आपके हर दिन को मंगलमय बनाए।'],
en:['Jai Shri Krishna! May the blessings of Lord Krishna fill your life with love, wisdom and peace.']},
{id:'shiv',aliases:['mahadev','shiv','shiva','bholenath','મહાદેવ','શિવ','ભોલેનાથ','महादेव','शिव','भोलेनाथ'],category:'festival',
gu:['હર હર મહાદેવ! ભોળાનાથની કૃપાથી તમારા જીવનમાં શાંતિ, હિંમત અને નવી ઊર્જા જાગે.','ૐ નમઃ શિવાય! મહાદેવ તમારા પરિવારને સુખ અને સુરક્ષાના આશીર્વાદ આપે.'],
hi:['हर हर महादेव! भोलेनाथ की कृपा से आपके जीवन में शांति, साहस और नई ऊर्जा बनी रहे।'],
en:['Har Har Mahadev! May Lord Shiva bless your journey with strength, calm and hope.']}
];
const normalize=s=>String(s||'').toLocaleLowerCase().trim();
window.ShubhSearchTopics={match(query){const q=normalize(query);return subjects.find(s=>s.aliases.some(a=>q.includes(normalize(a))))||null},messages(topic,language){return(topic?.[language]||[]).map(body=>({category:topic.category,language,title:body.split(/[.!?।॥]/)[0].slice(0,65),body,featured:false,event:false}))}};
})();
