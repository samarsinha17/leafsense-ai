from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from app.core.config import get_settings
from app.schemas.disease import PredictionResponse


class ReportService:
    def __init__(self) -> None:
        self.report_dir = Path(get_settings().report_dir)
        self.report_dir.mkdir(parents=True, exist_ok=True)

    def generate_pdf(self, prediction: PredictionResponse) -> str:
        path = self.report_dir / f"{prediction.id}.pdf"
        pdf = canvas.Canvas(str(path), pagesize=letter)
        pdf.setTitle("LeafSense AI Disease Report")
        pdf.drawString(72, 740, "LeafSense AI Disease Report")
        pdf.drawString(72, 710, f"Prediction: {prediction.diseaseName}")
        pdf.drawString(72, 690, f"Crop: {prediction.cropName}")
        pdf.drawString(72, 670, f"Confidence: {prediction.confidenceScore}%")
        pdf.drawString(72, 650, f"Severity: {prediction.severity}")
        pdf.drawString(72, 630, f"Timestamp: {prediction.timestamp.isoformat()}")
        pdf.drawString(72, 600, prediction.recommendation.farmerSummary[:120])
        pdf.save()
        return f"/reports/{path.name}"
