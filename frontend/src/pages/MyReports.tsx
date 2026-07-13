import { useState } from "react";
import { Download, FileDown } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { getLocalReports } from "../utils/localReports";
import { exportDiagnosticCsv, exportDiagnosticPdf, exportReportMetadataCsv, exportReportMetadataPdf } from "../utils/reportExport";
import { useAppStore } from "../store/useAppStore";
import { translate } from "../data/translations";

export function MyReports() {
  const reports = getLocalReports();
  const [formats, setFormats] = useState<Record<string, "pdf" | "csv">>({});
  const language = useAppStore((state) => state.language);
  const t = (key: string) => translate(language, key);

  function redownload(report: (typeof reports)[number]) {
    const format = formats[report.id] ?? (report.format === "csv" ? "csv" : "pdf");
    if (report.result) {
      if (format === "pdf") exportDiagnosticPdf(report.result, report.crop_facts ?? []);
      else exportDiagnosticCsv(report.result, report.crop_facts ?? []);
      return;
    }
    if (format === "pdf") exportReportMetadataPdf(report);
    else exportReportMetadataCsv(report);
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
      <h1 className="font-heading text-4xl font-bold">{t("myReports")}</h1>
      <div className="mt-8 grid gap-5">
        {reports.length ? reports.map((report) => (
          <Card key={report.id} className="grid gap-4 md:grid-cols-[1fr_auto]">
            <div>
              <h2 className="font-heading text-2xl font-bold">{report.crop_name} - {report.disease_name}</h2>
              <p className="mt-2 text-sm text-muted">{language === "hi" ? "रिपोर्ट ID:" : "Report ID:"} {report.report_id}</p>
              <p className="mt-1 text-sm text-muted">{new Date(report.downloaded_at).toLocaleString()}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">{report.format.toUpperCase()}</span>
              <span className="rounded-full border border-border px-4 py-2 text-sm text-muted">{report.status}</span>
              <select
                className="rounded-full border border-border bg-card px-4 py-2 text-sm outline-none focus:border-primary"
                value={formats[report.id] ?? (report.format === "csv" ? "csv" : "pdf")}
                onChange={(event) => setFormats((current) => ({ ...current, [report.id]: event.target.value as "pdf" | "csv" }))}
              >
                <option value="pdf">PDF</option>
                <option value="csv">CSV</option>
              </select>
              <Button variant="secondary" onClick={() => redownload(report)}>
                {(formats[report.id] ?? report.format) === "csv" ? <FileDown size={17} /> : <Download size={17} />}
                {language === "hi" ? "फिर से डाउनलोड" : "Re-download"}
              </Button>
            </div>
          </Card>
        )) : <Card><p className="text-muted">{language === "hi" ? "अभी कोई report डाउनलोड नहीं हुई है। यहाँ देखने के लिए diagnostic result से PDF या CSV डाउनलोड करें।" : "No reports downloaded yet. Download a PDF or CSV from a diagnostic result to see it here."}</p></Card>}
      </div>
    </section>
  );
}
