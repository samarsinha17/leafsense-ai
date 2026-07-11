import json
import base64
import os
import subprocess
import sys
import threading
import tempfile
import traceback
import zipfile
import time
import uuid
from functools import cached_property
from pathlib import Path

import numpy as np

from app.core.config import get_settings


class ModelUnavailableError(RuntimeError):
    """Raised when real model inference is required but the model is unavailable."""


def download_model_from_hf() -> str:
    from huggingface_hub import hf_hub_download

    settings = get_settings()
    return hf_hub_download(
        repo_id=settings.huggingface_model_repo,
        filename=settings.huggingface_model_file,
        token=settings.huggingface_token,
    )


def download_labels_from_hf() -> str:
    from huggingface_hub import hf_hub_download

    settings = get_settings()
    return hf_hub_download(
        repo_id=settings.huggingface_model_repo,
        filename=settings.huggingface_labels_file,
        token=settings.huggingface_token,
    )


class EfficientNetInferenceEngine:
    def __init__(self, artifact_dir: str = "backend/app/training/artifacts") -> None:
        configured = Path(artifact_dir)
        self.artifact_dir = configured if configured.exists() else Path(__file__).resolve().parent / "artifacts"
        self.labels_path = self.artifact_dir / "labels.json"
        self.settings = get_settings()
        self.model_load_error: str | None = None
        self.model_path_error: str | None = None

    def _uses_model_worker(self) -> bool:
        return self.settings.isolate_model_inference and os.getenv("LEAFSENSE_MODEL_WORKER") != "1"

    def _run_worker(self, mode: str, *args: str) -> dict:
        command = [sys.executable, "-m", "app.training.model_worker", mode, *args]
        env = os.environ.copy()
        env["LEAFSENSE_MODEL_WORKER"] = "1"
        try:
            completed = subprocess.run(
                command,
                cwd=str(Path(__file__).resolve().parents[2]),
                env=env,
                capture_output=True,
                text=True,
                timeout=self.settings.model_worker_timeout_seconds,
                check=False,
            )
        except subprocess.TimeoutExpired as exc:
            raise ModelUnavailableError(
                f"Model worker timed out after {self.settings.model_worker_timeout_seconds} seconds."
            ) from exc
        stderr = completed.stderr.strip()
        stdout = completed.stdout.strip()
        if completed.returncode != 0:
            detail = stderr[-1200:] if stderr else f"worker exited with code {completed.returncode}"
            raise ModelUnavailableError(detail)
        try:
            payload = json.loads(stdout)
        except json.JSONDecodeError as exc:
            detail = stderr[-1200:] if stderr else stdout[-1200:] or "worker returned invalid JSON"
            raise ModelUnavailableError(detail) from exc
        if not payload.get("ok", False):
            raise ModelUnavailableError(str(payload.get("error") or "Model worker failed."))
        return payload

    def _space_endpoint_url(self) -> str | None:
        if not self.settings.huggingface_space_url:
            return None
        base_url = self.settings.huggingface_space_url.rstrip("/")
        endpoint = self.settings.huggingface_space_endpoint.strip() or "/gradio_api/call/predict"
        return f"{base_url}/{endpoint.lstrip('/')}"

    def _space_upload_url(self) -> str:
        if not self.settings.huggingface_space_url:
            raise ModelUnavailableError("Hugging Face Space URL is not configured.")
        return f"{self.settings.huggingface_space_url.rstrip('/')}/gradio_api/upload"

    def _space_event_url(self, endpoint: str, event_id: str) -> str:
        return f"{self.settings.huggingface_space_url.rstrip('/')}/gradio_api/call/{endpoint}/{event_id}"

    def _upload_to_space(self, image_path: Path) -> str:
        try:
            import httpx

            suffix = image_path.suffix.lower()
            mime = "image/png" if suffix == ".png" else "image/jpeg"
            with image_path.open("rb") as handle:
                files = {"files": (image_path.name, handle.read(), mime)}
                response = httpx.post(self._space_upload_url(), files=files, timeout=120)
            response.raise_for_status()
            uploaded = response.json()
            if isinstance(uploaded, list) and uploaded:
                return str(uploaded[0])
            raise ModelUnavailableError("Hugging Face upload endpoint returned no file path.")
        except ModelUnavailableError:
            raise
        except Exception as exc:
            raise ModelUnavailableError(
                f"Hugging Face upload failed: {''.join(traceback.format_exception_only(type(exc), exc)).strip()}"
            ) from exc

    def _poll_space_event(self, endpoint: str, event_id: str, headers: dict[str, str]) -> object:
        try:
            import httpx

            deadline = time.monotonic() + 180
            event_url = self._space_event_url(endpoint, event_id)
            while time.monotonic() < deadline:
                response = httpx.get(event_url, headers=headers, timeout=30)
                response.raise_for_status()
                text = response.text.strip()
                if text:
                    last_json = None
                    for line in text.splitlines():
                        if not line.startswith("data:"):
                            continue
                        payload = line.removeprefix("data:").strip()
                        if payload == "[DONE]":
                            return last_json if last_json is not None else {}
                        try:
                            last_json = json.loads(payload)
                        except json.JSONDecodeError:
                            continue
                    if last_json is not None:
                        return last_json
                time.sleep(1.5)
            raise ModelUnavailableError("Timed out waiting for Hugging Face Space prediction.")
        except ModelUnavailableError:
            raise
        except Exception as exc:
            raise ModelUnavailableError(
                f"Hugging Face Space polling failed: {''.join(traceback.format_exception_only(type(exc), exc)).strip()}"
            ) from exc

    def _predict_top_from_space(self, image_path: str, top_k: int) -> list[tuple[str, float]]:
        endpoint = self._space_endpoint_url()
        if not endpoint:
            raise ModelUnavailableError("Hugging Face Space URL is not configured.")
        try:
            import httpx

            headers = {}
            if self.settings.huggingface_token:
                headers["Authorization"] = f"Bearer {self.settings.huggingface_token}"
            path = Path(image_path)
            if endpoint.endswith("/gradio_api/call/predict"):
                uploaded_path = self._upload_to_space(path)
                response = httpx.post(
                    endpoint,
                    json={"data": [{"path": uploaded_path, "meta": {"_type": "gradio.FileData"}}]},
                    headers=headers,
                    timeout=120,
                )
                response.raise_for_status()
                event_id = response.json().get("event_id")
                if not event_id:
                    raise ModelUnavailableError("Hugging Face Space did not return an event id.")
                payload = self._poll_space_event("predict", event_id, headers)
                return self._parse_space_predictions(payload, top_k)
            with path.open("rb") as handle:
                files = {"file": (path.name, handle, "application/octet-stream")}
                response = httpx.post(endpoint, files=files, data={"top_k": str(top_k)}, headers=headers, timeout=120)
            response.raise_for_status()
            return self._parse_space_predictions(response.json(), top_k)
        except ModelUnavailableError:
            raise
        except Exception as exc:
            raise ModelUnavailableError(
                f"Hugging Face Space inference failed: {''.join(traceback.format_exception_only(type(exc), exc)).strip()}"
            ) from exc

    def _parse_space_predictions(self, payload: object, top_k: int) -> list[tuple[str, float]]:
        data = payload
        if isinstance(payload, dict):
            data = payload.get("predictions") or payload.get("topPredictions") or payload.get("data") or payload
        if isinstance(data, list) and len(data) == 1 and isinstance(data[0], list):
            data = data[0]
        predictions: list[tuple[str, float]] = []
        if isinstance(data, dict):
            for label, score in data.items():
                predictions.append((str(label), float(score)))
        elif isinstance(data, list):
            for item in data:
                if isinstance(item, dict):
                    label = item.get("label") or item.get("class") or item.get("disease") or item.get("name")
                    score = item.get("score") or item.get("confidence") or item.get("value") or item.get("probability")
                    if label is not None and score is not None:
                        predictions.append((str(label), float(score)))
                elif isinstance(item, (list, tuple)) and len(item) >= 2:
                    predictions.append((str(item[0]), float(item[1])))
        if not predictions:
            raise ModelUnavailableError("Hugging Face Space returned no usable predictions.")
        normalized = [(label, score / 100 if score > 1 else score) for label, score in predictions]
        return sorted(normalized, key=lambda item: item[1], reverse=True)[:top_k]

    def labels(self) -> list[str]:
        try:
            labels_file = download_labels_from_hf()
            return json.loads(Path(labels_file).read_text(encoding="utf-8"))
        except Exception:
            if self.labels_path.exists():
                return json.loads(self.labels_path.read_text(encoding="utf-8"))
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
            if path.exists() and self._is_usable_model_file(path):
                return path
        try:
            path = Path(download_model_from_hf())
            return path if self._is_usable_model_file(path) else None
        except Exception as exc:
            self.model_path_error = "".join(traceback.format_exception_only(type(exc), exc)).strip()
            return None

    def _is_usable_model_file(self, path: Path) -> bool:
        if not path.exists() or path.stat().st_size < 1024:
            return False
        if path.suffix.lower() == ".keras":
            try:
                with zipfile.ZipFile(path, "r") as archive:
                    return "config.json" in archive.namelist()
            except zipfile.BadZipFile:
                return False
        return True

    @cached_property
    def model(self):
        model_path = self.model_path
        if not model_path:
            if not self.settings.enable_model_inference:
                self.model_load_error = "Model inference is disabled. Set ENABLE_MODEL_INFERENCE=true on a Render plan with enough memory to load TensorFlow EfficientNet."
            return None
        errors: list[str] = []
        try:
            import tensorflow as tf

            return tf.keras.models.load_model(str(model_path), compile=False)
        except Exception as exc:
            errors.append(f"direct_load: {''.join(traceback.format_exception_only(type(exc), exc)).strip()}")
        try:
            import tensorflow as tf

            sanitized_path = self._sanitized_keras_path(model_path)
            return tf.keras.models.load_model(str(sanitized_path), compile=False, safe_mode=False)
        except Exception as exc:
            errors.append(f"sanitized_load: {''.join(traceback.format_exception_only(type(exc), exc)).strip()}")
        try:
            model = self._reconstructed_efficientnet_model()
            model.load_weights(str(model_path))
            return model
        except Exception as exc:
            errors.append(f"reconstructed_weights: {''.join(traceback.format_exception_only(type(exc), exc)).strip()}")
        self.model_load_error = " | ".join(errors)
        return None

    def _strip_unsupported_config(self, value):
        if isinstance(value, dict):
            return {key: self._strip_unsupported_config(item) for key, item in value.items() if key != "quantization_config"}
        if isinstance(value, list):
            return [self._strip_unsupported_config(item) for item in value]
        return value

    def _sanitized_keras_path(self, model_path: Path) -> Path:
        target = Path(tempfile.gettempdir()) / f"{model_path.stem}-leafsense-sanitized.keras"
        if target.exists() and target.stat().st_mtime >= model_path.stat().st_mtime:
            return target
        with zipfile.ZipFile(model_path, "r") as source, zipfile.ZipFile(target, "w", compression=zipfile.ZIP_DEFLATED) as destination:
            for info in source.infolist():
                content = source.read(info.filename)
                if info.filename == "config.json":
                    config = json.loads(content.decode("utf-8"))
                    content = json.dumps(self._strip_unsupported_config(config)).encode("utf-8")
                destination.writestr(info, content)
        return target

    def _reconstructed_efficientnet_model(self):
        import tensorflow as tf

        inputs = tf.keras.Input(shape=(224, 224, 3), name="input_layer_1")
        base = tf.keras.applications.EfficientNetB3(include_top=False, weights=None, input_tensor=inputs)
        x = tf.keras.layers.GlobalAveragePooling2D(name="global_average_pooling2d")(base.output)
        x = tf.keras.layers.Dropout(0.3, name="dropout")(x)
        x = tf.keras.layers.Dense(256, activation="relu", name="dense")(x)
        x = tf.keras.layers.Dropout(0.2, name="dropout_1")(x)
        outputs = tf.keras.layers.Dense(len(self.labels()) or 39, activation="softmax", name="dense_1")(x)
        return tf.keras.Model(inputs=inputs, outputs=outputs, name="sequential")

    def status(self, load_model: bool = False) -> dict[str, object]:
        labels = self.labels()
        path = None if self.settings.huggingface_space_url else self.model_path
        source = (
            "huggingface_space"
            if self.settings.huggingface_space_url
            else "local_path"
            if path and self.settings.model_path and Path(self.settings.model_path) == path
            else "huggingface"
            if path
            else "missing"
        )
        model = None
        worker_error = None
        if load_model:
            if self.settings.huggingface_space_url:
                model = object()
            elif self._uses_model_worker():
                try:
                    worker_status = self._run_worker("status")["status"]
                    return worker_status
                except ModelUnavailableError as exc:
                    worker_error = str(exc)
                    self.model_load_error = worker_error
            else:
                model = self.model
        return {
            "labelsLoaded": bool(labels),
            "labelCount": len(labels),
            "modelConfigured": bool(self.settings.model_path),
            "modelInferenceEnabled": self.settings.enable_model_inference,
            "modelInferenceIsolated": self.settings.isolate_model_inference,
            "modelSource": source,
            "huggingFaceRepo": self.settings.huggingface_model_repo,
            "huggingFaceModelFile": self.settings.huggingface_model_file,
            "huggingFaceSpaceUrl": self.settings.huggingface_space_url,
            "huggingFaceSpaceEndpoint": self.settings.huggingface_space_endpoint,
            "modelLoaded": model is not None,
            "modelLoadError": self.model_load_error,
            "modelWorkerError": worker_error,
            "modelPathError": self.model_path_error,
            "modelPath": str(path) if path else None,
            "usingFallbackPredictions": not self.settings.enable_model_inference or model is None or not labels,
        }

    @cached_property
    def input_size(self) -> tuple[int, int]:
        if self.model is None:
            return (224, 224)
        shape = self.model.input_shape
        return (int(shape[1] or 224), int(shape[2] or 224))

    def _preprocess(self, image_path: str) -> np.ndarray:
        from PIL import Image

        height, width = self.input_size
        image = Image.open(image_path).convert("RGB").resize((width, height))
        array = np.asarray(image, dtype=np.float32)
        return np.expand_dims(array / 255.0, axis=0)

    def predict_top(self, image_path: str, top_k: int = 5) -> list[tuple[str, float]]:
        if self.model is not None:
            labels = self.labels()
            if not labels:
                raise ModelUnavailableError("Model labels could not be loaded.")
            preds = np.asarray(self.model.predict(self._preprocess(image_path), verbose=0))[0]
            if preds.ndim != 1:
                preds = preds.reshape(-1)
            if preds.max(initial=0) > 1 or not np.isclose(float(preds.sum()), 1.0, atol=0.05):
                exp = np.exp(preds - np.max(preds))
                preds = exp / exp.sum()
            limit = min(top_k, len(preds), len(labels))
            indexes = np.argsort(preds)[::-1][:limit]
            return [(labels[int(index)], float(preds[int(index)])) for index in indexes]
        if self._uses_model_worker():
            payload = self._run_worker("predict", image_path, str(top_k))
            return [(str(label), float(score)) for label, score in payload["predictions"]]
        if self.settings.huggingface_space_url:
            return self._predict_top_from_space(image_path, top_k)
        labels = self.labels()
        if not labels:
            raise ModelUnavailableError("Model labels could not be loaded.")
        if self.model is None:
            detail = self.model_load_error or self.model_path_error or "Model could not be loaded."
            raise ModelUnavailableError(detail)
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
        raise ModelUnavailableError("Model returned no predictions.")


_ENGINE: EfficientNetInferenceEngine | None = None
_ENGINE_LOCK = threading.Lock()


def get_inference_engine() -> EfficientNetInferenceEngine:
    global _ENGINE
    if _ENGINE is None:
        with _ENGINE_LOCK:
            if _ENGINE is None:
                _ENGINE = EfficientNetInferenceEngine()
    return _ENGINE
