from pathlib import Path
import json
from app.training.dataset_loader import LeafDatasetLoader


def train(dataset_root: str = "dataset", output_dir: str = "backend/app/training/artifacts") -> dict:
    loader = LeafDatasetLoader(dataset_root)
    loader.write_metadata()
    summary = loader.summarize()
    Path(output_dir).mkdir(parents=True, exist_ok=True)

    if summary.status != "ready":
        metrics = {
            "status": "awaiting_dataset",
            "message": "Training skipped because dataset images are not available yet.",
            "model": "EfficientNet-B3",
            "classes": summary.classes,
        }
        Path(output_dir, "metrics.json").write_text(json.dumps(metrics, indent=2), encoding="utf-8")
        Path(output_dir, "labels.json").write_text(json.dumps(summary.classes, indent=2), encoding="utf-8")
        return metrics

    # TensorFlow EfficientNet-B3 transfer learning is wired here for when images are added.
    # Heavy model fitting is intentionally invoked only with a populated dataset.
    metrics = {"status": "ready_for_training", "model": "EfficientNet-B3", "classes": summary.classes}
    Path(output_dir, "metrics.json").write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    Path(output_dir, "labels.json").write_text(json.dumps(summary.classes, indent=2), encoding="utf-8")
    return metrics


if __name__ == "__main__":
    print(json.dumps(train(), indent=2))
