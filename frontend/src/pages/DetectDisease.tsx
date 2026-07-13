import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Camera, ChevronDown, Crop, FolderOpen, RotateCcw, ScanLine, UploadCloud, ZoomIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { predictDisease } from "../services/api";
import { useAppStore } from "../store/useAppStore";
import { cropDataset } from "../data/content";
import { supportedCrops } from "../data/content";
import { translate } from "../data/translations";

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

async function dataUrlToFile(dataUrl: string, fileName: string): Promise<File> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const inferredName = fileName || `leafsense-${Date.now()}.jpg`;
  return new File([blob], inferredName, { type: blob.type || "image/jpeg" });
}

export function DetectDisease() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");
  const language = useAppStore((state) => state.language);
  const setLastPrediction = useAppStore((state) => state.setLastPrediction);
  const setAssistantContext = useAppStore((state) => state.setAssistantContext);
  const lastPrediction = useAppStore((state) => state.lastPrediction);
  const scanDraft = useAppStore((state) => state.scanDraft);
  const setScanDraft = useAppStore((state) => state.setScanDraft);
  const clearScanDraft = useAppStore((state) => state.clearScanDraft);
  const navigate = useNavigate();
  const t = (key: string) => translate(language, key);
  const cropInfo = lastPrediction
    ? cropDataset.find((item) => lastPrediction.cropName.toLowerCase().includes(item.crop.toLowerCase()))
    : null;

  const onDrop = useCallback(
    async (files: File[]) => {
      const selected = files[0];
      if (!selected) return;
      const imageDataUrl = await fileToDataUrl(selected);
      setScanDraft({
        imageDataUrl,
        imageName: selected.name,
        cropHint: scanDraft.cropHint ?? "auto",
      });
      setAnalysisError("");
    },
    [scanDraft.cropHint, setScanDraft],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxFiles: 1,
    noClick: false,
  });

  useEffect(() => {
    if (scanDraft.imageDataUrl || !lastPrediction?.imageUrl) return;
    setScanDraft({
      imageDataUrl: lastPrediction.imageUrl,
      imageName: `${lastPrediction.cropName}-${lastPrediction.diseaseName}.jpg`,
      cropHint: lastPrediction.cropName || "auto",
    });
  }, [lastPrediction, scanDraft.imageDataUrl, setScanDraft]);

  async function analyze() {
    if (!scanDraft.imageDataUrl) return;
    setIsAnalyzing(true);
    setAnalysisError("");
    try {
      const file = await dataUrlToFile(scanDraft.imageDataUrl, scanDraft.imageName ?? `leafsense-${Date.now()}.jpg`);
      const result = await predictDisease(file, scanDraft.cropHint === "auto" ? "Auto detect" : scanDraft.cropHint);
      setLastPrediction(result);
      setAssistantContext(result);
      navigate("/result");
    } catch {
      setAnalysisError(t("invalidImage"));
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="min-h-[560px]">
          <div
            {...getRootProps()}
            className={`grid min-h-[360px] cursor-pointer place-items-center rounded-2xl border-2 border-dashed p-8 text-center transition hover:border-primary hover:bg-primary/5 ${isDragActive ? "border-primary bg-primary/10" : "border-border"}`}
          >
            <input {...getInputProps()} />
            {scanDraft.imageDataUrl ? (
              <img
                src={scanDraft.imageDataUrl}
                alt="Uploaded plant preview"
                className="max-h-[340px] rounded-2xl object-contain"
                style={{ transform: `rotate(${scanDraft.rotation}deg) scale(${scanDraft.zoom})` }}
              />
            ) : (
              <div>
                <UploadCloud className="mx-auto text-primary" size={56} />
                <h1 className="mt-6 font-heading text-3xl font-bold">{t("uploadPlantImage")}</h1>
                <p className="mt-3 text-muted">{t("uploadHelp")}</p>
                <p className="mt-4 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">{t("dragHint")}</p>
              </div>
            )}
          </div>
          <div className="mt-6 grid gap-4">
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" type="button" onClick={(event) => { event.stopPropagation(); open(); }}>
                <FolderOpen size={17} /> {t("browse")}
              </Button>
              <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-border bg-card/70 px-6 py-3 text-sm font-semibold transition hover:border-primary/70 hover:text-primary">
                <Camera size={17} /> {t("camera")}
                <input className="hidden" type="file" accept="image/*" capture="environment" onChange={(event) => void onDrop(Array.from(event.target.files ?? []))} />
              </label>
              <div className="relative">
                <select
                  className="appearance-none rounded-full border border-border bg-card px-5 py-3 pr-10 text-sm font-semibold outline-none transition focus:border-primary"
                  value={scanDraft.cropHint}
                  onChange={(event) => setScanDraft({ cropHint: event.target.value })}
                >
                  <option value="auto">{t("autoDetect")}</option>
                  {supportedCrops.filter((crop) => crop !== "PlantVillage crops").map((crop) => (
                    <option key={crop} value={crop}>
                      {crop}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => setScanDraft({ rotation: scanDraft.rotation + 90 })}>
                <RotateCcw size={17} /> {t("rotate")}
              </Button>
              <Button variant="secondary" onClick={() => setScanDraft({ zoom: Math.min(scanDraft.zoom + 0.1, 1.6) })}>
                <ZoomIn size={17} /> {t("zoom")}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  clearScanDraft();
                  setAnalysisError("");
                }}
              >
                {language === "hi" ? "री-स्कैन" : "Re-scan"}
              </Button>
              <Button disabled={!scanDraft.imageDataUrl || isAnalyzing} onClick={analyze}>
                <ScanLine size={17} /> {isAnalyzing ? t("analyzing") : t("analyzePlant")}
              </Button>
            </div>
            {analysisError ? (
              <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">
                {analysisError}
              </div>
            ) : null}
          </div>
        </Card>
        <div className="grid gap-5">
          {isAnalyzing ? (
            <Card>
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary">
                  <ScanLine className="animate-pulse" />
                </div>
                <div>
                  <h2 className="font-heading text-xl font-bold">{t("runningInference")}</h2>
                  <p className="text-sm text-muted">{t("runningSubtext")}</p>
                </div>
              </div>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-primary/10">
                <div className="h-full w-2/3 animate-pulse rounded-full bg-primary" />
              </div>
            </Card>
          ) : lastPrediction ? (
            <Card className="border-primary/70">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">{t("diagnosticResult")}</p>
                  <p className="mt-2 text-sm text-muted">{new Date(lastPrediction.timestamp).toLocaleString()}</p>
                </div>
                <Button variant="secondary" onClick={() => navigate("/result")}>
                  {language === "hi" ? "पूर्ण परिणाम" : language === "hinglish" ? "View Full Result" : "View Full Result"}
                </Button>
              </div>

              <h2 className="mt-3 font-heading text-4xl font-bold">{lastPrediction.diseaseName}</h2>
              <p className="mt-2 text-muted">
                {lastPrediction.scientificName} | {lastPrediction.diseaseCategory} | {lastPrediction.cropName}
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="flex min-h-32 min-w-0 flex-col items-center justify-center overflow-hidden rounded-2xl bg-primary/10 p-5 text-center">
                  <p className="text-sm text-muted">{language === "hi" ? "फसल प्रकार" : language === "hinglish" ? "Crop Type" : "Crop Type"}</p>
                  <p className="mt-2 break-words text-2xl font-bold text-primary">{lastPrediction.cropName}</p>
                </div>
                <div className="flex min-h-32 min-w-0 flex-col items-center justify-center overflow-hidden rounded-2xl bg-primary/10 p-5 text-center">
                  <p className="text-sm text-muted">{language === "hi" ? "आत्मविश्वास" : language === "hinglish" ? "Confidence" : "Confidence"}</p>
                  <p className="mt-2 text-3xl font-bold text-primary">{lastPrediction.confidenceScore}%</p>
                </div>
                <div className="flex min-h-32 min-w-0 flex-col items-center justify-center overflow-hidden rounded-2xl bg-primary/10 p-5 text-center">
                  <p className="text-sm text-muted">{language === "hi" ? "संक्रमित क्षेत्र" : language === "hinglish" ? "Infected Area" : "Infected Area"}</p>
                  <p className="mt-2 text-3xl font-bold text-primary">{lastPrediction.infectedArea ?? 0}%</p>
                </div>
                <div className="flex min-h-32 min-w-0 flex-col items-center justify-center overflow-hidden rounded-2xl bg-primary/10 p-4 text-center">
                  <p className="text-sm text-muted">{language === "hi" ? "गंभीरता" : language === "hinglish" ? "Severity" : "Severity"}</p>
                  <p className="mt-2 max-w-full whitespace-nowrap text-center text-xl font-bold leading-none tracking-tight xl:text-[1.35rem] text-yellow-400">{lastPrediction.severity}</p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-border p-5">
                <h3 className="font-semibold">{language === "hi" ? "शीर्ष परिणाम" : language === "hinglish" ? "Top predictions" : "Top predictions"}</h3>
                <div className="mt-4 grid gap-3">
                  {(lastPrediction.topPredictions?.length ? lastPrediction.topPredictions : [{ label: lastPrediction.diseaseName, value: lastPrediction.confidenceScore }]).slice(0, 5).map((item) => (
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

              <p className="mt-6 leading-7 text-muted">{lastPrediction.recommendation.explanation}</p>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {[
                  [language === "hi" ? "लक्षण" : language === "hinglish" ? "Symptoms" : "Symptoms", lastPrediction.recommendation.symptoms],
                  [language === "hi" ? "कारण" : language === "hinglish" ? "Causes" : "Causes", lastPrediction.recommendation.causes],
                  [language === "hi" ? "तुरंत कदम" : language === "hinglish" ? "Immediate Actions" : "Immediate Actions", lastPrediction.recommendation.immediateActions],
                  [language === "hi" ? "जैविक उपचार" : language === "hinglish" ? "Organic Treatment" : "Organic Treatment", lastPrediction.recommendation.organicTreatment],
                  [language === "hi" ? "रासायनिक उपचार" : language === "hinglish" ? "Chemical Treatment" : "Chemical Treatment", lastPrediction.recommendation.chemicalTreatment],
                  [language === "hi" ? "रोकथाम उपाय" : language === "hinglish" ? "Preventive Measures" : "Preventive Measures", lastPrediction.recommendation.preventiveMeasures],
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
            </Card>
          ) : (
            <>
              <Card>
                <Crop className="text-primary" />
                <h2 className="mt-4 font-heading text-2xl font-bold">{t("supportedCropTypes")}</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {supportedCrops.map((crop) => (
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary" key={crop}>
                      {crop}
                    </span>
                  ))}
                </div>
              </Card>
              <Card>
                <h2 className="font-heading text-2xl font-bold">{t("detectionGuidelines")}</h2>
                <ul className="mt-4 space-y-3 text-sm text-muted">
                  <li>{t("guideline1")}</li>
                  <li>{t("guideline2")}</li>
                  <li>{t("guideline3")}</li>
                  <li>{t("guideline4")}</li>
                </ul>
              </Card>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
