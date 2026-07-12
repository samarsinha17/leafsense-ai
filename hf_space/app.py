from __future__ import annotations

import hashlib
import json
import os
import zipfile
from pathlib import Path

import gradio as gr
import numpy as np
from PIL import Image

MODEL_REPO = os.environ.get("HUGGINGFACE_MODEL_REPO", "samarsinha2517/leafsense-ai-model")
MODEL_FILE = os.environ.get("HUGGINGFACE_MODEL_FILE", "leafsense_model.keras")
LABELS_FILE = os.environ.get("HUGGINGFACE_LABELS_FILE", "labels.json")
HF_TOKEN = os.environ.get("HF_TOKEN") or os.environ.get("HUGGINGFACE_TOKEN")

INPUT_SIZE = (300, 300)

_model = None
_labels: list[str] = []


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _space_file_path(filename: str) -> Path:
    return Path(__file__).resolve().parent / filename


def _download_from_hf(filename: str) -> str:
    from huggingface_hub import hf_hub_download

    return hf_hub_download(
        repo_id=MODEL_REPO,
        repo_type="space",
        filename=filename,
        token=HF_TOKEN,
    )


def _resolve_file(filename: str) -> Path:
    local_path = _space_file_path(filename)
    if local_path.exists():
        return local_path
    return Path(_download_from_hf(filename))


def _is_valid_keras(path: Path) -> bool:
    if not path.exists() or path.stat().st_size < 1024:
        return False
    try:
        with zipfile.ZipFile(path, "r") as archive:
            return "config.json" in archive.namelist()
    except zipfile.BadZipFile:
        return False


def _build_efficientnet_model(num_classes: int):
    import tensorflow as tf

    inputs = tf.keras.Input(shape=(300, 300, 3), name="input_layer_1")
    base = tf.keras.applications.EfficientNetB3(include_top=False, weights=None, input_tensor=inputs)
    x = tf.keras.layers.GlobalAveragePooling2D(name="global_average_pooling2d")(base.output)
    x = tf.keras.layers.Dropout(0.3, name="dropout")(x)
    x = tf.keras.layers.Dense(256, activation="relu", name="dense")(x)
    x = tf.keras.layers.Dropout(0.2, name="dropout_1")(x)
    outputs = tf.keras.layers.Dense(num_classes, activation="softmax", name="dense_1")(x)
    return tf.keras.Model(inputs=inputs, outputs=outputs, name="sequential")


def load_model_and_labels():
    global _model, _labels

    try:
        labels_path = _resolve_file(LABELS_FILE)
        _labels = json.loads(labels_path.read_text(encoding="utf-8"))
        print(f"[LeafSense] labels={len(_labels)} path={labels_path} sha256={_sha256(labels_path)}")
    except Exception as exc:
        print(f"[LeafSense] WARNING: labels load failed: {exc}")
        _labels = [
            "Apple___Apple_scab",
            "Apple___Black_rot",
            "Apple___Cedar_apple_rust",
            "Apple___healthy",
            "Blueberry___healthy",
            "Cherry_(including_sour)___Powdery_mildew",
            "Cherry_(including_sour)___healthy",
            "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
            "Corn_(maize)___Common_rust_",
            "Corn_(maize)___Northern_Leaf_Blight",
            "Corn_(maize)___healthy",
            "Grape___Black_rot",
            "Grape___Esca_(Black_Measles)",
            "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
            "Grape___healthy",
            "Orange___Haunglongbing_(Citrus_greening)",
            "Peach___Bacterial_spot",
            "Peach___healthy",
            "Pepper,_bell___Bacterial_spot",
            "Pepper,_bell___healthy",
            "Potato___Early_blight",
            "Potato___Late_blight",
            "Potato___healthy",
            "Raspberry___healthy",
            "Soybean___healthy",
            "Squash___Powdery_mildew",
            "Strawberry___Leaf_scorch",
            "Strawberry___healthy",
            "Tomato___Bacterial_spot",
            "Tomato___Early_blight",
            "Tomato___Late_blight",
            "Tomato___Leaf_Mold",
            "Tomato___Septoria_leaf_spot",
            "Tomato___Spider_mites Two-spotted_spider_mite",
            "Tomato___Target_Spot",
            "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
            "Tomato___Tomato_mosaic_virus",
            "Tomato___healthy",
        ]

    try:
        import tensorflow as tf

        model_path = _resolve_file(MODEL_FILE)
        print(f"[LeafSense] model path={model_path} size={model_path.stat().st_size} sha256={_sha256(model_path)}")

        if _is_valid_keras(model_path):
            try:
                _model = tf.keras.models.load_model(str(model_path), compile=False)
                print("[LeafSense] model loaded direct")
                return
            except Exception as exc1:
                print(f"[LeafSense] direct load failed: {exc1}")

            try:
                _model = tf.keras.models.load_model(str(model_path), compile=False, safe_mode=False)
                print("[LeafSense] model loaded safe_mode=False")
                return
            except Exception as exc2:
                print(f"[LeafSense] safe_mode=False failed: {exc2}")

        _model = _build_efficientnet_model(len(_labels))
        _model.load_weights(str(model_path))
        print("[LeafSense] model loaded by reconstructed weights")
    except Exception as exc:
        print(f"[LeafSense] CRITICAL model load failed: {exc}")
        _model = None


