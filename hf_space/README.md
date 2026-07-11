---
title: LeafSense AI Model
emoji: 🌿
colorFrom: green
colorTo: teal
sdk: gradio
sdk_version: 4.44.1
app_file: app.py
pinned: false
license: mit
---

# 🌿 LeafSense AI — Plant Disease Detection Model

This Hugging Face Space serves the LeafSense AI EfficientNetB3 model trained on the PlantVillage dataset.

It exposes a `/predict` REST endpoint consumed by the [LeafSense AI backend](https://github.com/samarsinha17/leafsense-ai) hosted on Render.

## API

### `POST /predict`

**Request:** multipart form-data with:
- `file` — the leaf image (JPEG/PNG)
- `top_k` — (optional, int, default 5) number of top predictions to return

**Response:**
```json
{
  "predictions": [
    {"label": "Tomato___Early_blight", "score": 0.923},
    ...
  ]
}
```

## Model

- Architecture: EfficientNetB3 (fine-tuned)
- Dataset: PlantVillage (39 classes)
- Input size: 300×300
- Accuracy: ~99.6%
