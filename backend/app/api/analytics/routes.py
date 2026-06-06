from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.scan import Scan

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/overview")
def overview(db: Session = Depends(get_db)):
    total = db.query(func.count(Scan.id)).scalar() or 0
    healthy = db.query(func.count(Scan.id)).filter(Scan.disease_name.ilike("%healthy%")).scalar() or 0
    diseased = max(total - healthy, 0)
    confidence = db.query(func.avg(Scan.confidence_score)).scalar() or 0
    return {
        "totalScans": total,
        "healthyPlants": healthy,
        "diseasedPlants": diseased,
        "averageConfidence": round(float(confidence), 2),
        "users": 0,
    }


@router.get("/charts")
def charts():
    return {"diseaseDistribution": [], "monthlyPredictions": [], "cropDistribution": []}


@router.get("/export")
def export():
    return {"formats": ["pdf", "csv", "excel"]}
