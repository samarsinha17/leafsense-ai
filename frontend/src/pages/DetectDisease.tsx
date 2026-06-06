import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Camera, Crop, FolderOpen, RotateCcw, ScanLine, UploadCloud, ZoomIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { predictDisease } from "../services/api";
import { demoPrediction } from "../services/mock";
import { useAppStore } from "../store/useAppStore";
import { supportedCrops } from "../data/content";

export function DetectDisease() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cropHint, setCropHint] = useState("Auto detect");
  const setLastPrediction = useAppStore((state) => state.setLastPrediction);
  const setAssistantContext = useAppStore((state) => state.setAssistantContext);
  const navigate = useNavigate();

  const onDrop = useCallback((files: File[]) => {
    const selected = files[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxFiles: 1,
    noClick: false,
  });

  async function analyze() {
    if (!file) return;
    setIsAnalyzing(true);
    try {
      const result = await predictDisease(file, cropHint);
      setLastPrediction(result);
      setAssistantContext(result);
    } catch {
      const fallback = { ...demoPrediction, imageUrl: preview ?? demoPrediction.imageUrl };
      setLastPrediction(fallback);
      setAssistantContext(fallback);
    } finally {
      setIsAnalyzing(false);
      navigate("/result");
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
            {preview ? (
              <img
                src={preview}
                alt="Uploaded plant preview"
                className="max-h-[340px] rounded-2xl object-contain"
                style={{ transform: `rotate(${rotation}deg) scale(${zoom})` }}
              />
            ) : (
              <div>
                <UploadCloud className="mx-auto text-primary" size={56} />
                <h1 className="mt-6 font-heading text-3xl font-bold">Upload Plant Image</h1>
                <p className="mt-3 text-muted">Drop the image here, click this box, or use Browse. JPG, PNG, JPEG, and WEBP are supported.</p>
                <p className="mt-4 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">Drag image directly into this upload area</p>
              </div>
            )}
          </div>
          <div className="mt-6 grid gap-4">
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" type="button" onClick={(event) => { event.stopPropagation(); open(); }}><FolderOpen size={17} /> Browse</Button>
              <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-border bg-card/70 px-6 py-3 text-sm font-semibold transition hover:border-primary/70 hover:text-primary">
                <Camera size={17} /> Camera
                <input className="hidden" type="file" accept="image/*" capture="environment" onChange={(event) => onDrop(Array.from(event.target.files ?? []))} />
              </label>
              <select
                className="rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold outline-none focus:border-primary"
                value={cropHint}
                onChange={(event) => setCropHint(event.target.value)}
              >
                <option>Auto detect</option>
                {supportedCrops.filter((crop) => crop !== "PlantVillage crops").map((crop) => <option key={crop}>{crop}</option>)}
              </select>
            </div>
            <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => setRotation((value) => value + 90)}><RotateCcw size={17} /> Rotate</Button>
            <Button variant="secondary" onClick={() => setZoom((value) => Math.min(value + 0.1, 1.6))}><ZoomIn size={17} /> Zoom</Button>
            <Button variant="secondary" onClick={() => { setFile(null); setPreview(null); setZoom(1); setRotation(0); }}>Reset</Button>
            <Button disabled={!file || isAnalyzing} onClick={analyze}><ScanLine size={17} /> {isAnalyzing ? "Analyzing..." : "Analyze Plant"}</Button>
            </div>
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
                  <h2 className="font-heading text-xl font-bold">Running deep inference...</h2>
                  <p className="text-sm text-muted">Preprocessing image, loading EfficientNet-B3, and preparing recommendations.</p>
                </div>
              </div>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-primary/10">
                <div className="h-full w-2/3 animate-pulse rounded-full bg-primary" />
              </div>
            </Card>
          ) : null}
          <Card>
            <Crop className="text-primary" />
            <h2 className="mt-4 font-heading text-2xl font-bold">Supported Crop Types</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {supportedCrops.map((crop) => <span className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary" key={crop}>{crop}</span>)}
            </div>
          </Card>
          <Card>
            <h2 className="font-heading text-2xl font-bold">Detection Guidelines</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              <li>Use one clear leaf image with visible symptoms.</li>
              <li>Avoid motion blur, extreme shadows, and very low resolution.</li>
              <li>Crop or zoom to keep the leaf as the main subject.</li>
              <li>Image validation and compression run before backend analysis.</li>
            </ul>
          </Card>
        </div>
      </div>
    </section>
  );
}
