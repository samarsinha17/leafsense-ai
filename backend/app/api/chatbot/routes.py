import logging
import httpx
from fastapi import APIRouter
from pydantic import BaseModel
from sqlalchemy.orm import Session
from fastapi import Depends
from app.api.dependencies import get_current_user, get_optional_user
from app.core.config import get_settings
from app.database.session import get_db
from app.models.analytics import ChatHistory
from app.models.user import User
from app.services.gemini_service import GeminiRecommendationService

router = APIRouter(prefix="/chatbot", tags=["chatbot"])
logger = logging.getLogger("leafsense.assistant")


class ChatRequest(BaseModel):
    message: str
    context: dict | None = None


@router.post("/message")
def message(payload: ChatRequest, db: Session = Depends(get_db), user: User | None = Depends(get_optional_user)):
    settings = get_settings()
    logger.info("assistant.incoming_message message=%r", payload.message)
    recent_history = _recent_chat_history(db, user)
    prompt_message = _message_with_context(payload.message, payload.context, recent_history)
    if payload.context:
        logger.info("assistant.context_loaded report_id=%r crop=%r disease=%r", payload.context.get("reportId"), payload.context.get("cropName"), payload.context.get("diseaseName"))
    if settings.openai_api_key:
        logger.info("assistant.provider provider=openai key_loaded=true")
        response, provider = _openai_chat(prompt_message, settings.openai_api_key)
    elif settings.gemini_api_key:
        logger.info("assistant.provider provider=gemini key_loaded=true")
        response = GeminiRecommendationService().chat(prompt_message)
        provider = "gemini"
    else:
        logger.info("assistant.provider provider=fallback key_loaded=false")
        response = GeminiRecommendationService().chat(prompt_message)
        provider = "local_fallback"
    logger.info("assistant.outgoing_response response=%r", response[:500])
    db.add(ChatHistory(user_id=user.id if user else None, message=payload.message, response=response))
    db.commit()
    return {"message": payload.message, "response": response, "provider": provider}


def _recent_chat_history(db: Session, user: User | None) -> list[ChatHistory]:
    if not user:
        return []
    return (
        db.query(ChatHistory)
        .filter(ChatHistory.user_id == user.id)
        .order_by(ChatHistory.created_at.desc())
        .limit(6)
        .all()
    )


def _message_with_context(message: str, context: dict | None, recent_history: list[ChatHistory] | None = None) -> str:
    memory_lines: list[str] = []
    for row in reversed(recent_history or []):
        memory_lines.append(f"User: {row.message}")
        memory_lines.append(f"Assistant: {row.response}")
    project_knowledge = (
        "LeafSense AI detects plant diseases from leaf images, reports crop, disease, confidence, "
        "severity, model explanation evidence, symptoms, causes, treatments, prevention steps, "
        "organic remedies, chemical treatment guidance, downloadable reports, analytics, and admin review data."
    )
    if not context:
        if not memory_lines:
            return f"Project Knowledge:\n{project_knowledge}\n\nUser Question:\n{message}"
        return "\n".join(["Project Knowledge:", project_knowledge, "", "Recent Chat Memory:", *memory_lines[-8:], "", f"User Question: {message}"])
    recommendation = context.get("recommendation") or {}
    predictions = context.get("topPredictions") or []
    prediction_lines = ", ".join(
        f"{item.get('label')} {item.get('value')}%" for item in predictions[:5] if isinstance(item, dict)
    )
    context_lines = [
        "Use this LeafSense diagnostic report as context for the user's question.",
        "",
        "Project Knowledge:",
        project_knowledge,
        "",
        "Current Analysis:",
        f"Report ID: {context.get('reportId')}",
        f"Crop: {context.get('cropName')}",
        f"Disease: {context.get('diseaseName')}",
        f"Scientific name: {context.get('scientificName')}",
        f"Category: {context.get('diseaseCategory')}",
        f"Confidence: {context.get('confidenceScore')}%",
        f"Severity: {context.get('severity')}",
        f"Top predictions: {prediction_lines or 'Not provided'}",
        f"Disease description: {recommendation.get('explanation', '')}",
        f"Causes: {'; '.join(recommendation.get('causes', [])[:5])}",
        f"Summary: {recommendation.get('farmerSummary', '')}",
        f"Symptoms: {'; '.join(recommendation.get('symptoms', [])[:5])}",
        f"Immediate actions: {'; '.join(recommendation.get('immediateActions', [])[:5])}",
        f"Organic treatment: {'; '.join(recommendation.get('organicTreatment', [])[:5])}",
        f"Chemical treatment: {'; '.join(recommendation.get('chemicalTreatment', [])[:5])}",
        f"Prevention: {'; '.join(recommendation.get('preventiveMeasures', [])[:5])}",
        f"Watering guidance: {recommendation.get('wateringGuidance', '')}",
        f"Fertilizer advice: {recommendation.get('fertilizerAdvice', '')}",
        "",
        "Recent Chat Memory:",
        *(memory_lines[-8:] if memory_lines else ["No previous assistant discussion in this session."]),
        "",
        f"User question: {message}",
    ]
    return "\n".join(context_lines)


def _openai_chat(message: str, api_key: str) -> tuple[str, str]:
    system = (
        "You are LeafSense AI Plant Assistant, an expert agricultural AI helper. "
        "Answer in clear English or Hindi based on the user's language. Focus on plant disease diagnosis, "
        "symptoms, treatment planning, crop care, report explanation, and safe practical recommendations. "
        "Answer the user's specific question first and use the current analysis only where relevant. "
        "Never merely repeat the report summary, disease, confidence, or severity. Continue naturally from recent "
        "chat memory when the user asks a follow-up such as 'after that?'. For greetings, greet naturally and offer help. "
        "Use numbered actions for treatment questions and recommend only treatments supplied in the analysis context. "
        "Keep responses practical, conversational, and between 50 and 200 words. "
        "Do not claim certainty without an image-based diagnosis."
    )
    try:
        with httpx.Client(timeout=30) as client:
            logger.info("assistant.openai_request model=gpt-4o-mini message=%r", message)
            result = client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json={
                    "model": "gpt-4o-mini",
                    "messages": [
                        {"role": "system", "content": system},
                        {"role": "user", "content": message},
                    ],
                    "temperature": 0.35,
                },
            )
            result.raise_for_status()
            response = result.json()["choices"][0]["message"]["content"].strip()
            logger.info("assistant.openai_response response=%r", response[:500])
            return response, "openai"
    except Exception as exc:
        logger.exception("assistant.openai_exception error=%s", exc)
        gemini = GeminiRecommendationService()
        if gemini.settings.gemini_api_key:
            logger.info("assistant.provider provider=gemini_after_openai_error key_loaded=true")
            return gemini.chat(message), "gemini_after_openai_error"
        return gemini.chat(message), "local_fallback_after_openai_error"


@router.get("/history")
def history(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(ChatHistory).filter(ChatHistory.user_id == user.id).order_by(ChatHistory.created_at.desc()).limit(100).all()
    return [
        {
            "id": row.id,
            "message": row.message,
            "response": row.response,
            "created_at": row.created_at,
        }
        for row in rows
    ]
