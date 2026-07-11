"""
LeafSense AI — HuggingFace Gradio Space
Serves the EfficientNetB3 plant disease detection model.

Exposes:
  POST /predict   — REST endpoint for the Render backend (primary)
  Gradio UI       — interactive demo for the HF Space page
"""

from __future__ import annotations

import json
import os
import hashlib
import zipfile
from pathlib import Path
from io import BytesIO

import numpy as np
import gradio as gr
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.responses import JSONResponse

# ---------------------------------------------------------------------------
# Model + labels loading
# ---------------------------------------------------------------------------

MODEL_REPO = os.environ.get("HUGGINGFACE_MODEL_REPO", "samarsinha2517/leafsense-ai-model")
MODEL_FILE = os.environ.get("HUGGINGFACE_MODEL_FILE", "leafsense_model.keras")
LABELS_FILE = os.environ.get("HUGGINGFACE_LABELS_FILE", "labels.json")
HF_TOKEN = os.environ.get("HF_TOKEN") or os.environ.get("HUGGINGFACE_TOKEN")

INPUT_SIZE = (300, 300)

_model = None
_labels: list[str] = []


def _download_from_hf(filename: str) -> str:
    from huggingface_hub import hf_hub_download
    return hf_hub_download(
        repo_id=MODEL_REPO,
        filename=filename,
        token=HF_TOKEN,
    )


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _is_valid_keras(path: Path) -> bool:
    if not path.exists() or path.stat().st_size < 1024:
        return False
    try:
        with zipfile.ZipFile(path, "r") as z:
            return "config.json" in z.namelist()
    except zipfile.BadZipFile:
        return False


def load_model_and_labels():
    """Download and load the model + labels once at startup."""
    global _model, _labels

    # --- Labels ---
    try:
        labels_path = Path(_download_from_hf(LABELS_FILE))
        _labels = json.loads(labels_path.read_text(encoding="utf-8"))
        print(f"[LeafSense] Loaded {len(_labels)} labels from {labels_path} sha256={_sha256(labels_path)}")
    except Exception as exc:
        print(f"[LeafSense] WARNING: Could not load labels from HF: {exc}")
        # Fallback: embedded labels (PlantVillage 39 classes)
        _labels = [
            "Apple___Apple_scab", "Apple___Black_rot", "Apple___Cedar_apple_rust", "Apple___healthy",
            "Blueberry___healthy",
            "Cherry_(including_sour)___Powdery_mildew", "Cherry_(including_sour)___healthy",
            "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot", "Corn_(maize)___Common_rust_",
            "Corn_(maize)___Northern_Leaf_Blight", "Corn_(maize)___healthy",
            "Grape___Black_rot", "Grape___Esca_(Black_Measles)", "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)", "Grape___healthy",
            "Orange___Haunglongbing_(Citrus_greening)",
            "Peach___Bacterial_spot", "Peach___healthy",
            "Pepper,_bell___Bacterial_spot", "Pepper,_bell___healthy",
            "Potato___Early_blight", "Potato___Late_blight", "Potato___healthy",
            "Raspberry___healthy",
            "Soybean___healthy",
            "Squash___Powdery_mildew",
            "Strawberry___Leaf_scorch", "Strawberry___healthy",
            "Tomato___Bacterial_spot", "Tomato___Early_blight", "Tomato___Late_blight",
            "Tomato___Leaf_Mold", "Tomato___Septoria_leaf_spot",
            "Tomato___Spider_mites Two-spotted_spider_mite", "Tomato___Target_Spot",
            "Tomato___Tomato_Yellow_Leaf_Curl_Virus", "Tomato___Tomato_mosaic_virus", "Tomato___healthy",
        ]

    # --- Model ---
    try:
        import tensorflow as tf
        model_path = Path(_download_from_hf(MODEL_FILE))
        print(f"[LeafSense] Model downloaded to: {model_path} size={model_path.stat().st_size} sha256={_sha256(model_path)}")

        if _is_valid_keras(model_path):
            try:
                _model = tf.keras.models.load_model(str(model_path), compile=False)
                print("[LeafSense] Model loaded successfully (direct).")
                return
            except Exception as exc1:
                print(f"[LeafSense] Direct load failed: {exc1}. Trying safe_mode=False...")
            try:
                _model = tf.keras.models.load_model(str(model_path), compile=False, safe_mode=False)
                print("[LeafSense] Model loaded successfully (safe_mode=False).")
                return
            except Exception as exc2:
                print(f"[LeafSense] safe_mode=False load failed: {exc2}. Trying weight reconstruction...")

        # Fallback: reconstruct architecture and load weights
        _model = _build_efficientnet_model(len(_labels))
        _model.load_weights(str(model_path))
        print("[LeafSense] Model loaded via weight reconstruction.")

    except Exception as exc:
        print(f"[LeafSense] CRITICAL: Could not load model: {exc}")
        _model = None


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


# ---------------------------------------------------------------------------
# Inference helpers
# ---------------------------------------------------------------------------

