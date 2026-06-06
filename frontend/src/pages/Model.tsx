import { Brain, Cpu, Database, GitBranch, ImageUp, ScanSearch } from "lucide-react";
import { Card } from "../components/ui/Card";

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
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="max-w-3xl">
        <h1 className="font-heading text-4xl font-bold">AI Model Details</h1>
        <p className="mt-3 text-muted">
          LeafSense uses the already trained Keras model for inference only. The training pipeline is documented but not rerun during app diagnosis.
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
          <h2 className="mt-4 font-heading text-2xl font-bold">Dataset Overview</h2>
          <p className="mt-3 leading-7 text-muted">
            The model is aligned to PlantVillage-style classes across tomato, potato, corn, apple, grape, pepper, strawberry, and related crop groups.
          </p>
        </Card>
        <Card>
          <GitBranch className="text-primary" />
          <h2 className="mt-4 font-heading text-2xl font-bold">Inference Pipeline</h2>
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