def _preprocess(image: Image.Image) -> np.ndarray:
    image = image.convert("RGB").resize(INPUT_SIZE)
    array = np.asarray(image, dtype=np.float32)
    print(f"[LeafSense] preprocess shape={array.shape} dtype={array.dtype}")
    return np.expand_dims(array, axis=0)


def _run_inference(image: Image.Image, top_k: int = 5) -> list[dict]:
    if _model is None:
        raise RuntimeError("Model is not loaded.")
    if not _labels:
        raise RuntimeError("Labels are not loaded.")

    processed = _preprocess(image)
    preds = np.asarray(_model.predict(processed, verbose=0))[0]
    print(f"[LeafSense] raw preds={preds.tolist()}")

    if preds.max() > 1 or not np.isclose(float(preds.sum()), 1.0, atol=0.05):
        exp = np.exp(preds - np.max(preds))
        preds = exp / exp.sum()

    top_k = min(top_k, len(preds), len(_labels))
    indexes = np.argsort(preds)[::-1][:top_k]
    print(
        f"[LeafSense] top1 index={int(indexes[0])} label={_labels[int(indexes[0])]} confidence={float(preds[int(indexes[0])])}"
    )
    return [{"label": _labels[int(i)], "score": float(preds[int(i)])} for i in indexes]


def gradio_predict(image, top_k: int = 5):
    if image is None:
        return "Please upload a leaf image."
    if _model is None:
        return "Model not loaded. Check Space logs."

    try:
        if not isinstance(image, Image.Image):
            image = Image.fromarray(image)
        predictions = _run_inference(image, top_k=top_k)
    except Exception as exc:
        print(f"[LeafSense] Inference error: {exc}")
        return f"Error: {exc}"

    lines = []
    for i, pred in enumerate(predictions):
        label = pred["label"]
        score = pred["score"] * 100
        bar = "█" * int(score / 5) + "░" * (20 - int(score / 5))
        lines.append(f"#{i+1}  {label}\n     {bar}  {score:.1f}%\n")
    return "\n".join(lines)


load_model_and_labels()

with gr.Blocks(title="LeafSense AI - Plant Disease Detection", theme=gr.themes.Soft(primary_hue="green")) as demo:
    gr.Markdown(
        """
# LeafSense AI - Plant Disease Detection
Upload a leaf image to detect plant diseases using EfficientNetB3 trained on PlantVillage.
"""
    )

    with gr.Row():
        with gr.Column(scale=1):
            image_input = gr.Image(label="Upload Leaf Image", type="pil")
            top_k_slider = gr.Slider(minimum=1, maximum=10, value=5, step=1, label="Top-K Predictions")
            predict_btn = gr.Button("Analyze", variant="primary")
        with gr.Column(scale=1):
            output_text = gr.Textbox(label="Predictions", lines=15, show_copy_button=True)

    predict_btn.click(
        fn=gradio_predict,
        inputs=[image_input, top_k_slider],
        outputs=output_text,
    )

    gr.Markdown(
        """
---
**Supported crops:** Apple, Blueberry, Cherry, Corn, Grape, Orange, Peach, Pepper, Potato, Raspberry, Soybean, Squash, Strawberry, Tomato
"""
    )

demo.launch()
