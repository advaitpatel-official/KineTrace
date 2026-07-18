import React, { useState, useRef } from "react";

interface IngestResponse {
  status: string;
  mean_kinetic_stability_index: number;
  estimated_clinical_tug_score: number;
  windows_processed: number;
  activity_timeline: number[];
}

export default function KinetraceTool() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<IngestResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith(".csv")) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError("Invalid file format. Please drop a valid telemetry .csv log file.");
      }
    }
  };

  const executeAnalysis = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setData(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/api/ingest", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errPayload = await response.json();
        throw new Error(errPayload.detail || "Engine execution failed.");
      }

      const result = (await response.json()) as IngestResponse;
      setData(result);
    } catch (err: any) {
      setError(err.message || "Network isolation error. Is Python Engine online?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-all cursor-pointer ${
          file
            ? "border-foreground bg-muted/30"
            : "border-border hover:border-foreground/50 bg-card"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) setFile(e.target.files[0]);
          }}
        />

        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground group-hover:text-foreground transition-colors">
          {file ? "File Loaded Successfully" : "Drop Telemetry Matrix"}
        </div>
        <div className="mt-2 text-lg font-medium">
          {file ? file.name : "Select raw telemetry log (.csv)"}
        </div>
      </div>

      {file && (
        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={() => setFile(null)}
            className="rounded-full border border-border px-5 py-2 font-mono text-[11px] uppercase tracking-[0.15em] transition-colors"
            disabled={loading}
          >
            Clear
          </button>
          <button
            onClick={executeAnalysis}
            disabled={loading}
            className="rounded-full bg-foreground text-background px-6 py-2 font-mono text-[11px] uppercase tracking-[0.15em] transition-all hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Compute Metrics"}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive font-mono text-left">
          ⚠️ {error}
        </div>
      )}

      {data && (
        <div className="mt-8 grid gap-4 md:grid-cols-2 text-left">
          <div className="glass rounded-2xl p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Kinetic Stability Index
            </div>
            <div className="mt-2 text-4xl font-medium tracking-tight tabular-nums">
              {data.mean_kinetic_stability_index?.toFixed(4) || "0.0000"}
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Estimated Clinical TUG Score
            </div>
            <div className="mt-2 text-4xl font-medium tracking-tight text-primary tabular-nums">
              {data.estimated_clinical_tug_score?.toFixed(2) || "0.00"}s
            </div>
          </div>
        </div>
      )}
    </div>
  );
}