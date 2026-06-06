# LeafSense AI Dataset Architecture

Dataset files are not available yet, so this folder defines the expected architecture without requiring image assets.

## Expected Sources

- `raw/PlantVillage/`
- `raw/custom/`

## Processed Splits

- `processed/train/`
- `processed/validation/`
- `processed/test/`

Each class folder should use the convention:

```text
Crop___Disease_Name/
```

Examples:

- `Tomato___healthy`
- `Tomato___Late_blight`
- `Potato___Early_blight`

Run the backend training utilities after adding images.
