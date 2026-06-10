from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session
from app.api.dependencies import get_optional_user
from app.database.session import get_db
from app.models.scan import Scan
from app.models.user import User
from app.schemas.disease import PredictionResponse
from app.services.prediction_service import PredictionService
from app.services.storage_service import StorageService
from app.training.inference import ModelUnavailableError

router = APIRouter(prefix="/disease", tags=["disease"])


@router.post("/predict", response_model=PredictionResponse)
async def predict(
    file: UploadFile = File(...),
    cropHint: str | None = Form(default=None),
    db: Session = Depends(get_db),
    user: User | None = Depends(get_optional_user),
):
    image_url = await StorageService().save_upload(file)
    try:
        prediction = PredictionService().predict(image_url, crop_hint=cropHint)
    except ModelUnavailableError as exc:
        raise HTTPException(
            status_code=503,
            detail=f"LeafSense trained model is unavailable right now. {exc}",
        ) from exc
    db.add(
        Scan(
            user_id=user.id if user else None,
            image_url=image_url,
            crop_name=prediction.cropName,
            disease_name=prediction.diseaseName,
            confidence_score=prediction.confidenceScore,
            severity=prediction.severity,
        )
    )
    db.commit()
    return prediction


@router.get("/result/{scan_id}")
def get_result(scan_id: int):
    return {"scan_id": scan_id, "status": "available"}
