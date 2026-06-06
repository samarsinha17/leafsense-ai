import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { exportAnalyticsCsv, exportAnalyticsPdf } from "../utils/reportExport";

const baseData = [
  { name: "Tomato", today: 12, week: 42, month: 168 },
  { name: "Potato", today: 7, week: 24, month: 96 },
  { name: "Corn", today: 5, week: 18, month: 72 },
  { name: "Apple", today: 4, week: 14, month: 56 },
];

type Range = "today" | "week" | "month" | "custom";

export function Analytics() {
  const [range, setRange] = useState<Range>("month");
  const data = useMemo(() => baseData.map((item) => ({ name: item.name, value: item[range === "custom" ? "week" : range] })), [range]);
  const total = data.reduce((sum, item) => sum + item.value, 0);

  function download(format: "csv" | "excel" | "pdf") {
    if (format === "pdf") {
      exportAnalyticsPdf(range, data, total);
      return;
    }
    exportAnalyticsCsv(range, data, total);
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-4xl font-bold">Professional Analytics Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          {[
            ["Today", "today"],
            ["This Week", "week"],
            ["This Month", "month"],
            ["Custom Range", "custom"],
          ].map(([label, value]) => (
            <Button key={value} variant={range === value ? "primary" : "secondary"} onClick={() => setRange(value as Range)}>{label}</Button>
          ))}
        </div>
      </div>
      {range === "custom" ? (
        <Card className="mt-5">
          <div className="flex flex-wrap gap-3">
            <input className="rounded-full border border-border bg-transparent px-4 py-3" type="date" />
            <input className="rounded-full border border-border bg-transparent px-4 py-3" type="date" />
          </div>
        </Card>
      ) : null}
      <div className="mt-8 grid gap-4 md:grid-cols-6">
        {["Accuracy 96.4%", "Precision 95.2%", "Recall 94.8%", "F1 Score 95.0%", `Scans ${total}`, "Validation Accuracy 94.7%"].map((metric) => <Card key={metric}><p className="font-semibold">{metric}</p></Card>)}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="h-96"><h2 className="font-heading text-xl font-bold">Disease Distribution</h2><ResponsiveContainer width="100%" height="85%"><BarChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill="#22c55e" /></BarChart></ResponsiveContainer></Card>
        <Card className="h-96"><h2 className="font-heading text-xl font-bold">Prediction Trend</h2><ResponsiveContainer width="100%" height="85%"><LineChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Line dataKey="value" stroke="#84cc16" strokeWidth={3} /></LineChart></ResponsiveContainer></Card>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={() => download("pdf")}>Export PDF</Button>
        <Button variant="secondary" onClick={() => download("csv")}>Export CSV</Button>
        <Button variant="secondary" onClick={() => download("excel")}>Export Excel</Button>
      </div>
    </section>
  );
}
