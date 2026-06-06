import { type SyntheticEvent, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Search } from "lucide-react";
import { Card } from "../components/ui/Card";
import { cropDataset } from "../data/content";

export function Dataset() {
  const [selectedCrop, setSelectedCrop] = useState(cropDataset[0]);
  const totalImages = useMemo(() => cropDataset.reduce((sum, item) => sum + item.images, 0), []);
  const trainingSamples = Math.round(totalImages * 0.8);
  const validationSamples = totalImages - trainingSamples;

  function fallbackImage(crop: string) {
    const fallbacks: Record<string, string> = {
      Peach: "https://commons.wikimedia.org/wiki/Special:FilePath/Autumn%20Red%20peaches.jpg?width=900",
      Soybean: "https://commons.wikimedia.org/wiki/Special:FilePath/Soybean%20Pods%20%2810068734305%29.jpg?width=900",
    };
    return fallbacks[crop] ?? `https://source.unsplash.com/900x600/?${encodeURIComponent(`${crop} crop fruit`)}`;
  }

  function handleImageError(event: SyntheticEvent<HTMLImageElement>, crop: string) {
    const image = event.currentTarget;
    if (image.dataset.fallbackApplied) return;
    image.dataset.fallbackApplied = "true";
    image.src = fallbackImage(crop);
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl font-bold">Dataset</h1>
          <p className="mt-3 max-w-2xl text-muted">PlantVillage-style class coverage, crop distribution, split details, and visual crop cards for the LeafSense model.</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        {[
          ["Total Images", totalImages.toLocaleString()],
          ["Classes", "39"],
          ["Training Samples", trainingSamples.toLocaleString()],
          ["Validation Samples", validationSamples.toLocaleString()],
        ].map(([label, value]) => (
          <Card key={label}>
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-2 text-3xl font-bold text-primary">{value}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="flex items-center gap-2 rounded-full border border-border px-4 py-3">
            <Search size={18} />
            <input className="w-full bg-transparent outline-none" placeholder="Search dataset classes" />
          </label>
          <select className="rounded-full border border-border bg-card px-4 py-3" onChange={(event) => setSelectedCrop(cropDataset.find((item) => item.crop === event.target.value) ?? cropDataset[0])}>
            {cropDataset.map((item) => <option key={item.crop}>{item.crop}</option>)}
          </select>
          <select className="rounded-full border border-border bg-card px-4 py-3">
            <option>Filter By Disease</option>
            {selectedCrop.diseases.map((disease) => <option key={disease}>{disease}</option>)}
          </select>
        </div>
      </Card>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="h-96">
          <h2 className="font-heading text-xl font-bold">Class Distribution Graph</h2>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={cropDataset}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="crop" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="images" fill="#22c55e" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div className="flex items-start gap-5">
            <img className="h-24 w-24 shrink-0 rounded-3xl object-cover" src={selectedCrop.image} alt={selectedCrop.crop} onError={(event) => handleImageError(event, selectedCrop.crop)} />
            <div>
              <h2 className="font-heading text-2xl font-bold">{selectedCrop.crop}</h2>
              <p className="mt-1 text-sm text-muted">{selectedCrop.images.toLocaleString()} images | {selectedCrop.percent}% of dataset</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedCrop.diseases.map((disease) => (
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary" key={disease}>{disease}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 rounded-2xl border border-border p-4">
            <h3 className="font-semibold">Do you know?</h3>
            <ul className="mt-3 grid gap-2 text-sm text-muted">
              {selectedCrop.facts.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </Card>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {cropDataset.map((item) => (
          <button className="text-left" key={item.crop} onClick={() => setSelectedCrop(item)}>
            <Card className={`h-full ${selectedCrop.crop === item.crop ? "border-primary/70" : ""}`}>
              <img className="h-36 w-full rounded-2xl object-cover" src={item.image} alt={item.crop} onError={(event) => handleImageError(event, item.crop)} />
              <div className="mt-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{item.crop}</h2>
                  <p className="text-sm text-muted">{item.diseases.length} tracked groups</p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-bold text-primary">{item.images.toLocaleString()}</p>
                  <p className="text-muted">{item.percent}%</p>
                </div>
              </div>
            </Card>
          </button>
        ))}
      </div>
    </section>
  );
}
