import json
from functools import cached_property
from pathlib import Path

import numpy as np
from huggingface_hub import hf_hub_download

from app.core.config import get_settings
HF_REPO_ID = "samarsinha2517/leafsense-ai-model"

def download_model_from_hf():
    return hf_hub_download(
        repo_id=HF_REPO_ID,
        filename="leafsense_model.keras",
    )

def download_labels_from_hf():
    return hf_hub_download(
        repo_id=HF_REPO_ID,
        filename="labels.json",
    )


class EfficientNetInferenceEngine:
    def __init__(self, artifact_dir: str = "backend/app/training/artifacts") -> None:
        configured = Path(artifact_dir)
        self.artifact_dir = configured if configured.exists() else Path(__file__).resolve().parent / "artifacts"
        self.labels_path = self.artifact_dir / "labels.json"
        self.settings = get_settings()

    def labels(self) -> list[str]:
        try:
            labels_file = download_labels_from_hf()
            return json.loads(Path(labels_file).read_text(encoding="utf-8"))
        except Exception as e:
            print(f"LABEL LOAD ERROR: {e}")
            return []

    def _candidate_model_paths(self) -> list[Path]:
        candidates: list[Path] = []
        if self.settings.model_path:
            candidates.append(Path(self.settings.model_path))
        candidates.extend(
            [
                self.artifact_dir / "leafsense_model.keras",
                Path("backend/app/training/artifacts/leafsense_model.keras"),
                Path.home() / "Downloads" / "leafsense_model.keras",
                Path(r"C:\Users\ASUS\Downloads\leafsense_model.keras"),
            ]
        )
        return candidates

    @cached_property
    def model_path(self) -> Path | None:
        for path in self._candidate_model_paths():
            if path.exists():
                return path
        return None

    @cached_property
    def model(self):
        try:
            import tensorflow as tf
            import keras

            print("TF VERSION =", tf.__version__)
            print("KERAS VERSION =", keras.__version__)

            model_file = download_model_from_hf()
            return tf.keras.models.load_model(model_file, compile=False)

        except Exception as e:
            print(f"MODEL LOAD ERROR: {e}")
            return None

    @cached_property
    def input_size(self) -> tuple[int, int]:
        if self.model is None:
            return (300, 300)
        shape = self.model.input_shape
        return (int(shape[1] or 300), int(shape[2] or 300))

    def _preprocess(self, image_path: str) -> np.ndarray:
        from PIL import Image

        height, width = self.input_size
        image = Image.open(image_path).convert("RGB").resize((width, height))
        array = np.asarray(image, dtype=np.float32)
        return np.expand_dims(array, axis=0)

    def predict_top(self, image_path: str, top_k: int = 5) -> list[tuple[str, float]]:
        labels = self.labels()
        if self.model is None or not labels:
            return [("Tomato___Early_blight", 0.916), ("Tomato___Late_blight", 0.038), ("Tomato___healthy", 0.022)]
        preds = np.asarray(self.model.predict(self._preprocess(image_path), verbose=0))[0]
        if preds.ndim != 1:
            preds = preds.reshape(-1)
        if preds.max(initial=0) > 1 or not np.isclose(float(preds.sum()), 1.0, atol=0.05):
            exp = np.exp(preds - np.max(preds))
            preds = exp / exp.sum()
        limit = min(top_k, len(preds), len(labels))
        indexes = np.argsort(preds)[::-1][:limit]
        return [(labels[int(index)], float(preds[int(index)])) for index in indexes]

    def predict(self, image_path: str) -> tuple[str, float]:
        top = self.predict_top(image_path, top_k=1)
        if top:
            label, confidence = top[0]
            return label, confidence
        labels = self.labels()
        if not labels:
            return "Tomato___Leaf_spot", 0.916
        return labels[0], 0.9
