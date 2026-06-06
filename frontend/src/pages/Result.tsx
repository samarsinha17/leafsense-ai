import { useState } from "react";
import { Bot, Download, FileDown, Mail, PlusCircle, Share2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { cropDataset } from "../data/content";
import { demoPrediction } from "../services/mock";
import { sendGmailContact } from "../services/api";
import { useAppStore } from "../store/useAppStore";
import { recordLocalReport } from "../utils/localReports";
import { exportDiagnosticCsv, exportDiagnosticPdf } from "../utils/reportExport";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export function Result() {
  const result = useAppStore((state) => state.lastPrediction) ?? demoPrediction;
  const setAssistantContext = useAppStore((state) => state.setAssistantContext);
  const navigate = useNavigate();
  const recommendation = result.recommendation;
  const topPredictions = result.topPredictions?.length
    ? result.topPredictions
    : [{ label: result.diseaseName, value: result.confidenceScore }];
  const cropInfo = cropDataset.find((item) => result.cropName.toLowerCase().includes(item.crop.toLowerCase()));
  const [emailStatus, setEmailStatus] = useState("");
  const severityClass = result.severity === "Critical"
    ? "text-red-500"
    : result.severity === "High"
      ? "text-orange-500"
      : result.severity === "Moderate" || result.severity === "Medium"
        ? "text-yellow-400"
        : result.severity === "Healthy"
          ? "text-green-600"
          : "text-lime-500";

  function downloadReport(format: "pdf" | "csv") {
    const facts = cropInfo?.facts ?? [];
    if (format === "pdf") exportDiagnosticPdf(result, facts);
    else exportDiagnosticCsv(result, facts);
    recordLocalReport(result, format, facts);
  }

  function loadGoogleScript() {
    return new Promise<void>((resolve, reject) => {
      if (window.google?.accounts.oauth2) {
        resolve();
        return;
      }
      const existing = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("Google script failed")), { once: true });
        return;
      }
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Google script failed"));
      document.head.appendChild(script);
    });
  }

  async function emailReport() {
    setEmailStatus("Requesting Gmail permission...");
    if (!GOOGLE_CLIENT_ID) {
      setEmailStatus("Google Client ID is not configured.");
      return;
    }
    await loadGoogleScript();
    const tokenClient = window.google?.accounts.oauth2?.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: "https://www.googleapis.com/auth/gmail.send",
      callback: async (response) => {
        if (!response.access_token) {
          setEmailStatus("Gmail permission was not granted.");
          return;
        }
        try {
          await sendGmailContact({
            accessToken: response.access_token,
            name: "LeafSense AI",
            email: "samarsinha2517@gmail.com",
            subject: `LeafSense Diagnostic Report - ${result.cropName} ${result.diseaseName}`,
            message: [
              `Report ID: ${result.id}`,
              `Crop: ${result.cropName}`,
              `Disease: ${result.diseaseName}`,
              `Scientific Name: ${result.scientificName}`,
              `Confidence: ${result.confidenceScore}%`,
              `Severity: ${result.severity}`,
              `Category: ${result.diseaseCategory}`,
              "",
              `Summary: ${recommendation.farmerSummary}`,
              `Symptoms: ${recommendation.symptoms.join("; ")}`,
              `Immediate Actions: ${recommendation.immediateActions.join("; ")}`,
              `Organic Treatment: ${recommendation.organicTreatment.join("; ")}`,
              `Chemical Treatment: ${recommendation.chemicalTreatment.join("; ")}`,
              `Preventive Measures: ${recommendation.preventiveMeasures.join("; ")}`,
            ].join("\n"),
          });
          recordLocalReport(result, "email", cropInfo?.facts ?? []);
          setEmailStatus("Report emailed to samarsinha2517@gmail.com.");
        } catch {
          setEmailStatus("Unable to send email report. Please grant Gmail send permission and try again.");
        }
      },
    });
    tokenClient?.requestAccessToken();
  }

  function shareReport() {
    const text = `LeafSense result: ${result.cropName} ${result.diseaseName}, ${result.confidenceScore}% confidence, severity ${result.severity}.`;
    if (navigator.share) {
      void navigator.share({ title: "LeafSense Result", text });
      return;
    }
    void navigator.clipboard.writeText(text);
  }

  function askAssistantAboutReport() {
    setAssistantContext(result);
    navigate("/assistant");
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <img className="h-80 w-full rounded-2xl object-cover" src={result.imageUrl} alt="Uploaded leaf" />
          <div className="mt-6 grid grid-cols-2 gap-4">
            <img className="h-40 rounded-xl object-cover" src={result.heatmapUrl ?? result.imageUrl} alt="Heatmap overlay" />
            <img className="h-40 rounded-xl object-cover" src={result.highlightedUrl ?? result.imageUrl} alt="Highlighted disease area" />
          </div>
          <div className="my-7 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
          {cropInfo?.image ? <img className="h-56 w-full rounded-2xl object-cover" src={cropInfo.image} alt={`${cropInfo.crop} fruit`} /> : null}
          <div className="mt-6 overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card to-sky-500/10 p-5">
            <h2 className="font-heading text-2xl font-bold">{result.cropName}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              {cropInfo ? `${cropInfo.crop} is one of the tracked crops in LeafSense AI, with dataset coverage for ${cropInfo.diseases.slice(0, 4).join(", ")}.` : "This crop was identified from the uploaded leaf image and matched with the trained disease-classification model."}
            </p>
            <h3 className="mt-5 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-bold text-white">Do you know?</h3>
            <ul className="mt-4 grid gap-3 text-sm text-muted">
              {(cropInfo?.facts ?? ["Leaf symptoms often appear before yield loss is visible.", "Good airflow and careful watering reduce many leaf disease risks."]).map((fact) => (
                <li className="rounded-2xl border border-border bg-background/70 px-4 py-3" key={fact}>{fact}</li>
              ))}
            </ul>
          </div>
        </Card>
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Diagnostic Result</p>
              <p className="mt-2 text-sm text-muted">{new Date(result.timestamp).toLocaleString()}</p>
            </div>
            <Link to="/detect">
              <Button variant="secondary">
                <PlusCircle size={17} /> New Scan
              </Button>
            </Link>
          </div>

          <h1 className="mt-3 font-heading text-4xl font-bold">{result.diseaseName}</h1>
          <p className="mt-2 text-muted">
            {result.scientificName} | {result.diseaseCategory} | {result.cropName}
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="flex min-h-32 flex-col items-center justify-center rounded-2xl bg-primary/10 p-5 text-center">
              <p className="text-sm text-muted">Crop Type</p>
              <p className="mt-2 break-words text-2xl font-bold text-primary">{result.cropName}</p>
            </div>
            <div className="flex min-h-32 flex-col items-center justify-center rounded-2xl bg-primary/10 p-5 text-center">
              <p className="text-sm text-muted">Confidence</p>
              <p className="mt-2 text-3xl font-bold text-primary">{result.confidenceScore}%</p>
            </div>
            <div className="flex min-h-32 flex-col items-center justify-center rounded-2xl bg-primary/10 p-5 text-center">
              <p className="text-sm text-muted">Infected Area</p>
              <p className="mt-2 text-3xl font-bold text-primary">{result.infectedArea ?? 0}%</p>
            </div>
            <div className="flex min-h-32 flex-col items-center justify-center rounded-2xl bg-primary/10 p-5 text-center">
              <p className="text-sm text-muted">Severity</p>
              <p className={`mt-2 break-words text-3xl font-bold ${severityClass}`}>{result.severity}</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-border p-5">
            <h3 className="font-semibold">Top predictions</h3>
            <div className="mt-4 grid gap-3">
              {topPredictions.slice(0, 5).map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between gap-3 text-sm">
                    <span>{item.label}</span>
                    <span className="font-semibold text-primary">{item.value}%</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-primary/10">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(Number(item.value), 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-6 leading-7 text-muted">{recommendation.explanation}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              ["Symptoms", recommendation.symptoms],
              ["Causes", recommendation.causes],
              ["Immediate Actions", recommendation.immediateActions],
              ["Organic Treatment", recommendation.organicTreatment],
              ["Chemical Treatment", recommendation.chemicalTreatment],
              ["Preventive Measures", recommendation.preventiveMeasures],
            ].map(([title, items]) => (
              <div key={title as string}>
                <h3 className="font-semibold">{title as string}</h3>
                <ul className="mt-2 space-y-1 text-sm text-muted">
                  {(items as string[]).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={() => downloadReport("pdf")}>
              <Download size={17} /> Download PDF
            </Button>
            <Button variant="secondary" onClick={() => downloadReport("csv")}>
              <FileDown size={17} /> Export CSV
            </Button>
            <Button variant="secondary" onClick={emailReport}>
              <Mail size={17} /> Email Report
            </Button>
            <Button variant="secondary" onClick={shareReport}>
              <Share2 size={17} /> Share Report
            </Button>
            <Button variant="secondary" onClick={askAssistantAboutReport}>
              <Bot size={17} /> Ask AI About This Result
            </Button>
          </div>
          {emailStatus ? <p className="mt-4 rounded-2xl bg-primary/10 px-4 py-3 text-sm text-primary">{emailStatus}</p> : null}
        </Card>
      </div>
    </section>
  );
}
