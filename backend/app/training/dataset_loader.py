from dataclasses import dataclass
from pathlib import Path
import json


IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


@dataclass(frozen=True)
class DatasetSummary:
    status: str
    classes: list[str]
    train: int
    validation: int
    test: int


class LeafDatasetLoader:
    def __init__(self, dataset_root: str | None = None) -> None:
        project_root = Path(__file__).resolve().parents[3]
        self.dataset_root = Path(dataset_root) if dataset_root else project_root / "dataset"
        self.processed = self.dataset_root / "processed"
        self.metadata = self.dataset_root / "metadata"

    def summarize(self) -> DatasetSummary:
        counts = {split: self._count_images(self.processed / split) for split in ("train", "validation", "test")}
        classes = sorted({path.parent.name for split in ("train", "validation", "test") for path in (self.processed / split).glob("*/*") if path.suffix.lower() in IMAGE_EXTENSIONS})
        status = "ready" if classes and counts["train"] > 0 else "awaiting_dataset"
        return DatasetSummary(status=status, classes=classes, train=counts["train"], validation=counts["validation"], test=counts["test"])

    def write_metadata(self) -> None:
        self.metadata.mkdir(parents=True, exist_ok=True)
        summary = self.summarize()
        (self.metadata / "labels.json").write_text(json.dumps(summary.classes, indent=2), encoding="utf-8")
        manifest = {
            "name": "LeafSense AI Dataset",
            "sources": ["PlantVillage", "custom"],
            "status": summary.status,
            "classes": summary.classes,
            "splits": {"train": summary.train, "validation": summary.validation, "test": summary.test},
            "supported_crops": ["Tomato", "Potato", "Corn", "Apple", "Grape", "Pepper"],
        }
        (self.metadata / "dataset_manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    def _count_images(self, path: Path) -> int:
        if not path.exists():
            return 0
        return sum(1 for item in path.rglob("*") if item.suffix.lower() in IMAGE_EXTENSIONS)
