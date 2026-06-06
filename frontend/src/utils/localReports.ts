import type { PredictionResult } from "../types";

export interface LocalReportRecord {
  id: string;
  report_id: string;
  format: "pdf" | "csv" | "email";
  crop_name: string;
  disease_name: string;
  confidence_score: number;
  severity: string;
  downloaded_at: string;
  status: string;
  result?: PredictionResult;
  crop_facts?: string[];
}

const STORAGE_KEY = "leafsense-local-reports";

export function getLocalReports(): LocalReportRecord[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as LocalReportRecord[];
  } catch {
    return [];
  }
}

export function recordLocalReport(result: PredictionResult, format: LocalReportRecord["format"], cropFacts: string[] = []) {
  const reports = getLocalReports();
  reports.unshift({
    id: `${result.id}-${format}-${Date.now()}`,
    report_id: result.id,
    format,
    crop_name: result.cropName,
    disease_name: result.diseaseName,
    confidence_score: result.confidenceScore,
    severity: result.severity,
    downloaded_at: new Date().toISOString(),
    status: format === "email" ? "Emailed" : "Downloaded",
    result,
    crop_facts: cropFacts,
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports.slice(0, 200)));
}
