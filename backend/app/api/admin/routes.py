import json
from pathlib import Path
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.dependencies import require_admin
from app.database.session import get_db
from app.models.analytics import AdminSetting, DatasetImage
from app.models.scan import Report, Scan
from app.models.user import User

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users")
def users(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    return db.query(User).order_by(User.created_at.desc()).limit(200).all()


@router.get("/reports")
def reports(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    rows = (
        db.query(Report, Scan, User)
        .join(Scan, Report.scan_id == Scan.id)
        .outerjoin(User, Scan.user_id == User.id)
        .order_by(Report.created_at.desc())
        .limit(200)
        .all()
    )
    return [
        {
            "report_id": report.id,
            "scan_id": scan.id,
            "user_email": user.email if user else "guest",
            "crop_name": scan.crop_name,
            "disease_name": scan.disease_name,
            "confidence_score": scan.confidence_score,
            "severity": scan.severity,
            "pdf_url": report.pdf_url,
            "csv_url": report.csv_url,
            "created_at": report.created_at,
        }
        for report, scan, user in rows
    ]


@router.get("/settings")
def settings(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    rows = db.query(AdminSetting).all()
    return {"system": "LeafSense AI", "monitoring": "ready", "settings": rows}


@router.get("/dataset")
def dataset(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    rows = db.query(DatasetImage).order_by(DatasetImage.created_at.desc()).limit(200).all()
    if rows:
        return rows
    manifest_path = Path("dataset/metadata/dataset_manifest.json")
    labels_path = Path("dataset/metadata/labels.json")
    manifest = json.loads(manifest_path.read_text(encoding="utf-8")) if manifest_path.exists() else {}
    labels = json.loads(labels_path.read_text(encoding="utf-8")) if labels_path.exists() else []
    classes = manifest.get("classes") or labels
    return [
        {
            "class_id": index + 1,
            "class_label": label,
            "dataset_status": manifest.get("status", "model_ready"),
            "train_images": manifest.get("splits", {}).get("train", 0),
            "validation_images": manifest.get("splits", {}).get("validation", 0),
            "test_images": manifest.get("splits", {}).get("test", 0),
            "model_scope": "PlantVillage-style 39-class crop disease model",
        }
        for index, label in enumerate(classes[:200])
    ]
