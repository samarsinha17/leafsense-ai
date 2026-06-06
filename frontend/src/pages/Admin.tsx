import { useEffect, useMemo, useState } from "react";
import { Activity, Database, Download, FileText, RefreshCw, Settings, ShieldCheck, Users } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { getAdminOverview, getProfile } from "../services/api";
import { useAppStore } from "../store/useAppStore";

type AdminTab = "overview" | "users" | "reports" | "dataset" | "system";
type AdminOverview = { users: Record<string, unknown>[]; reports: Record<string, unknown>[]; dataset: Record<string, unknown>[]; settings: Record<string, unknown> };

function value(row: Record<string, unknown>, key: string) {
  const item = row[key];
  if (item === null || item === undefined) return "-";
  if (typeof item === "object") return JSON.stringify(item).slice(0, 80);
  return String(item);
}

export function Admin() {
  const location = useLocation();
  const user = useAppStore((state) => state.user);
  const setUser = useAppStore((state) => state.setUser);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [tab, setTab] = useState<AdminTab>("overview");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const routeTab = location.pathname.includes("/users")
      ? "users"
      : location.pathname.includes("/reports")
        ? "reports"
        : location.pathname.includes("/dataset")
          ? "dataset"
          : location.pathname.includes("/system")
            ? "system"
            : "overview";
    setTab(routeTab);
  }, [location.pathname]);

  const metrics = useMemo(() => {
    const users = overview?.users.length ?? 0;
    const reports = overview?.reports.length ?? 0;
    const dataset = overview?.dataset.length ?? 0;
    return [
      { label: "Admin Users", value: users, icon: Users, color: "text-primary" },
      { label: "Generated Reports", value: reports, icon: FileText, color: "text-sky-500" },
      { label: "Dataset Records", value: dataset, icon: Database, color: "text-amber-500" },
      { label: "System Status", value: "Ready", icon: ShieldCheck, color: "text-emerald-500" },
    ];
  }, [overview]);

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      setOverview(await getAdminOverview());
    } catch {
      setError("Admin data is restricted to Samar Sinha and Yash Gupta.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!user && localStorage.getItem("leafsense-access-token")) {
      getProfile().then(setUser).catch(() => setError("Please log in with an administrator account."));
      return;
    }
    if (user?.role === "admin") void refresh();
  }, [setUser, user]);

  function exportRows(name: string, rows: Record<string, unknown>[]) {
    const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row)))).slice(0, 16);
    const csv = [headers.join(","), ...rows.map((row) => headers.map((header) => `"${value(row, header).replace(/"/g, '""')}"`).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `leafsense-admin-${name}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (!user || user.role !== "admin") {
    return (
      <section className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
        <Card>
          <h1 className="font-heading text-3xl font-bold">Admin Access Restricted</h1>
          <p className="mt-3 text-muted">Only Samar Sinha and Yash Gupta administrator accounts can access this page.</p>
        </Card>
      </section>
    );
  }

  const rows = tab === "users" ? overview?.users ?? [] : tab === "reports" ? overview?.reports ?? [] : tab === "dataset" ? overview?.dataset ?? [] : [];
  const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row)))).slice(0, 6);

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Restricted Console</p>
          <h1 className="mt-2 font-heading text-4xl font-bold">Admin Dashboard</h1>
          <p className="mt-3 text-muted">Operational controls for users, reports, datasets, analytics, and system monitoring.</p>
        </div>
        <Button onClick={refresh} disabled={loading}><RefreshCw size={17} /> {loading ? "Refreshing..." : "Refresh"}</Button>
      </div>
      {error ? <p className="mt-4 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</p> : null}

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <metric.icon className={metric.color} />
            <p className="mt-4 text-sm text-muted">{metric.label}</p>
            <p className="mt-2 text-3xl font-bold text-primary">{metric.value}</p>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {[
          ["overview", "Overview", Activity],
          ["users", "Users", Users],
          ["reports", "Reports", FileText],
          ["dataset", "Dataset", Database],
          ["system", "System", Settings],
        ].map(([key, label, Icon]) => (
          <Button key={key as string} variant={tab === key ? "primary" : "secondary"} onClick={() => setTab(key as AdminTab)}>
            <Icon size={17} /> {label as string}
          </Button>
        ))}
      </div>

      {tab === "overview" ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <Card>
            <h2 className="font-heading text-xl font-bold">Access Policy</h2>
            <p className="mt-3 text-sm leading-6 text-muted">Admin access is limited to Samar Sinha and Yash Gupta accounts. Normal users can sign in, run scans, and generate reports without admin console access.</p>
          </Card>
          <Card>
            <h2 className="font-heading text-xl font-bold">Model Runtime</h2>
            <p className="mt-3 text-sm leading-6 text-muted">Keras model inference, heatmap output, highlighted regions, PDF/CSV exports, and analytics endpoints are connected.</p>
          </Card>
          <Card>
            <h2 className="font-heading text-xl font-bold">Admin Actions</h2>
            <div className="mt-4 grid gap-2 text-sm text-muted">
              <p>Review users and generated reports.</p>
              <p>Export admin datasets for audit.</p>
              <p>Monitor system status and dataset records.</p>
            </div>
          </Card>
        </div>
      ) : null}

      {tab === "system" ? (
        <Card className="mt-8">
          <h2 className="font-heading text-xl font-bold">System Settings</h2>
          <div className="mt-5 grid gap-3 text-sm text-muted md:grid-cols-2">
            <p>Backend status: Ready</p>
            <p>Contact route: Gmail API enabled</p>
            <p>Authentication: Password and Google OAuth</p>
            <p>Assistant: OpenAI when configured, local fallback otherwise</p>
          </div>
        </Card>
      ) : null}

      {rows.length ? (
        <Card className="mt-8 overflow-x-auto">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="font-heading text-xl font-bold">{tab[0].toUpperCase() + tab.slice(1)} Data</h2>
            <Button variant="secondary" onClick={() => exportRows(tab, rows)}><Download size={17} /> Export</Button>
          </div>
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-muted">
              <tr>{headers.map((header) => <th className="border-b border-border px-3 py-3" key={header}>{header}</th>)}</tr>
            </thead>
            <tbody>
              {rows.slice(0, 20).map((row, index) => (
                <tr key={index} className="border-b border-border/70">
                  {headers.map((header) => <td className="max-w-64 truncate px-3 py-3" key={header}>{value(row, header)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : tab !== "overview" && tab !== "system" ? (
        <Card className="mt-8"><p className="text-muted">No {tab} records available yet.</p></Card>
      ) : null}
    </section>
  );
}
