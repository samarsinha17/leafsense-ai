import json
from pathlib import Path
from fastapi import APIRouter

router = APIRouter(prefix="/dataset", tags=["dataset"])


@router.get("/overview")
def dataset_overview():
    manifest_path = Path("dataset/metadata/dataset_manifest.json")
    if manifest_path.exists():
        return json.loads(manifest_path.read_text(encoding="utf-8"))
    return {"status": "awaiting_dataset", "classes": [], "splits": {"train": 0, "validation": 0, "test": 0}}
