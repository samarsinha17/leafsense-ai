import { Brain, Cpu, Database, GitBranch, ImageUp, ScanSearch } from "lucide-react";
import { Card } from "../components/ui/Card";
import { useAppStore } from "../store/useAppStore";
import { translate } from "../data/translations";

const metrics = [
  ["Backbone", "EfficientNet-B3"],
  ["Input Size", "300 x 300 RGB"],
  ["Output Classes", "39"],
  ["Mode", "Inference only"],
];

const pipeline = [
  { icon: ImageUp, title: "Image Upload", detail: "JPG, PNG, JPEG, or WEBP leaf image is stored by FastAPI." },
  { icon: Cpu, title: "OpenCV Preprocessing", detail: "Image is resized and prepared for the trained Keras model." },
  { icon: Brain, title: "EfficientNet-B3", detail: "The provided leafsense_model.keras file generates class probabilities." },
  { icon: ScanSearch, title: "Prediction Output", detail: "Top disease labels, confidence, severity, heatmap, and highlight views are returned." },
];

export function Model() {
  const language = useAppStore((state) => state.language);
  const t = (key: string) => translate(language, key);
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="max-w-3xl">
        <h1 className="font-heading text-4xl font-bold">{t("aiModelDetails")}</h1>
        <p className="mt-3 text-muted">
          {language === "hi" ? "LeafSense पहले से प्रशिक्षित Keras मॉडल का केवल inference के लिए उपयोग करता है। Training pipeline documented है, लेकिन app diagnosis के दौरान rerun नहीं होती।" : language === "hinglish" ? "LeafSense already trained Keras model ko sirf inference ke liye use karta hai. Training pipeline documented hai, but app diagnosis ke dauran rerun nahi hoti." : "LeafSense uses the already trained Keras model for inference only. The training pipeline is documented but not rerun during app diagnosis."}
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        {metrics.map(([label, value]) => (
          <Card key={label}>
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-2 text-2xl font-bold text-primary">{value}</p>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <Database className="text-primary" />
          <h2 className="mt-4 font-heading text-2xl font-bold">{t("datasetOverview")}</h2>
          <p className="mt-3 leading-7 text-muted">
            {language === "hi" ? "Model PlantVillage-style classes ke saath aligned hai: tomato, potato, corn, apple, grape, pepper, strawberry, aur related crop groups." : language === "hinglish" ? "Model PlantVillage-style classes ke saath aligned hai: tomato, potato, corn, apple, grape, pepper, strawberry, aur related crop groups." : "The model is aligned to PlantVillage-style classes across tomato, potato, corn, apple, grape, pepper, strawberry, and related crop groups."}
          </p>
        </Card>
        <Card>
          <GitBranch className="text-primary" />
          <h2 className="mt-4 font-heading text-2xl font-bold">{t("inferencePipeline")}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {pipeline.map((step) => (
              <div className="rounded-2xl border border-border p-4" key={step.title}>
                <step.icon className="text-primary" />
                <h3 className="mt-3 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{step.detail}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}
