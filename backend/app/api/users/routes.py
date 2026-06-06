from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session
from app.api.dependencies import get_current_user
from app.core.config import get_settings
from app.database.session import get_db
from app.models.enums import UserRole
from app.models.scan import Scan
from app.models.user import User
from app.schemas.auth import UserResponse
from app.services.gemini_service import GeminiRecommendationService
from app.services.prediction_service import SCIENTIFIC_NAMES

router = APIRouter(prefix="/users", tags=["users"])


class ProfileUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=120)
    email: EmailStr | None = None
    profile_image: str | None = None


@router.get("/profile", response_model=UserResponse)
def profile(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.email.lower() in get_settings().admin_emails and user.role != UserRole.admin:
        user.role = UserRole.admin
        db.commit()
        db.refresh(user)
    return user


@router.patch("/update-profile", response_model=UserResponse)
def update_profile(payload: ProfileUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if payload.full_name is not None:
        user.full_name = payload.full_name
    if payload.email is not None:
        user.email = str(payload.email).lower()
    if payload.profile_image is not None:
        user.profile_image = payload.profile_image
    db.commit()
    db.refresh(user)
    return user


@router.get("/history")
def history(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    scans = db.query(Scan).filter(Scan.user_id == user.id).order_by(Scan.created_at.desc()).limit(100).all()
    return [
        {
            "id": scan.id,
            "imageUrl": scan.image_url,
            "cropName": scan.crop_name,
            "diseaseName": scan.disease_name,
            "confidenceScore": scan.confidence_score,
            "severity": scan.severity,
            "createdAt": scan.created_at,
        }
        for scan in scans
    ]


@router.get("/history/{scan_id}")
def history_detail(scan_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    scan = db.query(Scan).filter(Scan.id == scan_id, Scan.user_id == user.id).first()
    if not scan:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Diagnosis not found")
    severity = "Healthy" if scan.disease_name.lower() == "healthy" else scan.severity
    category = "Healthy leaf" if scan.disease_name.lower() == "healthy" else "Plant disease"
    recommendation = GeminiRecommendationService().build_recommendation(scan.crop_name, scan.disease_name, severity)
    return {
        "id": str(scan.id),
        "imageUrl": scan.image_url,
        "cropName": scan.crop_name,
        "diseaseName": scan.disease_name,
        "scientificName": SCIENTIFIC_NAMES.get(scan.crop_name, "Plant pathology sample"),
        "diseaseCategory": category,
        "confidenceScore": scan.confidence_score,
        "infectedArea": 0 if severity == "Healthy" else None,
        "severity": severity,
        "timestamp": scan.created_at,
        "heatmapUrl": scan.image_url,
        "highlightedUrl": scan.image_url,
        "topPredictions": [{"label": f"{scan.crop_name} {scan.disease_name}", "value": scan.confidence_score}],
        "recommendation": recommendation.model_dump(),
    }
