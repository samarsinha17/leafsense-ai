import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "../components/ui/Card";
import { getUserDiagnoses } from "../services/api";

type Diagnosis = Awaited<ReturnType<typeof getUserDiagnoses>>[number];

export function MyAnalytics() {
  const [items, setItems] = useState<Diagnosis[]>([]);

  useEffect(() => {
    getUserDiagnoses().then(setItems).catch(() => setItems([]));
  }, []);

  const stats = useMemo(() => {
    const healthy = items.filter((item) => item.diseaseName.toLowerCase().includes("healthy")).length;
    const diseased = items.length - healthy;
    const last = items[0]?.createdAt;
    return { healthy, diseased, total: items.length, healthyPercent: items.length ? Math.round((healthy / items.length) * 100) : 0, last };
  }, [items]);

  const chart = Object.values(items.reduce<Record<string, { crop: string; scans: number }>>((acc, item) => {
    acc[item.cropName] ??= { crop: item.cropName, scans: 0 };
    acc[item.cropName].scans += 1;
    return acc;
  }, {}));

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
      <h1 className="font-heading text-4xl font-bold">My Analytics</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <Card><p className="text-sm text-muted">Total Uploads</p><p className="mt-2 text-3xl font-bold text-primary">{stats.total}</p></Card>
        <Card><p className="text-sm text-muted">Diseases Detected</p><p className="mt-2 text-3xl font-bold text-primary">{stats.diseased}</p></Card>
        <Card><p className="text-sm text-muted">Healthy Plants</p><p className="mt-2 text-3xl font-bold text-primary">{stats.healthyPercent}%</p></Card>
        <Card><p className="text-sm text-muted">Last Scan</p><p className="mt-2 text-lg font-bold text-primary">{stats.last ? new Date(stats.last).toLocaleDateString() : "None"}</p></Card>
      </div>
      <Card className="mt-8 h-96">
        <h2 className="font-heading text-xl font-bold">Uploads by Crop</h2>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={chart}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="crop" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="scans" fill="#22c55e" /></BarChart>
        </ResponsiveContainer>
      </Card>
    </section>
  );
}
