export type UserRole = "guest" | "user" | "admin";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  profileImage?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface DiseaseRecommendation {
  explanation: string;
  symptoms: string[];
  causes: string[];
  immediateActions: string[];
  organicTreatment: string[];
  chemicalTreatment: string[];
  preventiveMeasures: string[];
  wateringGuidance: string;
  fertilizerAdvice: string;
  farmerSummary: string;
}

export interface PredictionResult {
  id: string;
  imageUrl: string;
  cropName: string;
  diseaseName: string;
  scientificName: string;
  diseaseCategory: string;
  confidenceScore: number;
  infectedArea?: number;
  severity: "Healthy" | "Low" | "Moderate" | "Medium" | "High" | "Critical";
  timestamp: string;
  heatmapUrl?: string;
  highlightedUrl?: string;
  topPredictions?: Array<{ label: string; value: number }>;
  recommendation: DiseaseRecommendation;
}

export interface AnalyticsOverview {
  totalScans: number;
  healthyPlants: number;
  diseasedPlants: number;
  averageConfidence: number;
  users: number;
}
