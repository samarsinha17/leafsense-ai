import json
from urllib import request
from app.core.config import get_settings
from app.schemas.disease import Recommendation


class GeminiRecommendationService:
    def __init__(self) -> None:
        self.settings = get_settings()

    def build_recommendation(self, crop: str, disease: str, severity: str) -> Recommendation:
        if not self.settings.gemini_api_key:
            return self._fallback(crop, disease, severity)
        try:
            prompt = (
                "Return strict JSON for a plant disease recommendation with keys "
                "explanation, symptoms, causes, immediateActions, organicTreatment, "
                "chemicalTreatment, preventiveMeasures, wateringGuidance, fertilizerAdvice, farmerSummary. "
                f"Crop: {crop}. Disease: {disease}. Severity: {severity}."
            )
            data = json.loads(self._generate_text(prompt))
            return Recommendation.model_validate(data)
        except Exception:
            return self._fallback(crop, disease, severity)

    def chat(self, message: str) -> str:
        trimmed = message.strip()
        if not trimmed:
            return "Please ask a plant-care or disease-management question and I will help with practical next steps."
        if not self.settings.gemini_api_key:
            return self._fallback_chat(trimmed)
        try:
            prompt = (
                "You are LeafSense AI's agricultural assistant. Answer clearly and practically for farmers, "
                "students, and project evaluators. Answer the specific question first and use analysis context only "
                "where relevant. Never merely repeat the report summary. Continue naturally from recent chat memory, "
                "greet naturally, and use numbered actions for treatment questions. Only recommend treatments supplied "
                "in the analysis context. Keep the answer between 50 and 180 words. "
                f"Question: {trimmed}"
            )
            return self._generate_text(prompt).strip()
        except Exception:
            return self._fallback_chat(trimmed)

    def _generate_text(self, prompt: str) -> str:
        url = (
            "https://generativelanguage.googleapis.com/v1beta/models/"
            f"gemini-1.5-flash:generateContent?key={self.settings.gemini_api_key}"
        )
        payload = json.dumps({"contents": [{"parts": [{"text": prompt}]}]}).encode("utf-8")
        req = request.Request(url, data=payload, headers={"Content-Type": "application/json"}, method="POST")
        with request.urlopen(req, timeout=30) as response:
            data = json.loads(response.read().decode("utf-8"))
        return data["candidates"][0]["content"]["parts"][0]["text"]

    def _fallback(self, crop: str, disease: str, severity: str) -> Recommendation:
        return Recommendation(
            explanation=f"{crop} shows signs consistent with {disease}. Severity is estimated as {severity}.",
            symptoms=["Leaf discoloration", "Visible lesions", "Reduced plant vigor"],
            causes=["Pathogen pressure", "Humidity stress", "Possible nutrient imbalance"],
            immediateActions=["Isolate affected plants", "Remove highly infected leaves", "Improve airflow"],
            organicTreatment=["Use neem or copper-based organic treatment where appropriate", "Apply compost tea under expert guidance"],
            chemicalTreatment=["Use locally approved fungicide or bactericide according to label directions"],
            preventiveMeasures=["Rotate crops", "Sanitize tools", "Avoid overhead watering"],
            wateringGuidance="Water early at soil level and prevent prolonged leaf wetness.",
            fertilizerAdvice="Use balanced nutrition and avoid excessive nitrogen.",
            farmerSummary="Act early, reduce spread, and monitor nearby plants for new symptoms.",
        )

    def _fallback_chat(self, message: str) -> str:
        lower = message.lower()
        if "use this leafsense diagnostic report as context" in lower:
            return self._fallback_report_chat(message)
        if lower in {"hi", "hello", "hey", "hii", "namaste"}:
            return "Hi, I am LeafSense AI Assistant. You can ask me about crop disease symptoms, watering, fertilizer, treatment planning, or how to understand your diagnostic report."
        if "kya kar" in lower or "kya kar rhe" in lower or "what are you doing" in lower:
            return "Main LeafSense AI Assistant hoon. Main plant disease, crop care, watering, fertilizer, treatment aur report explanation me help kar raha hoon. Aap apna plant ya disease question pooch sakte ho."
        if "report" in lower or "pdf" in lower or "confidence" in lower:
            return "A LeafSense report should be read in four parts: crop and disease name, confidence score, severity/risk level, and recommended actions. High confidence still needs field verification using visible symptoms and plant condition."
        if "water" in lower:
            return "Water at soil level early in the morning, keep leaves dry, and let the top soil layer partially dry before the next irrigation. Wet foliage and poor airflow increase fungal disease risk."
        if "fertil" in lower or "nutrient" in lower:
            return "Use balanced nutrition, avoid excess nitrogen, and add potassium and calcium support where crop guidance allows. Stressed plants are more vulnerable to leaf spot, blight, and mildew."
        if "tomato" in lower or "tamatar" in lower:
            return "Tomatoes need steady sunlight, even watering, and balanced nutrition. For leaf issues, watch for early blight rings, late blight water-soaked patches, yellow curl virus, and bacterial spots. Upload a clear leaf image when symptoms are visible."
        if "powdery mildew" in lower:
            return "Powdery mildew is a fungal disease that looks like white powder on leaf surfaces. Improve airflow, avoid overhead watering, remove heavily affected leaves, and use sulfur, potassium bicarbonate, or a locally approved fungicide when needed."
        if "leaf blight" in lower or "blight" in lower:
            return "Leaf blight usually causes brown or dark lesions that expand across leaves. It often spreads faster in humid weather. Remove infected debris, improve spacing, water at soil level, and use crop-specific fungicide guidance if spread continues."
        if "spot" in lower or "rust" in lower or "mildew" in lower:
            return "This sounds like a leaf disease question. Compare symptom pattern, crop type, humidity, and spread speed. Remove infected debris, improve airflow, avoid overhead watering, and use the diagnosis result for crop-specific treatment."
        if "how are you" in lower or "kaise ho" in lower:
            return "I am working well and ready to help with LeafSense AI. Ask me about plant disease symptoms, diagnosis reports, treatment steps, fertilizer, watering, or crop care."
        if "what can you help" in lower or "help with" in lower or "can you do" in lower:
            return "I can help with plant disease symptoms, leaf image report explanation, crop care, fertilizer planning, watering guidance, treatment options, prevention steps, and follow-up monitoring."
        return (
            "I can help with this in a crop-care context. Share the crop name, visible leaf symptoms, weather condition, and whether the plant is in a pot, field, or garden, and I will give more specific guidance."
        )

    def _fallback_report_chat(self, message: str) -> str:
        fields = {}
        for line in message.splitlines():
            if ":" not in line:
                continue
            key, value = line.split(":", 1)
            fields[key.strip().lower()] = value.strip()
        question = fields.get("user question", "").lower()
        crop = fields.get("crop", "the crop")
        disease = fields.get("disease", "the detected disease")
        confidence = fields.get("confidence", "the reported confidence")
        severity = fields.get("severity", "the reported severity")
        summary = fields.get("summary", "")
        symptoms = fields.get("symptoms", "")
        immediate = fields.get("immediate actions", "")
        organic = fields.get("organic treatment", "")
        chemical = fields.get("chemical treatment", "")
        prevention = fields.get("prevention", "")
        description = fields.get("disease description", "")
        causes = fields.get("causes", "")
        watering = fields.get("watering guidance", "")
        fertilizer = fields.get("fertilizer advice", "")

        greeting = question.strip(" .!?")
        if greeting in {"hi", "hello", "hey", "hii", "namaste", "hi, help me", "hello, help me"} or question.startswith("help me"):
            return f"Hi. I can help you understand the {crop} result and decide what to do next. Ask me about treatment, spread risk, recovery, symptoms, prevention, or why the model identified {disease}."
        if any(phrase in question for phrase in ["after that", "then what", "what next", "uske baad"]):
            return f"After the immediate treatment, follow this monitoring plan:\n1. Check nearby {crop} plants and both sides of leaves within 2-3 days.\n2. Remove any newly affected material and keep tools sanitized.\n3. Reassess spread and plant vigor after 7 days.\n4. Re-scan the plant after 10-14 days and compare the result. Continue prevention measures: {prevention or 'keep foliage dry and maintain good airflow'}."
        if "spread" in question or "contagious" in question:
            return f"{disease} may spread through infected plant material, moisture, tools, or nearby hosts depending on field conditions. Isolate visibly affected parts, sanitize tools between plants, avoid moving wet foliage, and inspect neighboring {crop} plants every few days. Remove newly infected debris promptly and follow these prevention steps: {prevention or 'improve airflow and avoid overhead watering'}."
        if any(word in question for word in ["danger", "serious", "severity", "critical"]):
            return f"The result is marked {severity}, so it deserves prompt attention, especially if symptoms are expanding or appearing on nearby leaves. The plant may still recover when affected material is removed early and spread is controlled. Start with: {immediate or 'isolate the plant, remove heavily affected leaves, and improve airflow'}. Recheck it within 2-3 days."
        if any(word in question for word in ["recover", "survive", "save"]):
            return f"Recovery is possible if enough healthy foliage and stems remain. Remove only heavily affected leaves, reduce conditions that favor spread, and avoid stressing the plant with excess water or fertilizer. Apply the recommended care, then monitor new growth for 7-14 days. Fresh, symptom-free growth is the clearest sign that the {crop} plant is recovering."
        if any(phrase in question for phrase in ["why detected", "why was", "how know", "why did", "confidence", "heatmap", "model"]):
            return f"The model identified {disease} by comparing visible leaf patterns with learned disease features. For this result, verify the prediction against these field signs: {symptoms or 'lesions, discoloration, and the pattern of affected tissue'}. The reported confidence is {confidence}, but confidence measures model certainty, not laboratory confirmation. Inspect both leaf surfaces and nearby plants before treatment."
        if any(word in question for word in ["what is", "explain", "cause"]):
            return f"{description or f'{disease} is a disease affecting {crop}.'} Likely contributing factors include: {causes or 'pathogen pressure and favorable environmental conditions'}. Focus on whether symptoms are spreading, whether leaves stay wet for long periods, and whether nearby plants show similar signs."
        if "symptom" in question or "sign" in question:
            return f"Check the plant for these signs: {symptoms or 'leaf spots, lesions, discoloration, and spread pattern'}. Inspect both leaf surfaces, stems, and nearby plants. Photograph any new symptoms and compare them after 2-3 days; rapid expansion or new affected leaves means the problem needs faster intervention."
        if "organic" in question:
            return f"Use this organic care plan:\n1. {organic or 'Remove affected leaves and improve airflow.'}\n2. Keep foliage dry and sanitize tools after use.\n3. Monitor new growth and nearby plants every 2-3 days.\nAvoid mixing treatments unless their labels explicitly allow it."
        if "chemical" in question or "fungicide" in question or "spray" in question:
            return f"Chemical option: {chemical or 'use a locally approved crop-specific treatment according to label directions'}. Confirm the product is approved for {crop} and {disease}, follow label dose and protective-equipment instructions, and respect harvest intervals. Do not combine products unless the labels allow it. Reinspect after the label's recommended interval."
        if "prevent" in question or "avoid" in question:
            return f"To reduce repeat infection:\n1. {prevention or 'Sanitize tools, avoid overhead watering, rotate crops, and improve spacing.'}\n2. Remove infected debris instead of composting it near healthy plants.\n3. Inspect new growth weekly and re-scan if symptoms return."
        if "water" in question:
            return watering or "Water at soil level early in the day and avoid prolonged leaf wetness. Let the upper soil layer partially dry before watering again."
        if "fertil" in question or "nutrient" in question:
            return fertilizer or "Use balanced nutrition and avoid excess nitrogen while the plant is recovering."
        if "ignore" in question or "untreated" in question:
            return f"If left untreated, {disease} may damage more foliage, weaken the {crop} plant, and increase spread risk. Begin sanitation and isolation now, then monitor nearby plants. Escalate to an approved treatment if symptoms continue expanding."
        if "what should" in question or "next" in question or "action" in question or "do" in question:
            actions = [item.strip() for item in immediate.split(";") if item.strip()]
            numbered = "\n".join(f"{index}. {item}" for index, item in enumerate(actions or ["Isolate the affected plant", "Remove heavily infected leaves", "Improve airflow"], 1))
            return f"Start with these actions today:\n{numbered}\nThen inspect nearby plants and check progress again within 2-3 days. Avoid removing too much healthy foliage at once."
        return f"I can help with this {crop} analysis. Ask a specific question about treatment, symptoms, spread, recovery, prevention, watering, fertilizer, or why the model identified {disease}, and I will guide you using the current result."
