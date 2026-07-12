---
title: LeafSense AI Model
emoji: 🌿
colorFrom: green
colorTo: green
sdk: gradio
sdk_version: 5.0.0
app_file: app.py
pinned: false
license: mit
---

# LeafSense AI - Plant Disease Detection Model

This Hugging Face Space serves the LeafSense AI EfficientNetB3 model trained on the PlantVillage dataset.

It provides an interactive image upload interface for leaf disease classification.

## Usage

Upload a clear leaf image, choose how many top predictions to display, and click Analyze.

## Model

- Architecture: EfficientNetB3 (fine-tuned)
- Dataset: PlantVillage (39 classes)
- Input size: 300x300
- Accuracy: ~99.6%
