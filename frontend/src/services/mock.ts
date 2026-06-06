import type { AnalyticsOverview, PredictionResult } from "../types";

export const demoPrediction: PredictionResult = {
  id: "demo-scan-001",
  imageUrl: "/leafsense-logo.png",
  cropName: "Tomato",
  diseaseName: "Late Blight",
  scientificName: "Phytophthora infestans",
  diseaseCategory: "Fungal-like oomycete disease",
  confidenceScore: 94.2,
  severity: "High",
  timestamp: new Date().toISOString(),
  heatmapUrl: "/leafsense-logo.png",
  highlightedUrl: "/leafsense-logo.png",
  topPredictions: [
    { label: "Tomato Late Blight", value: 94.2 },
    { label: "Tomato Early Blight", value: 3.1 },
    { label: "Tomato Healthy", value: 1.4 },
    { label: "Tomato Leaf Mold", value: 0.8 },
    { label: "Tomato Septoria Leaf Spot", value: 0.5 },
  ],
  recommendation: {
    explanation: "The scan indicates symptoms consistent with late blight, a fast-spreading disease that affects tomato leaves and stems under humid conditions.",
    symptoms: ["Dark water-soaked lesions", "Rapid leaf collapse", "White growth under leaves in humidity"],
    causes: ["High humidity", "Poor airflow", "Infected plant debris"],
    immediateActions: ["Isolate affected plants", "Remove severely infected leaves", "Avoid overhead watering"],
    organicTreatment: ["Apply copper-based organic fungicide", "Improve airflow by pruning dense foliage"],
    chemicalTreatment: ["Use a registered fungicide according to local agricultural guidance"],
    preventiveMeasures: ["Rotate crops", "Sanitize tools", "Use disease-resistant varieties"],
    wateringGuidance: "Water at soil level early in the morning and keep foliage dry.",
    fertilizerAdvice: "Avoid excessive nitrogen and maintain balanced potassium levels.",
    farmerSummary: "Act quickly, reduce humidity around the crop, and remove infected material to slow disease spread.",
  },
};

export const demoAnalytics: AnalyticsOverview = {
  totalScans: 12840,
  healthyPlants: 7420,
  diseasedPlants: 5420,
  averageConfidence: 91.8,
  users: 2100,
};
