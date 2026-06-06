import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { getUserDiagnoses, getUserDiagnosis } from "../services/api";
import { useAppStore } from "../store/useAppStore";

type Diagnosis = Awaited<ReturnType<typeof getUserDiagnoses>>[number];

export function MyDiagnoses() {
  const [items, setItems] = useState<Diagnosis[]>([]);
  const [opening, setOpening] = useState<number | null>(null);
  const setLastPrediction = useAppStore((state) => state.setLastPrediction);
  const navigate = useNavigate();

  useEffect(() => {
    getUserDiagnoses().then(setItems).catch(() => setItems([]));
  }, []);

  async function openDiagnosis(id: number) {
    setOpening(id);
    try {
      setLastPrediction(await getUserDiagnosis(id));
      navigate("/result");
    } finally {
      setOpening(null);
    }
  }

  function severityStyle(item: Diagnosis) {
    const severity = item.diseaseName.toLowerCase() === "healthy" ? "Healthy" : item.severity;
    if (severity === "Critical") return "bg-red-500/15 text-red-500";
    if (severity === "High") return "bg-orange-500/15 text-orange-500";
    if (severity === "Moderate" || severity === "Medium") return "bg-yellow-400/15 text-yellow-400";
    if (severity === "Low") return "bg-lime-500/15 text-lime-500";
    return "bg-green-600/15 text-green-500";
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
      <h1 className="font-heading text-4xl font-bold">My Diagnoses</h1>
      <div className="mt-8 grid gap-5">
        {items.length ? items.map((item) => (
          <button className="text-left" key={item.id} onClick={() => void openDiagnosis(item.id)} disabled={opening === item.id}>
          <Card className="grid gap-4 transition hover:border-primary md:grid-cols-[120px_1fr_auto]">
            <img className="h-28 w-full rounded-2xl object-cover" src={item.imageUrl} alt={item.diseaseName} />
            <div>
              <h2 className="font-heading text-2xl font-bold">{item.cropName} - {item.diseaseName}</h2>
              <p className="mt-2 text-sm text-muted">{new Date(item.createdAt).toLocaleString()}</p>
              <p className="mt-2 text-sm text-muted">Confidence: {item.confidenceScore}%</p>
            </div>
            <span className={`h-fit rounded-full px-4 py-2 text-sm font-semibold ${severityStyle(item)}`}>{item.diseaseName.toLowerCase() === "healthy" ? "Healthy" : item.severity}</span>
          </Card>
          </button>
        )) : <Card><p className="text-muted">No diagnoses yet. Upload a leaf image from Detect Disease to build your history.</p></Card>}
      </div>
    </section>
  );
}
