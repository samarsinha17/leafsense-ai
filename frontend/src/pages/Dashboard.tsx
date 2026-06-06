import { Area, AreaChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "../components/ui/Card";

const trend = [
  { month: "Jan", scans: 220 },
  { month: "Feb", scans: 340 },
  { month: "Mar", scans: 510 },
  { month: "Apr", scans: 670 },
  { month: "May", scans: 820 },
  { month: "Jun", scans: 960 },
];

const cropDistribution = [
  { name: "Tomato", value: 42 },
  { name: "Potato", value: 24 },
  { name: "Corn", value: 18 },
  { name: "Other", value: 16 },
];

const cropColors = ["#22c55e", "#0ea5e9", "#f59e0b", "#ef4444"];

export function Dashboard() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <h1 className="font-heading text-4xl font-bold">User Dashboard</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        {["Total Scans", "Healthy Plants", "Diseased Plants", "Average Confidence"].map((label, index) => (
          <Card key={label}><p className="text-sm text-muted">{label}</p><p className="mt-2 text-3xl font-bold text-primary">{[12840, 7420, 5420, "91.8%"][index]}</p></Card>
        ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="h-96"><h2 className="font-heading text-xl font-bold">Monthly Scans</h2><ResponsiveContainer width="100%" height="85%"><AreaChart data={trend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Area dataKey="scans" stroke="#22c55e" fill="#22c55e55" /></AreaChart></ResponsiveContainer></Card>
        <Card className="h-96">
          <h2 className="font-heading text-xl font-bold">Crop Distribution</h2>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie data={cropDistribution} dataKey="value" nameKey="name" innerRadius={58} outerRadius={104} paddingAngle={3} label={({ value }) => `${value}%`}>
                {cropDistribution.map((entry, index) => (
                  <Cell key={entry.name} fill={cropColors[index % cropColors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend verticalAlign="bottom" iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <Card className="mt-8">
        <h2 className="font-heading text-xl font-bold">Recent Activity</h2>
        <div className="mt-5 grid gap-3 text-sm text-muted">
          {["Latest report generated for Tomato Late Blight", "Previous prediction exported as CSV", "Download history updated"].map((item) => <p key={item}>{item}</p>)}
        </div>
      </Card>
    </section>
  );
}