def _preprocess(image_bytes: bytes) -> np.ndarray:
    from PIL import Image
    image = Image.open(BytesIO(image_bytes)).convert("RGB").resize(INPUT_SIZE)
    array = np.asarray(image, dtype=np.float32)
    print(f"[LeafSense] Preprocess shape={array.shape} dtype={array.dtype}")
    return np.expand_dims(array, axis=0)


def _run_inference(image_bytes: bytes, top_k: int = 5) -> list[dict]:
    if _model is None:
        raise RuntimeError("Model is not loaded. Check Space logs for errors.")
    if not _labels:
        raise RuntimeError("Labels are not loaded.")

    processed = _preprocess(image_bytes)
    preds = np.asarray(_model.predict(processed, verbose=0))[0]
    print(f"[LeafSense] Raw prediction vector={preds.tolist()}")

    # Ensure valid probabilities
    if preds.max() > 1 or not np.isclose(float(preds.sum()), 1.0, atol=0.05):
        exp = np.exp(preds - np.max(preds))
        preds = exp / exp.sum()

    top_k = min(top_k, len(preds), len(_labels))
    indexes = np.argsort(preds)[::-1][:top_k]
    print(f"[LeafSense] Predicted index={int(indexes[0])} label={_labels[int(indexes[0])]} confidence={float(preds[int(indexes[0])])}")
    return [{"label": _labels[int(i)], "score": float(preds[int(i)])} for i in indexes]


# ---------------------------------------------------------------------------
# FastAPI app (custom REST endpoint for Render backend)
# ---------------------------------------------------------------------------

api = FastAPI(title="LeafSense AI Model API")


@api.get("/")
def root():
    return {
        "service": "LeafSense AI Model Space",
        "modelLoaded": _model is not None,
        "labelCount": len(_labels),
        "endpoints": ["/predict", "/health"],
    }


@api.get("/health")
def health():
    return {
        "status": "ok" if _model is not None else "model_not_loaded",
        "modelLoaded": _model is not None,
        "labelCount": len(_labels),
    }


@api.post("/predict")
async def predict(
    file: UploadFile = File(...),
    top_k: int = Form(default=5),
):
    try:
        image_bytes = await file.read()
        predictions = _run_inference(image_bytes, top_k=top_k)
        return JSONResponse({"predictions": predictions})
    except RuntimeError as exc:
        return JSONResponse({"error": str(exc)}, status_code=503)
    except Exception as exc:
        return JSONResponse({"error": f"Inference failed: {exc}"}, status_code=500)


# ---------------------------------------------------------------------------
# Gradio UI (for the HF Space demo page)
# ---------------------------------------------------------------------------

def gradio_predict(image, top_k: int = 5):
    """Gradio-compatible prediction function."""
    if image is None:
        return "Please upload a leaf image."
    if _model is None:
        return "❌ Model not loaded. Check Space logs."

    from PIL import Image as PILImage
    buf = BytesIO()
    if not isinstance(image, PILImage.Image):
        image = PILImage.fromarray(image)
    image.save(buf, format="PNG")
    image_bytes = buf.getvalue()

    try:
        predictions = _run_inference(image_bytes, top_k=top_k)
    except Exception as exc:
        return f"Error: {exc}"

    lines = []
    for i, pred in enumerate(predictions):
        label = pred["label"]
        score = pred["score"] * 100
        bar = "█" * int(score / 5) + "░" * (20 - int(score / 5))
        lines.append(f"#{i+1}  {label}\n     {bar}  {score:.1f}%\n")
    return "\n".join(lines)


with gr.Blocks(
    title="🌿 LeafSense AI — Plant Disease Detection",
    theme=gr.themes.Soft(primary_hue="green"),
) as demo:
    gr.Markdown("""
    # 🌿 LeafSense AI — Plant Disease Detection
    Upload a leaf image to detect plant diseases using EfficientNetB3 trained on PlantVillage (39 classes, ~99.6% accuracy).
    """)

    with gr.Row():
        with gr.Column(scale=1):
            image_input = gr.Image(label="Upload Leaf Image", type="pil")
            top_k_slider = gr.Slider(minimum=1, maximum=10, value=5, step=1, label="Top-K Predictions")
            predict_btn = gr.Button("🔍 Analyze", variant="primary")
        with gr.Column(scale=1):
            output_text = gr.Textbox(label="Predictions", lines=15, show_copy_button=True)

    predict_btn.click(
        fn=gradio_predict,
        inputs=[image_input, top_k_slider],
        outputs=output_text,
    )

    gr.Markdown("""
    ---
    **Supported crops:** Apple, Blueberry, Cherry, Corn, Grape, Orange, Peach, Pepper, Potato, Raspberry, Soybean, Squash, Strawberry, Tomato  
    **Model:** EfficientNetB3 fine-tuned on PlantVillage dataset
    """)

# ---------------------------------------------------------------------------
# Launch — mount Gradio on FastAPI so both /predict and UI work
# ---------------------------------------------------------------------------

# Load model at startup
load_model_and_labels()

# Mount Gradio on the FastAPI app
app = gr.mount_gradio_app(api, demo, path="/")
