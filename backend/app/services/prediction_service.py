from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4
from app.schemas.disease import PredictionResponse
from app.core.config import get_settings
from app.cv.localization import create_disease_heatmap
from app.services.gemini_service import GeminiRecommendationService
from app.training.inference import ModelUnavailableError, get_inference_engine


SCIENTIFIC_NAMES = {
    "Apple": "Malus domestica",
    "Blueberry": "Vaccinium corymbosum",
    "Cherry": "Prunus avium",
    "Corn": "Zea mays",
    "Grape": "Vitis vinifera",
    "Orange": "Citrus sinensis",
    "Peach": "Prunus persica",
    "Pepper": "Capsicum annuum",
    "Potato": "Solanum tuberosum",
    "Raspberry": "Rubus idaeus",
    "Soybean": "Glycine max",
    "Squash": "Cucurbita pepo",
    "Strawberry": "Fragaria x ananassa",
    "Tomato": "Solanum lycopersicum",
    "Unknown": "Unclassified plant sample",
}


class PredictionService:
    def __init__(self) -> None:
        self.gemini = GeminiRecommendationService()
        self.engine = get_inference_engine()
        self.settings = get_settings()

    def estimate_severity(self, infected_area: float, disease_name: str) -> str:
        if disease_name.lower() == "healthy":
            return "Healthy"
        if infected_area >= 60:
            return "Critical"
        if infected_area >= 35:
            return "High"
        if infected_area >= 15:
            return "Moderate"
        return "Low"

    def _estimate_infected_area(self, image_path: Path, disease_name: str) -> float:
        if disease_name.lower() == "healthy":
            return 0.0
        try:
            import cv2
            import numpy as np

            image = cv2.imread(str(image_path))
            if image is None:
                return 0.0
            hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
            leaf_mask = cv2.inRange(hsv, np.array([15, 25, 20]), np.array([100, 255, 255]))
            unhealthy_mask = cv2.inRange(hsv, np.array([0, 35, 15]), np.array([35, 255, 230]))
            leaf_pixels = int(cv2.countNonZero(leaf_mask))
            if leaf_pixels == 0:
                return 0.0
            infected_pixels = int(cv2.countNonZero(cv2.bitwise_and(unhealthy_mask, leaf_mask)))
            return round(min(100, infected_pixels * 100 / leaf_pixels), 2)
        except Exception:
            return 0.0

    def _image_path_from_url(self, image_url: str) -> Path:
        filename = image_url.rsplit("/", 1)[-1]
        return Path(self.settings.upload_dir) / filename

    def _clean_label(self, label: str) -> tuple[str, str, str]:
        crop_raw, _, disease_raw = label.partition("___")
        crop = crop_raw.replace("Corn_(maize)", "Corn").replace("Pepper,_bell", "Pepper").replace("_", " ")
        crop = crop.split(" (", 1)[0].strip()
        disease = disease_raw.replace("_", " ").replace("  ", " ").strip() or "Healthy"
        if disease.lower() == "healthy":
            category = "Healthy leaf"
            disease = "Healthy"
        elif "virus" in disease.lower():
            category = "Viral disease"
        elif "bacterial" in disease.lower():
            category = "Bacterial disease"
        elif "rust" in disease.lower() or "blight" in disease.lower() or "mildew" in disease.lower() or "rot" in disease.lower() or "spot" in disease.lower():
            category = "Fungal disease"
        else:
            category = "Computer vision diagnosis"
        return crop or "Unknown", disease, category

    def _prediction_rows(self, top: list[tuple[str, float]]) -> list[dict[str, float | str]]:
        rows: list[dict[str, float | str]] = []
        for label, score in top:
            crop, disease, _ = self._clean_label(label)
            rows.append({"label": f"{crop} {disease}", "value": round(score * 100, 2)})
        return rows

    def _normalize_crop_hint(self, crop_hint: str | None) -> str | None:
        if not crop_hint or crop_hint.strip().lower() in {"auto detect", "auto", "plantvillage crops"}:
            return None
        return crop_hint.strip().lower().replace(" ", "_")

    def _filter_by_crop_hint(self, top: list[tuple[str, float]], crop_hint: str | None) -> list[tuple[str, float]]:
        normalized_hint = self._normalize_crop_hint(crop_hint)
        if not normalized_hint:
            return top
        filtered: list[tuple[str, float]] = []
        for label, score in top:
            crop, _, _ = self._clean_label(label)
            if crop.lower().replace(" ", "_") == normalized_hint:
                filtered.append((label, score))
        if not filtered:
            raise ModelUnavailableError(f"No prediction class matched the selected crop hint: {crop_hint}.")
        return filtered

    def _make_visualizations(self, image_path: Path, image_url: str) -> tuple[str, str]:
        try:
            import cv2
            import numpy as np

            image = cv2.imread(str(image_path))
            if image is None:
                return image_url, image_url
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            _, mask = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            heatmap, overlay = create_disease_heatmap(image, mask.astype(np.uint8))
            heatmap_path = image_path.with_name(f"{image_path.stem}-heatmap.jpg")
            overlay_path = image_path.with_name(f"{image_path.stem}-highlighted.jpg")
            cv2.imwrite(str(heatmap_path), heatmap)
            cv2.imwrite(str(overlay_path), overlay)
            return f"/uploads/{heatmap_path.name}", f"/uploads/{overlay_path.name}"
        except Exception:
            return image_url, image_url

    def predict(self, image_url: str, crop_hint: str | None = None) -> PredictionResponse:
        image_path = self._image_path_from_url(image_url)
        requested_crop = self._normalize_crop_hint(crop_hint)
        top_k = 39 if requested_crop else 5
        top = self.engine.predict_top(str(image_path), top_k=top_k)
        top = self._filter_by_crop_hint(top, crop_hint)[:5]
        if not top:
            raise ModelUnavailableError("Model returned no predictions.")
        label, raw_confidence = top[0]
        crop_name, disease_name, disease_category = self._clean_label(label)
        confidence = round(raw_confidence * 100, 2)
        infected_area = self._estimate_infected_area(image_path, disease_name)
        severity = self.estimate_severity(infected_area, disease_name)
        heatmap_url, highlighted_url = self._make_visualizations(image_path, image_url)
        recommendation = self.gemini.build_recommendation(crop_name, disease_name, severity)
        return PredictionResponse(
            id=uuid4().hex,
            imageUrl=image_url,
            cropName=crop_name,
            diseaseName=disease_name,
            scientificName=SCIENTIFIC_NAMES.get(crop_name, "Plant pathology sample"),
            diseaseCategory=disease_category,
            confidenceScore=confidence,
            infectedArea=infected_area,
            severity=severity,
            timestamp=datetime.now(timezone.utc),
            heatmapUrl=heatmap_url,
            highlightedUrl=highlighted_url,
            topPredictions=self._prediction_rows(top),
            recommendation=recommendation,
        )
