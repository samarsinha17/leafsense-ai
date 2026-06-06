import csv as csv_lib
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.scan import Report, Scan
from app.schemas.disease import PredictionResponse
from app.services.gemini_service import GeminiRecommendationService
from app.services.report_service import ReportService
from app.core.config import get_settings

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/pdf/{scan_id}")
def pdf(scan_id: int, db: Session = Depends(get_db)):
    scan = db.get(Scan, scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    recommendation = GeminiRecommendationService().build_recommendation(scan.crop_name, scan.disease_name, scan.severity)
    prediction = PredictionResponse(
        id=str(scan.id),
        imageUrl=scan.image_url,
        cropName=scan.crop_name,
        diseaseName=scan.disease_name,
        scientificName="Available after model metadata sync",
        diseaseCategory="Computer vision diagnosis",
        confidenceScore=scan.confidence_score,
        severity=scan.severity,
        timestamp=scan.created_at,
        recommendation=recommendation,
    )
    pdf_url = ReportService().generate_pdf(prediction)
    report = Report(scan_id=scan.id, pdf_url=pdf_url)
    db.add(report)
    db.commit()
    return {"scan_id": scan_id, "pdfUrl": pdf_url}


@router.get("/csv/{scan_id}")
def csv(scan_id: int, db: Session = Depends(get_db)):
    scan = db.get(Scan, scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    report_dir = Path(get_settings().report_dir)
    report_dir.mkdir(parents=True, exist_ok=True)
    path = report_dir / f"{scan.id}.csv"
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv_lib.DictWriter(handle, fieldnames=["Date", "Crop", "Disease", "Confidence", "Severity", "User"])
        writer.writeheader()
        writer.writerow(
            {
                "Date": scan.created_at.isoformat(),
                "Crop": scan.crop_name,
                "Disease": scan.disease_name,
                "Confidence": scan.confidence_score,
                "Severity": scan.severity,
                "User": scan.user_id or "guest",
            }
        )
    csv_url = f"/reports/{path.name}"
    report = Report(scan_id=scan.id, csv_url=csv_url)
    db.add(report)
    db.commit()
    return {"scan_id": scan_id, "csvUrl": csv_url}
