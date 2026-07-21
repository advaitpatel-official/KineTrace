import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { StickyNav } from "@/components/StickyNav";

export const Route = createFileRoute("/analyzer/")({
  component: AnalyzerDashboard,
});

type TelemetryFrame = {
  timestamp_ms: number; ax: number; ay: number; az: number;
  gx: number; gy: number; gz: number; magnitude: number;
};

type WindowMetric = {
  id: string; timestamp: string;
  activity: "Walking" | "Stairs Up" | "Stairs Down" | "Standing" | "Sitting";
  csi: number; ksi: number; jerk: number; variance: number; stabilityState: "Optimal" | "Degraded" | "Critical";
};

const factoryDataset: TelemetryFrame[] = (() => {
  const rows: TelemetryFrame[] = [];
  const phases = [
    { baseAx: 0.1, baseAy: 0.9, baseAz: -0.05, noise: 0.08, label: "sitting" },
    { baseAx: 0.05, baseAy: 0.98, baseAz: -0.02, noise: 0.06, label: "standing" },
    { baseAx: 0.4, baseAy: 1.2, baseAz: -0.1, noise: 0.25, label: "walking" },
    { baseAx: -0.3, baseAy: 0.7, baseAz: 0.2, noise: 0.35, label: "stairs_up" },
    { baseAx: 0.2, baseAy: 1.1, baseAz: -0.15, noise: 0.3, label: "stairs_down" },
  ];
  for (let phase = 0; phase < phases.length; phase++) {
    const p = phases[phase];
    for (let i = 0; i < 2100; i++) {
      const t = rows.length * 20;
      const spike = Math.random() < 0.02 ? (Math.random() - 0.5) * 0.6 : 0;
      const ax = p.baseAx + Math.sin(t / 150 + phase) * p.noise + spike + (Math.random() - 0.5) * p.noise * 0.3;
      const ay = p.baseAy + Math.cos(t / 200 + phase * 0.5) * (p.noise * 0.6) + (Math.random() - 0.5) * p.noise * 0.2;
      const az = p.baseAz + Math.sin(t / 250 + phase * 0.3) * (p.noise * 0.4) + (Math.random() - 0.5) * p.noise * 0.2;
      const gx = 0.01 + Math.cos(t / 100 + phase) * (p.noise * 0.5);
      const gy = -0.01 + Math.sin(t / 180 + phase * 0.7) * (p.noise * 0.3);
      const gz = 0.02 + Math.cos(t / 220 + phase * 0.4) * (p.noise * 0.2);
      const magnitude = Math.sqrt(ax * ax + ay * ay + az * az);
      rows.push({ timestamp_ms: t, ax, ay, az, gx, gy, gz, magnitude });
    }
  }
  return rows;
})();

function AnalyzerDashboard() {
  const [activeTab, setActiveTab] = useState<"stream" | "windows" | "analytics">("stream");
  const [rowLimit, setRowLimit] = useState<number>(50);
  const [noiseFloor, setNoiseFloor] = useState<number>(0.15);
  const [activeFilter, setActiveFilter] = useState("Butterworth lowpass");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const speedDropdownRef = useRef<HTMLDivElement>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [predictionResult, setPredictionResult] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [mlOnline, setMlOnline] = useState<boolean>(false);
  const [mlWaking, setMlWaking] = useState<boolean>(true);

  const [computedWindows, setComputedWindows] = useState<WindowMetric[]>([]);
  const [realCsi, setRealCsi] = useState<number>(0);
  const [realKsi, setRealKsi] = useState<number>(0);
  const [realPredictedActivity, setRealPredictedActivity] = useState<string>("");

  const [dismissedMlWarning, setDismissedMlWarning] = useState(false);
  const [mlWarningType, setMlWarningType] = useState<"waking" | "offline" | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isSpeedDropdownOpen, setIsSpeedDropdownOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const [waveformStart, setWaveformStart] = useState(0);
  const [waveformEnd, setWaveformEnd] = useState(50);
  const [waveformStartInput, setWaveformStartInput] = useState("0");
  const [waveformEndInput, setWaveformEndInput] = useState("50");

  const [showHistogram, setShowHistogram] = useState(false);
  const [showFrequencySpectrum, setShowFrequencySpectrum] = useState(false);

  const [telemetryPool, setTelemetryPool] = useState<TelemetryFrame[]>(factoryDataset);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState<number>(0);

  const [showFactoryResetModal, setShowFactoryResetModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [showMobileWarning, setShowMobileWarning] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const histogramCanvasRef = useRef<HTMLCanvasElement>(null);
  const spectrumCanvasRef = useRef<HTMLCanvasElement>(null);

  const filterOptions = [
    "Butterworth lowpass",
    "Chebyshev highpass",
    "Bessel bandpass",
    "Median filter",
    "Gaussian smooth",
    "Kalman filter",
    "Savitzky-Golay",
    "Wavelet denoise"
  ];
  const speedOptions = [0.25, 0.5, 1, 2, 4, 8];

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setShowMobileWarning(true);
    }
  }, []);

  // Close filter dropdown on click outside
  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isDropdownOpen]);

  // Close speed dropdown on click outside
  useEffect(() => {
    if (!isSpeedDropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (speedDropdownRef.current && !speedDropdownRef.current.contains(e.target as Node)) {
        setIsSpeedDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isSpeedDropdownOpen]);

  const maxAvailableRows = useMemo(() => Math.max(10, telemetryPool.length), [telemetryPool]);

  useEffect(() => {
    if (rowLimit > maxAvailableRows) setRowLimit(maxAvailableRows);
  }, [maxAvailableRows, rowLimit]);

  // ML status banner: show when waking (yellow) or offline (red), debounce hide to prevent flicker
  useEffect(() => {
    if (mlWaking) {
      setMlWarningType("waking");
      return;
    }
    if (!mlOnline) {
      setMlWarningType("offline");
      return;
    }
    const timer = setTimeout(() => setMlWarningType(null), 5000);
    return () => clearTimeout(timer);
  }, [mlWaking, mlOnline]);

  // Warm up the free-tier Render backend on page load + periodic health checks
  useEffect(() => {
    let cancelled = false;
    const wakeUp = async () => {
      setMlWaking(true);
      for (let attempt = 0; attempt < 12; attempt++) {
        if (cancelled) return;
        try {
          const res = await fetch("https://kinetrace.onrender.com/api/health", { signal: AbortSignal.timeout(8000) });
          if (res.ok) {
            const data = await res.json();
            if (!cancelled) {
              setMlOnline(data.status === "healthy");
              setMlWaking(false);
            }
            return;
          }
        } catch {
          // server still spinning up, wait and retry
        }
        // Wait 3s between retries (total ~36s max)
        await new Promise(r => setTimeout(r, 3000));
      }
      if (!cancelled) setMlWaking(false);
    };
    wakeUp();
    const interval = setInterval(async () => {
      if (cancelled) return;
      try {
        const res = await fetch("https://kinetrace.onrender.com/api/status", { signal: AbortSignal.timeout(5000) });
        if (res.ok) { const data = await res.json(); if (!cancelled) setMlOnline(data.online !== false); }
      } catch { if (!cancelled) setMlOnline(false); }
    }, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  const filterModifier = useMemo(() => {
    switch (activeFilter) {
      case "Chebyshev highpass": return { jerkMultiplier: 1.25, varianceShift: 0.08, label: "HP", description: "Emphasizes rapid movements, attenuates drift" };
      case "Bessel bandpass": return { jerkMultiplier: 0.85, varianceShift: -0.04, label: "BP", description: "Captures mid-range gait frequencies (0.5-3 Hz)" };
      case "Median filter": return { jerkMultiplier: 0.65, varianceShift: -0.12, label: "MED", description: "Removes impulse noise, preserves edges" };
      case "Gaussian smooth": return { jerkMultiplier: 0.5, varianceShift: -0.18, label: "GAUSS", description: "Softens high-frequency jitter" };
      case "Kalman filter": return { jerkMultiplier: 0.9, varianceShift: -0.05, label: "KALM", description: "Adaptive noise cancellation" };
      case "Savitzky-Golay": return { jerkMultiplier: 0.75, varianceShift: -0.08, label: "S-G", description: "Preserves signal shape while smoothing" };
      case "Wavelet denoise": return { jerkMultiplier: 0.55, varianceShift: -0.15, label: "WAV", description: "Multi-resolution threshold denoising" };
      default: return { jerkMultiplier: 1.0, varianceShift: 0.0, label: "LP", description: "Standard low-pass filtering" };
    }
  }, [activeFilter]);

  const processedData = useMemo(() => telemetryPool.filter(f => f.magnitude >= noiseFloor), [telemetryPool, noiseFloor]);

  const waveformData = useMemo(() => {
    if (processedData.length === 0) return [];
    const start = Math.max(0, Math.min(waveformStart, processedData.length - 1));
    const end = Math.max(start + 1, Math.min(waveformEnd, processedData.length));
    return processedData.slice(start, end);
  }, [processedData, waveformStart, waveformEnd]);

  useEffect(() => {
    if (processedData.length > 0) {
      const newEnd = Math.min(waveformEnd, processedData.length);
      setWaveformEnd(newEnd); setWaveformEndInput(String(newEnd));
      if (waveformStart >= newEnd) { setWaveformStart(Math.max(0, newEnd - 50)); setWaveformStartInput(String(Math.max(0, newEnd - 50))); }
    }
  }, [processedData.length]);

  useEffect(() => {
    if (processedData.length > 0) {
      setWaveformStart(0); setWaveformStartInput("0");
      setWaveformEnd(Math.min(50, processedData.length)); setWaveformEndInput(String(Math.min(50, processedData.length)));
    }
  }, [telemetryPool, noiseFloor]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowLimit;
    return processedData.slice(start, start + rowLimit);
  }, [processedData, currentPage, rowLimit]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(processedData.length / rowLimit)), [processedData, rowLimit]);

  useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages); }, [currentPage, totalPages]);
  useEffect(() => { if (selectedFrameIndex >= processedData.length && processedData.length > 0) setSelectedFrameIndex(processedData.length - 1); }, [processedData, selectedFrameIndex]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isPlaying && waveformData.length > 0) {
      const tickRate = 20 / playbackSpeed;
      interval = setInterval(() => {
        setSelectedFrameIndex((prev) => {
          if (prev >= waveformData.length - 1) { setIsPlaying(false); return prev; }
          return prev + 1;
        });
      }, tickRate);
    }
    return () => clearInterval(interval);
  }, [isPlaying, waveformData.length, playbackSpeed]);

  const currentFrame = useMemo(() => {
    return waveformData[selectedFrameIndex] || processedData[selectedFrameIndex] || { ax: 0, ay: 1, az: 0, gx: 0, gy: 0, gz: 0, magnitude: 1 };
  }, [waveformData, processedData, selectedFrameIndex]);

  const summaryStats = useMemo(() => {
    if (!processedData.length) return { avgCsi: 0, avgKsi: 0, maxJerk: 0, signalVariance: 0, peakAccel: 0, totalEnergy: 0, zeroCrossRate: 0, riskLevel: "Unknown" as string };

    const jerkValues = processedData.map((_, i) => { if (i === 0) return 0; return Math.abs(processedData[i].magnitude - processedData[i-1].magnitude) * 50; });
    const baseMaxJerk = Math.max(0.01, ...jerkValues);
    const varianceSum = processedData.reduce((acc, f) => acc + Math.abs(f.magnitude - 1), 0);
    const peakAccel = Math.max(...processedData.map(f => f.magnitude));
    const totalEnergy = processedData.reduce((acc, f) => acc + f.magnitude * f.magnitude, 0);

    let zeroCrossings = 0;
    for (let i = 1; i < processedData.length; i++) { if ((processedData[i-1].ax < 0 && processedData[i].ax >= 0) || (processedData[i-1].ax >= 0 && processedData[i].ax < 0)) zeroCrossings++; }
    const zeroCrossRate = zeroCrossings / processedData.length;

    const avgCsi = realCsi > 0 ? realCsi : 0;
    const avgKsi = realKsi > 0 ? realKsi : 0;
    const riskLevel = avgKsi <= 0 ? "Unknown" : avgKsi > 75 ? "Low" : avgKsi > 50 ? "Moderate" : avgKsi > 30 ? "Elevated" : "High";

    return {
      avgCsi: Math.round(avgCsi), avgKsi: Math.round(avgKsi),
      maxJerk: parseFloat((baseMaxJerk * filterModifier.jerkMultiplier).toFixed(2)),
      signalVariance: parseFloat((Math.max(0.01, (varianceSum / processedData.length) + filterModifier.varianceShift)).toFixed(3)),
      peakAccel: parseFloat(peakAccel.toFixed(2)), totalEnergy: parseFloat(totalEnergy.toFixed(2)),
      zeroCrossRate: parseFloat(zeroCrossRate.toFixed(3)), riskLevel
    };
  }, [processedData, filterModifier, realCsi, realKsi]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas || waveformData.length === 0) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const displayWidth = rect.width, displayHeight = rect.height;
    canvas.width = displayWidth * dpr; canvas.height = displayHeight * dpr;
    ctx.scale(dpr, dpr); ctx.clearRect(0, 0, displayWidth, displayHeight);
    ctx.strokeStyle = "rgba(150, 150, 150, 0.08)"; ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) { const y = (displayHeight / 4) * i; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(displayWidth, y); ctx.stroke(); }
    const minVal = -0.8, maxVal = 2.0;
    const drawLine = (accessor: (f: TelemetryFrame) => number, color: string, alpha = 1.0) => {
      ctx.beginPath(); ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.lineWidth = 1.2;
      for (let i = 0; i < waveformData.length; i++) {
        const x = (i / (waveformData.length - 1 || 1)) * displayWidth;
        const val = accessor(waveformData[i]);
        const normY = (val - minVal) / (maxVal - minVal);
        const y = displayHeight - normY * displayHeight;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke(); ctx.globalAlpha = 1.0;
    };
    drawLine((f) => f.ax, "#3b82f6"); drawLine((f) => f.ay, "#10b981"); drawLine((f) => f.az, "#ef4444"); drawLine((f) => f.magnitude, "#a855f7", 0.3);
    if (waveformData.length > 0) {
      const lineX = (selectedFrameIndex / (waveformData.length - 1 || 1)) * displayWidth;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)"; ctx.lineWidth = 1; ctx.setLineDash([2, 2]);
      ctx.beginPath(); ctx.moveTo(lineX, 0); ctx.lineTo(lineX, displayHeight); ctx.stroke(); ctx.setLineDash([]);
    }
  }, [waveformData, selectedFrameIndex]);

  useEffect(() => {
    if (!showHistogram) return;
    const canvas = histogramCanvasRef.current; if (!canvas || processedData.length === 0) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const width = rect.width, height = rect.height; ctx.clearRect(0, 0, width, height);
    const mags = processedData.map(f => f.magnitude);
    const bins = 20, min = Math.min(...mags), max = Math.max(...mags), binWidth = (max - min) / bins || 1;
    const hist = new Array(bins).fill(0);
    mags.forEach(m => { const idx = Math.min(bins - 1, Math.floor((m - min) / binWidth)); hist[idx]++; });
    const maxCount = Math.max(...hist, 1);
    ctx.fillStyle = "#3b82f6";
    hist.forEach((count, i) => { const barHeight = (count / maxCount) * height; const x = (i / bins) * width; const w = width / bins - 1; ctx.fillRect(x, height - barHeight, w, barHeight); });
  }, [showHistogram, processedData]);

  useEffect(() => {
    if (!showFrequencySpectrum) return;
    const canvas = spectrumCanvasRef.current; if (!canvas || processedData.length === 0) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const width = rect.width, height = rect.height; ctx.clearRect(0, 0, width, height);
    const data = processedData.slice(0, 256).map(f => f.magnitude); const n = data.length;
    const spectrum = new Float64Array(n);
    for (let k = 0; k < n; k++) { let real = 0, imag = 0; for (let t = 0; t < n; t++) { const angle = (2 * Math.PI * k * t) / n; real += data[t] * Math.cos(angle); imag -= data[t] * Math.sin(angle); } spectrum[k] = Math.sqrt(real * real + imag * imag) / n; }
    const maxAmp = Math.max(...spectrum.slice(1, n/2), 0.001);
    ctx.fillStyle = "#10b981";
    for (let i = 1; i < n / 2; i++) { const x = ((i - 1) / (n / 2 - 1)) * width; const barHeight = (spectrum[i] / maxAmp) * height; ctx.fillRect(x, height - barHeight, Math.max(1, width / (n / 2)), barHeight); }
  }, [showFrequencySpectrum, processedData]);

  const triggerFilePicker = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setIsProcessing(true);
    try {
      const text = await file.text();
      if (file.name.endsWith('.json')) { const parsed = JSON.parse(text); if (Array.isArray(parsed) && parsed.length > 0 && 'magnitude' in parsed[0]) { setTelemetryPool(prev => [...prev, ...parsed]); setIsProcessing(false); return; } }
      if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
        const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
        if (lines.length < 2) throw new Error("File contains no data rows.");
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const timeIdx = headers.findIndex(h => h.includes('time') || h.includes('ms') || h.includes('ts'));
        const axIdx = headers.indexOf('ax'), ayIdx = headers.indexOf('ay'), azIdx = headers.indexOf('az');
        const gxIdx = headers.indexOf('gx'), gyIdx = headers.indexOf('gy'), gzIdx = headers.indexOf('gz');
        const magIdx = headers.findIndex(h => h.includes('magnitude') || h.includes('mag'));
        const baseOffsetTime = telemetryPool.length > 0 ? telemetryPool[telemetryPool.length - 1].timestamp_ms : 0;
        const parsedFrames: TelemetryFrame[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(','); if (cols.length < 3) continue;
          const ax = axIdx !== -1 ? parseFloat(cols[axIdx]) || 0 : 0;
          const ay = ayIdx !== -1 ? parseFloat(cols[ayIdx]) || 0 : 0;
          const az = azIdx !== -1 ? parseFloat(cols[azIdx]) || 0 : 0;
          const gx = gxIdx !== -1 ? parseFloat(cols[gxIdx]) || 0 : 0;
          const gy = gyIdx !== -1 ? parseFloat(cols[gyIdx]) || 0 : 0;
          const gz = gzIdx !== -1 ? parseFloat(cols[gzIdx]) || 0 : 0;
          const timestamp_ms = timeIdx !== -1 ? parseInt(cols[timeIdx], 10) || (baseOffsetTime + i * 20) : (baseOffsetTime + i * 20);
          const magnitude = magIdx !== -1 && cols[magIdx] ? parseFloat(cols[magIdx]) || 0 : Math.sqrt(ax * ax + ay * ay + az * az);
          parsedFrames.push({ timestamp_ms, ax, ay, az, gx, gy, gz, magnitude });
        }
        if (parsedFrames.length === 0) throw new Error("No valid data rows found inside CSV log matrix.");
        setTelemetryPool(prev => [...prev, ...parsedFrames]);
        setIsProcessing(false); return;
      }
    } catch (err) { console.error("Kinetrace Parse Exception:", err); alert(`Failed to load telemetry file: ${err instanceof Error ? err.message : 'Unknown matrix structure'}`); }
    setIsProcessing(false);
  };

  const generateLocalWindows = useCallback((data: TelemetryFrame[], skipLabelOverride = false) => {
    const windowSize = 20, localWindows: WindowMetric[] = [];
    for (let i = 0; i < data.length && localWindows.length < 20; i += windowSize / 2) {
      const end = Math.min(i + windowSize, data.length);
      const windowData = data.slice(i, end); if (windowData.length < 5) continue;
      const mags = windowData.map(f => f.magnitude);
      const mean = mags.reduce((a, b) => a + b, 0) / mags.length;
      const std = Math.sqrt(mags.reduce((a, b) => a + (b - mean) ** 2, 0) / mags.length);
      let jerkSum = 0; for (let j = 1; j < mags.length; j++) jerkSum += Math.abs(mags[j] - mags[j-1]);
      const meanJerk = (jerkSum / (mags.length - 1)) * 50 * filterModifier.jerkMultiplier;
      const adjustedStd = std + filterModifier.varianceShift;
      const csi = Math.max(0, Math.min(100, Math.round(100 - (50 * meanJerk))));
      let zeroCross = 0; for (let j = 1; j < mags.length; j++) { if ((mags[j-1] < 1 && mags[j] >= 1) || (mags[j-1] >= 1 && mags[j] < 1)) zeroCross++; }
      const ksi = Math.max(0, Math.min(100, Math.round(100 - (50 * meanJerk + 20 * Math.max(0.01, adjustedStd)))));
      const state: WindowMetric["stabilityState"] = ksi > 75 ? "Optimal" : ksi > 40 ? "Degraded" : "Critical";
      let activity: WindowMetric["activity"];
      if (std < 0.03) activity = "Sitting"; else if (std < 0.06) activity = "Standing"; else if (std > 0.18) activity = "Stairs Up"; else if (std > 0.12) activity = "Stairs Down"; else activity = "Walking";
      localWindows.push({ id: `W-${(i + 1).toString().padStart(3, '0')}`, timestamp: `00:${((end * 20) / 1000).toFixed(2)}`, activity, csi, ksi, jerk: parseFloat(meanJerk.toFixed(3)), variance: parseFloat((std * std).toFixed(3)), stabilityState: state });
    }
    setComputedWindows(localWindows);
    if (localWindows.length > 0) { const avgCsi = Math.round(localWindows.reduce((a, w) => a + w.csi, 0) / localWindows.length); const avgKsi = Math.round(localWindows.reduce((a, w) => a + w.ksi, 0) / localWindows.length); if (!skipLabelOverride) { setRealCsi(avgCsi); setRealKsi(avgKsi); setPredictionResult(`CSI: ${avgCsi} | KSI: ${avgKsi} (computed locally)`); } }
  }, [filterModifier]);

  const uploadToMLEngine = useCallback(async (data: TelemetryFrame[]) => {
    if (data.length === 0) return;
    setIsAnalyzing(true); setApiError(null); setPredictionResult(null);
    try {
      // Use evenly spaced sample of data (respects the signal shape)
      const sample = data.length > 500
        ? data.filter((_, i) => i % Math.max(1, Math.floor(data.length / 500)) === 0).slice(0, 500)
        : data;
      // Only send raw sensor columns - don't include magnitude as it's not in the backend schema
      const headers = "timestamp_ms,ax,ay,az,gx,gy,gz";
      const rows = sample.map(obj => `${obj.timestamp_ms},${obj.ax.toFixed(6)},${obj.ay.toFixed(6)},${obj.az.toFixed(6)},${obj.gx.toFixed(6)},${obj.gy.toFixed(6)},${obj.gz.toFixed(6)}`).join("\n");
      const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv' });
      const formData = new FormData(); formData.append('file', blob, 'kinetrace_workspace_matrix.csv');
      const response = await fetch("https://kinetrace.onrender.com/api/ingest", { method: "POST", body: formData, signal: AbortSignal.timeout(25000) });
      if (!response.ok) { const errorData = await response.json().catch(() => ({})); throw new Error(errorData.detail || "ML Engine rejected the data."); }
      const result = await response.json();
      if (result.status === "success" && result.mean_kinetic_stability_index > 0) {
        const rawKsi = result.mean_kinetic_stability_index;
        setPredictionResult(`TUG: ${result.estimated_clinical_tug_score.toFixed(2)}s | KSI: ${rawKsi.toFixed(1)}`);
        setRealCsi(rawKsi); setRealKsi(Math.round(rawKsi));
        setRealPredictedActivity(result.predicted_activity || "");
        // Still compute windows locally for display
        generateLocalWindows(data, true);
      } else {
        // Backend returned 0 KSI (models not loaded) - fall back to local computation
        throw new Error("Backend KSI is 0, using local computation");
      }
    } catch (err) {
      console.error("ML Engine Error:", err);
      // Always fall back to local computation which uses all data (not downsampled)
      generateLocalWindows(data);
    }
    finally { setIsAnalyzing(false); }
  }, [generateLocalWindows]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (processedData.length > 0) { uploadToMLEngine(processedData); }
      else { setPredictionResult(null); setApiError(null); setIsAnalyzing(false); setComputedWindows([]); setRealCsi(0); setRealKsi(0); }
    }, 800);
    return () => clearTimeout(timeoutId);
  }, [processedData, uploadToMLEngine]);

  const exportCanvasAsImage = (canvasRef: React.RefObject<HTMLCanvasElement | null>, format: "png" | "svg") => {
    const canvas = canvasRef.current; if (!canvas) return;
    if (format === "png") { const link = document.createElement("a"); link.download = `kinetrace_waveform_${Date.now()}.png`; link.href = canvas.toDataURL("image/png"); link.click(); }
    else if (format === "svg") { const dataUrl = canvas.toDataURL("image/png"); const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvas.width} ${canvas.height}"><image href="${dataUrl}" width="${canvas.width}" height="${canvas.height}" /></svg>`; const blob = new Blob([svgContent], { type: "image/svg+xml" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.download = `kinetrace_waveform_${Date.now()}.svg`; link.href = url; link.click(); URL.revokeObjectURL(url); }
  };

  const downloadDataTemplate = () => {
    const header = "timestamp_ms,ax,ay,az,gx,gy,gz";
    const sampleRows = Array.from({ length: 10 }, (_, i) => { const t = i * 20; return `${t},${(0.1 + Math.random() * 0.1).toFixed(4)},${(0.9 + Math.random() * 0.1).toFixed(4)},${(-0.05 + Math.random() * 0.02).toFixed(4)},${(0.01 + Math.random() * 0.01).toFixed(4)},${(-0.01 + Math.random() * 0.01).toFixed(4)},${(0.02 + Math.random() * 0.01).toFixed(4)}`; });
    const csvContent = `${header}\n${sampleRows.join("\n")}`;
    const blob = new Blob([csvContent], { type: "text/csv" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.download = "kinetrace_data_template.csv"; link.href = url; link.click(); URL.revokeObjectURL(url);
  };

  const getKsiColor = (ksi: number) => { if (ksi > 75) return "oklch(0.6 0.18 145)"; if (ksi > 50) return "oklch(0.7 0.15 80)"; if (ksi > 30) return "oklch(0.65 0.18 50)"; return "oklch(0.6 0.22 27)"; };

  const getRiskBadge = (risk: string) => { switch (risk) { case "Low": return "bg-emerald-500/10 text-emerald-500"; case "Moderate": return "bg-yellow-500/10 text-yellow-500"; case "Elevated": return "bg-orange-500/10 text-orange-500"; case "High": return "bg-red-500/10 text-red-500"; default: return "bg-foreground/5 text-muted-foreground"; } };

  const exportAnalyticsReport = () => {
    const report = `KineTrace Analytics Report\nGenerated: ${new Date().toISOString()}\nFilter: ${activeFilter}\nTotal Frames: ${processedData.length}\nWindows Analyzed: ${computedWindows.length}\nCurrent Stability Index (CSI): ${summaryStats.avgCsi}\nPredictive Risk Index (KSI): ${summaryStats.avgKsi}\nRisk Level: ${summaryStats.riskLevel}\nPeak Jerk: ${summaryStats.maxJerk} m/s³\nSignal Variance: ${summaryStats.signalVariance}\nPeak Acceleration: ${summaryStats.peakAccel} g\nTotal Energy: ${summaryStats.totalEnergy}\nZero-Crossing Rate: ${summaryStats.zeroCrossRate}\nStability Assessment: ${summaryStats.avgKsi > 75 ? "Good" : summaryStats.avgKsi > 40 ? "Degraded" : "Critical"}\n`;
    const blob = new Blob([report], { type: "text/plain" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.download = `kinetrace_report_${Date.now()}.txt`; link.href = url; link.click(); URL.revokeObjectURL(url);
  };

  const handleFactoryReset = () => { setTelemetryPool(factoryDataset); setSelectedFrameIndex(0); setIsPlaying(false); setCurrentPage(1); setShowFactoryResetModal(false); };
  const handleClearData = () => { setTelemetryPool([]); setSelectedFrameIndex(0); setIsPlaying(false); setCurrentPage(1); setShowClearModal(false); };

  const ModalOverlay = ({ show, onClose, title, message, confirmLabel, onConfirm, isDestructive }: { show: boolean; onClose: () => void; title: string; message: string; confirmLabel: string; onConfirm: () => void; isDestructive?: boolean; }) => {
    if (!show) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", backgroundColor: "rgba(0,0,0,0.3)" }}>
        <div className="w-full max-w-sm rounded-2xl border border-hairline bg-background p-6 shadow-2xl animate-fade-up">
          <h3 className="font-display text-lg tracking-tight">{title}</h3>
          <p className="mt-2 text-sm text-foreground/70 leading-relaxed">{message}</p>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-full border border-hairline px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-foreground/70 hover:bg-foreground/5 transition-colors">Cancel</button>
            <button type="button" onClick={onConfirm} className={`rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-wider transition-colors ${isDestructive ? "bg-red-500 text-white hover:bg-red-600" : "bg-foreground text-background hover:bg-foreground/90"}`}>{confirmLabel}</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground antialiased selection:bg-foreground selection:text-background">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv,.txt,.json" className="hidden" />
      <ModalOverlay show={showFactoryResetModal} onClose={() => setShowFactoryResetModal(false)} title="Factory Reset" message="This will restore the factory dataset and discard all imported data. Current analysis results will be lost." confirmLabel="Reset" onConfirm={handleFactoryReset} />
      <ModalOverlay show={showClearModal} onClose={() => setShowClearModal(false)} title="Clear All Data" message="This will remove all telemetry data from the workspace, including imported files. This action cannot be undone." confirmLabel="Clear" onConfirm={handleClearData} isDestructive />
      {showMobileWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", backgroundColor: "rgba(0,0,0,0.3)" }}>
          <div className="w-full max-w-sm rounded-2xl border border-hairline bg-background p-6 shadow-2xl animate-fade-up">
            <h3 className="font-display text-lg tracking-tight">Desktop Recommended</h3>
            <p className="mt-2 text-sm text-foreground/70 leading-relaxed">The KineTrace Analyzer is optimized for desktop use. For the best experience with waveform visualization and data analysis, please open this page on a computer.</p>
            <div className="mt-6 flex justify-end">
              <button type="button" onClick={() => setShowMobileWarning(false)} className="rounded-full bg-foreground px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-background hover:bg-foreground/80 transition-colors">Continue Anyway</button>
            </div>
          </div>
        </div>
      )}

      {mlWarningType && !dismissedMlWarning && (
        <div className={`flex items-center gap-3 border-b px-4 py-2.5 font-mono text-[11px] backdrop-blur-md ${
          mlWarningType === "waking"
            ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300"
            : "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400"
        }`}>
          <i className={`bi ${
            mlWarningType === "waking" ? "bi-clock" : "bi-exclamation-triangle-fill"
          } shrink-0 text-sm`} aria-hidden />
          <span className="flex-1">
            {mlWarningType === "waking"
              ? "The ML engine is still waking up. Data will not be available for a few moments."
              : "The ML engine is currently offline. Results will be computed locally."}
          </span>
          <button
            type="button"
            onClick={() => setDismissedMlWarning(true)}
            aria-label="Dismiss warning"
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-foreground/10 ${
              mlWarningType === "waking"
                ? "text-yellow-600/60 hover:text-yellow-600 dark:text-yellow-300/60 dark:hover:text-yellow-300"
                : "text-red-500/60 hover:text-red-500 dark:text-red-400/60 dark:hover:text-red-400"
            }`}
          >
            <i className="bi bi-x text-sm" aria-hidden />
          </button>
        </div>
      )}

      <header className="flex items-center justify-between px-6 pt-8 md:px-12 md:pt-10">
        <Link to="/" className="inline-flex items-center gap-2 font-mono text-xs tracking-tight hover:underline"><i className="bi bi-arrow-left" /> kinetrace</Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-mono text-[9px] text-muted-foreground">
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${mlWaking ? "bg-yellow-500 animate-pulse" : mlOnline ? "bg-emerald-500" : "bg-red-500"}`} /><span>{mlWaking ? "Waking ML..." : mlOnline ? "ML Engine" : "ML Offline (local)"}</span>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Workspace</div>
        </div>
      </header>

      <StickyNav />

      <main className="mx-auto max-w-7xl px-6 pt-12 pb-24 md:px-12 md:pt-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-hairline pb-8">
          <div><div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">App</div><h1 className="mt-2 font-display text-4xl tracking-tight md:text-5xl">Telemetry Analyzer</h1></div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setShowFactoryResetModal(true)} className="rounded-full border border-hairline bg-background px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-foreground hover:bg-foreground hover:text-background transition-colors">Factory Reset</button>
            <button type="button" onClick={() => { const jsonStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(processedData, null, 2))}`; const dl = document.createElement("a"); dl.href = jsonStr; dl.download = `kinetrace_export.json`; dl.click(); }} disabled={processedData.length === 0} className="rounded-full border border-hairline bg-background px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-foreground hover:bg-foreground hover:text-background transition-colors disabled:opacity-40"><i className="bi bi-download mr-1" /> Export</button>
            <button type="button" onClick={() => setShowClearModal(true)} className="rounded-full border border-red-500/40 bg-background/50 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-red-500 hover:bg-red-500 hover:text-white transition-colors">Clear</button>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <section className="space-y-6 lg:col-span-5">
            <div className="rounded-2xl border border-hairline p-6 bg-background/30">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground block mb-4">Import</span>
              <div onClick={triggerFilePicker} className="group flex flex-col items-center justify-center rounded-xl border border-dashed border-hairline bg-background/20 px-4 py-10 text-center transition-colors hover:bg-foreground/1 cursor-pointer">
                {isProcessing ? (<div className="space-y-2"><div className="mx-auto h-4 w-4 animate-spin rounded-full border border-foreground border-t-transparent" /><span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Merging Data Packets...</span></div>) : (<><div className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-background"><i className="bi bi-plus-lg text-xs" /></div><h3 className="mt-3 font-display text-sm tracking-tight">Import sensor capture logs</h3><p className="text-[11px] text-muted-foreground mt-1">Supports raw CSV, TXT, or JSON exports</p></>)}
              </div>
            </div>
            <div className="rounded-2xl border border-hairline p-6 bg-background/30">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground block mb-4">Data Collection Tool</span>
              <div className="space-y-3">
                <p className="text-[11px] text-muted-foreground leading-relaxed">Use this template to collect sensor data. Match the column format exactly for successful ingestion.</p>
                <div className="flex gap-2">
                  <button type="button" onClick={downloadDataTemplate} className="flex-1 rounded-lg border border-hairline px-3 py-2 font-mono text-[10px] text-foreground hover:bg-foreground hover:text-background transition-colors"><i className="bi bi-filetype-csv mr-1" /> Download Template</button>
                  <button type="button" onClick={async () => { try { const res = await fetch("https://kinetrace.onrender.com/api/export/csv"); if (res.ok) { const blob = await res.blob(); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "kinetrace_sample_data.csv"; link.click(); URL.revokeObjectURL(url); } } catch { downloadDataTemplate(); } }} className="flex-1 rounded-lg border border-hairline px-3 py-2 font-mono text-[10px] text-foreground hover:bg-foreground hover:text-background transition-colors"><i className="bi bi-database mr-1" /> Get Sample</button>
                </div>
                <div className="bg-foreground/2 rounded-lg p-3 font-mono text-[9px] text-muted-foreground leading-relaxed"><div className="font-medium mb-1">Expected CSV format:</div><code className="block">timestamp_ms,ax,ay,az,gx,gy,gz</code><code className="block">0,0.120,0.940,-0.050,0.020,-0.010,0.040</code></div>
              </div>
            </div>
            <div className="rounded-2xl border border-hairline p-6 space-y-6 bg-background/30">
              <div><h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Pagination</h4>
                <div className="space-y-2 font-mono text-xs"><div className="flex justify-between text-[11px] text-muted-foreground"><span>Rows Per Page</span><span className="text-foreground font-medium">{rowLimit}</span></div>
                  <div className="relative pt-1"><input type="range" min="10" max="200" step="10" value={rowLimit} onChange={(e) => { setRowLimit(Number(e.target.value)); setCurrentPage(1); }} className="w-full h-1 bg-foreground/10 rounded-lg cursor-ew-resize appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-2 [&::-moz-range-thumb]:bg-foreground [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full" /></div>
                  <div className="text-[10px] text-muted-foreground flex justify-between"><span>Page {currentPage} of {totalPages}</span><span>{processedData.length} total rows</span></div>
                </div>
              </div>
              <div className="border-t border-hairline pt-4"><h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Filter</h4>
                <div className="space-y-2 font-mono text-xs"><div className="flex justify-between text-[11px] text-muted-foreground"><span>Acceleration Cutoff Threshold</span><span className="text-foreground font-medium">{noiseFloor.toFixed(2)} g</span></div>
                  <div className="relative pt-1"><input type="range" min="0.00" max="2.00" step="0.01" value={noiseFloor} onChange={(e) => { setNoiseFloor(parseFloat(e.target.value)); setCurrentPage(1); }} className="w-full h-1 bg-foreground/10 rounded-lg cursor-ew-resize appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-2 [&::-moz-range-thumb]:bg-foreground [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full" /></div>
                </div>
              </div>
              <div className="border-t border-hairline pt-4 relative" ref={dropdownRef}><h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Signal Processor</h4>
                <button type="button" onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full bg-background border border-hairline rounded-lg px-3 py-2 font-mono text-xs text-foreground flex justify-between items-center text-left transition-colors hover:bg-foreground/2"><span>{activeFilter}</span><i className={`bi bi-chevron-down text-[10px] transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} /></button>
                {isDropdownOpen && (<div className="mt-1 bg-background border border-hairline rounded-lg z-30 overflow-hidden shadow-none">{filterOptions.map((opt) => (<button key={opt} type="button" onClick={() => { setActiveFilter(opt); setIsDropdownOpen(false); }} className={`w-full text-left px-3 py-2 font-mono text-xs transition-colors hover:bg-foreground/4 block ${activeFilter === opt ? "bg-foreground/5 font-medium text-foreground" : "text-foreground/70"}`}>{opt}</button>))}</div>)}
                <div className="mt-2 text-[9px] font-mono text-muted-foreground italic">{filterModifier.description}</div>
              </div>
            </div>
            <div className="rounded-2xl border border-hairline p-6 bg-background/30">
              <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Visualization Panels</h4>
              <div className="space-y-2"><label className="flex items-center gap-3 font-mono text-xs cursor-pointer"><input type="checkbox" checked={showHistogram} onChange={(e) => setShowHistogram(e.target.checked)} className="w-3 h-3 appearance-none rounded border border-foreground/40 checked:bg-foreground checked:border-foreground transition-colors" /> Magnitude Histogram</label><label className="flex items-center gap-3 font-mono text-xs cursor-pointer"><input type="checkbox" checked={showFrequencySpectrum} onChange={(e) => setShowFrequencySpectrum(e.target.checked)} className="w-3 h-3 appearance-none rounded border border-foreground/40 checked:bg-foreground checked:border-foreground transition-colors" /> Frequency Spectrum</label></div>
            </div>
            <div className="rounded-2xl border border-hairline p-6 bg-background/30">
              <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Analytics Export</h4>
              <button type="button" onClick={exportAnalyticsReport} disabled={processedData.length === 0} className="w-full rounded-lg border border-hairline px-3 py-2 font-mono text-[10px] text-foreground hover:bg-foreground hover:text-background transition-colors disabled:opacity-40"><i className="bi bi-file-text mr-1" /> Export Report (.txt)</button>
            </div>
          </section>

          <section className="lg:col-span-7 space-y-6">
            {processedData.length === 0 ? (
              <div className="flex h-full min-h-112.5 flex-col items-center justify-center rounded-2xl border border-dashed border-hairline p-8 text-center bg-background/10"><i className="bi bi-database-exclamation text-xl text-muted-foreground mb-2" /><h3 className="font-display text-base">Workspace database is completely empty</h3><p className="mt-1 max-w-xs text-xs text-muted-foreground leading-relaxed">Upload metrics packets or hit Factory Baseline to populate tracking views.</p></div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="rounded-xl border border-hairline p-4 font-mono bg-background/10"><div className="text-[9px] text-muted-foreground uppercase tracking-wider">Current Stability{realCsi > 0 && <span className="ml-1 text-emerald-500">●</span>}</div><div className="mt-1 text-xl font-display">{summaryStats.avgCsi} CSI</div></div>
                  <div className="rounded-xl border border-hairline p-4 font-mono bg-background/10"><div className="text-[9px] text-muted-foreground uppercase tracking-wider">Predictive Risk</div><div className="mt-1 text-xl font-display">{summaryStats.avgKsi} KSI</div></div>
                  <div className="rounded-xl border border-hairline p-4 font-mono bg-background/10"><div className="text-[9px] text-muted-foreground uppercase tracking-wider">Risk Level</div><div className="mt-1"><span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium ${getRiskBadge(summaryStats.riskLevel)}`}>{summaryStats.riskLevel}</span></div></div>
                  <div className="rounded-xl border border-hairline p-4 font-mono bg-background/10"><div className="text-[9px] text-muted-foreground uppercase tracking-wider">Peak Jerk</div><div className="mt-1 text-xl font-display">{summaryStats.maxJerk} m/s³</div></div>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-hairline p-3 font-mono bg-background/5"><div className="text-[8px] text-muted-foreground uppercase tracking-wider">Active Slice</div><div className="mt-1 text-sm font-display">{paginatedData.length} / {processedData.length}</div></div>
                  <div className="rounded-xl border border-hairline p-3 font-mono bg-background/5"><div className="text-[8px] text-muted-foreground uppercase tracking-wider">Peak Accel</div><div className="mt-1 text-sm font-display">{summaryStats.peakAccel} g</div></div>
                  <div className="rounded-xl border border-hairline p-3 font-mono bg-background/5"><div className="text-[8px] text-muted-foreground uppercase tracking-wider">Filter</div><div className="mt-1 text-sm font-display">{filterModifier.label}</div></div>
                </div>

                <div className="rounded-xl border border-hairline p-4 bg-background/30">
                  <div className="mb-3 flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-muted-foreground"><span>Live Waveform</span><div className="flex items-center gap-3"><button type="button" onClick={() => exportCanvasAsImage(canvasRef, "png")} disabled={paginatedData.length === 0} className="text-[9px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 disabled:opacity-40"><i className="bi bi-download" /> Export</button><span className="text-blue-500">■ ax</span><span className="text-emerald-500">■ ay</span><span className="text-red-500">■ az</span><span className="text-purple-500">■ |a|</span></div></div>
                  <div className="mb-3 flex items-center gap-2 font-mono text-[9px]">
                    <span className="text-muted-foreground">Range:</span>
                    <input type="number" min="0" max={Math.max(0, processedData.length - 1)} value={waveformStartInput} onChange={(e) => { const v = Math.max(0, Math.min(Number(e.target.value) || 0, processedData.length - 1)); setWaveformStartInput(String(v)); }} onBlur={() => { const v = Math.max(0, Math.min(Number(waveformStartInput) || 0, processedData.length - 1)); setWaveformStart(v); setWaveformStartInput(String(v)); }} onKeyDown={(e) => { if (e.key === "Enter") { const v = Math.max(0, Math.min(Number(waveformStartInput) || 0, processedData.length - 1)); setWaveformStart(v); setWaveformStartInput(String(v)); (e.target as HTMLInputElement).blur(); } }} className="w-16 px-1 py-0.5 rounded border border-hairline bg-background text-foreground text-[9px] text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                    <span className="text-muted-foreground">—</span>
                    <input type="number" min="1" max={processedData.length} value={waveformEndInput} onChange={(e) => { const v = Math.max(1, Math.min(Number(e.target.value) || 1, processedData.length)); setWaveformEndInput(String(v)); }} onBlur={() => { const v = Math.max(waveformStart + 1, Math.min(Number(waveformEndInput) || 1, processedData.length)); setWaveformEnd(v); setWaveformEndInput(String(v)); }} onKeyDown={(e) => { if (e.key === "Enter") { const v = Math.max(waveformStart + 1, Math.min(Number(waveformEndInput) || 1, processedData.length)); setWaveformEnd(v); setWaveformEndInput(String(v)); (e.target as HTMLInputElement).blur(); } }} className="w-16 px-1 py-0.5 rounded border border-hairline bg-background text-foreground text-[9px] text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                    <span className="text-muted-foreground">of {processedData.length}</span>
                    <button type="button" onClick={() => { setWaveformStart(0); setWaveformStartInput("0"); setWaveformEnd(Math.min(50, processedData.length)); setWaveformEndInput(String(Math.min(50, processedData.length))); }} className="ml-auto px-2 py-0.5 rounded border border-hairline text-foreground/70 hover:bg-foreground/5 transition-colors text-[9px]">Reset</button>
                  </div>
                  <div className="relative h-36 w-full bg-foreground/0.5 rounded-lg border border-hairline overflow-hidden"><canvas ref={canvasRef} className="absolute inset-0 h-full w-full" /></div>
                  <div className="mt-4 flex items-center gap-3 font-mono text-xs">
                    <button type="button" onClick={() => { if (selectedFrameIndex >= waveformData.length - 1) setSelectedFrameIndex(0); setIsPlaying(!isPlaying); }} className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background transition-colors hover:bg-foreground/80 active:bg-foreground/70"><i className={`bi ${isPlaying ? "bi-pause-fill" : "bi-play-fill"} text-lg leading-none`} /></button>
                    <button type="button" onClick={() => { setSelectedFrameIndex(0); setIsPlaying(false); }} className="flex h-8 w-8 items-center justify-center rounded-full border border-hairline bg-background transition-colors hover:bg-foreground/8"><i className="bi bi-skip-backward-fill text-muted-foreground leading-none" /></button>
                    <div className="relative" ref={speedDropdownRef}>
                      <button type="button" onClick={() => setIsSpeedDropdownOpen(!isSpeedDropdownOpen)} className="flex h-8 w-16 items-center justify-between rounded-md border border-hairline bg-background px-2 text-[10px] text-muted-foreground outline-none cursor-pointer transition-colors hover:bg-foreground/2"><span>{playbackSpeed.toFixed(2)}x</span><i className={`bi bi-chevron-down text-[8px] transition-transform duration-200 ${isSpeedDropdownOpen ? "rotate-180" : ""}`} /></button>
                      {isSpeedDropdownOpen && (<div className="absolute bottom-full left-0 mb-1 w-16 bg-background border border-hairline rounded-lg z-30 overflow-hidden shadow-none">{speedOptions.map((opt) => (<button key={opt} type="button" onClick={() => { setPlaybackSpeed(opt); setIsSpeedDropdownOpen(false); }} className={`w-full text-left px-2 py-1.5 font-mono text-[10px] transition-colors hover:bg-foreground/4 block ${playbackSpeed === opt ? "bg-foreground/5 font-medium text-foreground" : "text-foreground/70"}`}>{opt.toFixed(2)}x</button>))}</div>)}
                    </div>
                    <div className="relative flex-1 pt-1 ml-2"><input type="range" min="0" max={waveformData.length - 1} step="1" value={selectedFrameIndex} onChange={(e) => { setIsPlaying(false); setSelectedFrameIndex(Number(e.target.value)); }} className="w-full h-1 bg-foreground/10 rounded-lg cursor-ew-resize appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-2 [&::-moz-range-thumb]:bg-foreground [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full" /></div>
                    <div className="w-16 text-right text-[10px] text-muted-foreground">{selectedFrameIndex + 1} / {waveformData.length}</div>
                  </div>
                </div>

                <div className="rounded-xl border border-hairline p-4 bg-background/30 font-mono space-y-4">
                  <div className="flex items-center justify-between"><h4 className="text-[10px] uppercase tracking-wider text-muted-foreground">Stability Gauges</h4>{realPredictedActivity && <span className="text-[10px] px-2 py-0.5 rounded-full bg-foreground/5 border border-hairline">{realPredictedActivity}</span>}</div>
                  <div><div className="flex items-center justify-between text-[9px] text-muted-foreground mb-1"><span>Current Stability Index (CSI)</span><span className="text-foreground/80 font-medium">{summaryStats.avgCsi}</span></div><div className="h-2 w-full overflow-hidden rounded-full bg-foreground/10"><div className="h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${Math.min(100, Math.max(0, summaryStats.avgCsi))}%`, background: getKsiColor(summaryStats.avgCsi) }} /></div><div className="mt-0.5 flex justify-between text-[8px] text-muted-foreground"><span>Unstable</span><span>Stable</span></div></div>
                  <div><div className="flex items-center justify-between text-[9px] text-muted-foreground mb-1"><span>Predictive Risk Index (KSI)</span><span className="text-foreground/80 font-medium">{summaryStats.avgKsi}</span></div><div className="h-2 w-full overflow-hidden rounded-full bg-foreground/10"><div className="h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${Math.min(100, Math.max(0, summaryStats.avgKsi))}%`, background: getKsiColor(summaryStats.avgKsi) }} /></div><div className="mt-0.5 flex justify-between text-[8px] text-muted-foreground"><span>High Risk</span><span>Low Risk</span></div></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 rounded-xl border border-hairline p-4 bg-background/30 font-mono">
                  <div className="md:col-span-4 flex flex-col justify-between space-y-2"><div><h4 className="text-[10px] uppercase tracking-wider text-muted-foreground">3D Orientation Mesh</h4><p className="text-[11px] text-muted-foreground mt-1 leading-normal">Real-time orientation cube driven by current frame's pitch and roll.</p></div>
                    <div className="space-y-1 text-[11px] pt-4 md:pt-0"><div className="flex justify-between border-b border-hairline/50 pb-0.5"><span className="text-muted-foreground">Pitch (ax):</span><span className="text-blue-500 font-medium">{(currentFrame.ax * 45).toFixed(1)}°</span></div><div className="flex justify-between border-b border-hairline/50 pb-0.5"><span className="text-muted-foreground">Roll (az):</span><span className="text-red-500 font-medium">{(currentFrame.az * 45).toFixed(1)}°</span></div><div className="flex justify-between"><span className="text-muted-foreground">Scale:</span><span className="text-emerald-500 font-medium">{currentFrame.magnitude.toFixed(2)}x</span></div></div>
                  </div>
                  <div className="md:col-span-8 h-48 bg-foreground/1 border border-hairline rounded-lg flex items-center justify-center overflow-hidden perspective-500 relative">
                    <div className="absolute inset-0 border-b border-hairline/20 top-1/2 pointer-events-none" /><div className="absolute inset-0 border-l border-hairline/20 left-1/2 pointer-events-none" />
                    <div className="relative w-24 h-24" style={{ perspective: "500px" }}>
                      <div className="absolute inset-0 border-2 border-foreground/20 rounded-full" style={{ transform: `rotateX(${currentFrame.ax * 30}deg) rotateZ(${currentFrame.az * 30}deg)`, transformStyle: "preserve-3d" }} />
                      <div className="absolute inset-2 border-2 border-foreground rounded-md flex items-center justify-center transition-transform duration-75 ease-out shadow-sm bg-foreground/3" style={{ transform: `rotateX(${currentFrame.ax * 45}deg) rotateZ(${currentFrame.az * 45}deg) scale(${Math.max(0.6, Math.min(currentFrame.magnitude, 1.4))})`, transformStyle: "preserve-3d" }}><div className="w-3 h-3 bg-blue-500 rounded-full" style={{ transform: "translateZ(25px)" }} /><div className="w-1 h-10 bg-emerald-500 absolute" style={{ transform: "rotateY(90deg)" }} /><div className="w-10 h-1 bg-red-500 absolute" style={{ transform: "rotateX(90deg)" }} /></div>
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1 h-3 bg-foreground/30 rounded-full" style={{ transform: `rotate(${currentFrame.gx * 100}deg)`, transformOrigin: "top center" }} />
                    </div>
                    <div className="absolute bottom-2 left-3 text-[8px] font-mono text-foreground/40"><i className="bi bi-arrow-right" /> X</div><div className="absolute top-2 right-3 text-[8px] font-mono text-foreground/40">Y <i className="bi bi-arrow-up" /></div><div className="absolute top-2 left-3 text-[8px] font-mono text-foreground/40">Z <i className="bi bi-arrow-up-right" /></div>
                  </div>
                </div>

                {showHistogram && (<div className="rounded-xl border border-hairline p-4 bg-background/30 font-mono"><div className="flex items-center justify-between mb-2"><h4 className="text-[10px] uppercase tracking-wider text-muted-foreground">Magnitude Histogram</h4><button type="button" onClick={() => exportCanvasAsImage(histogramCanvasRef, "png")} className="text-[9px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"><i className="bi bi-download" /> Export</button></div><div className="relative h-28 w-full bg-foreground/0.5 rounded-lg border border-hairline overflow-hidden"><canvas ref={histogramCanvasRef} className="absolute inset-0 h-full w-full" /></div></div>)}
                {showFrequencySpectrum && (<div className="rounded-xl border border-hairline p-4 bg-background/30 font-mono"><div className="flex items-center justify-between mb-2"><h4 className="text-[10px] uppercase tracking-wider text-muted-foreground">Frequency Spectrum (FFT)</h4><button type="button" onClick={() => exportCanvasAsImage(spectrumCanvasRef, "png")} className="text-[9px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"><i className="bi bi-download" /> Export</button></div><div className="relative h-28 w-full bg-foreground/0.5 rounded-lg border border-hairline overflow-hidden"><canvas ref={spectrumCanvasRef} className="absolute inset-0 h-full w-full" /></div></div>)}

                <div className="flex items-center justify-between font-mono text-[10px]">
                  <div className="flex gap-1">
                    <button type="button" onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="flex items-center justify-center w-6 h-6 rounded border border-hairline hover:bg-foreground/5 disabled:opacity-30 transition-colors"><i className="bi bi-chevron-double-left text-[10px]" /></button>
                    <button type="button" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="flex items-center justify-center w-6 h-6 rounded border border-hairline hover:bg-foreground/5 disabled:opacity-30 transition-colors"><i className="bi bi-chevron-left text-[10px]" /></button>
                    <span className="px-2 py-1 text-muted-foreground">Page {currentPage} / {totalPages}</span>
                    <button type="button" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="flex items-center justify-center w-6 h-6 rounded border border-hairline hover:bg-foreground/5 disabled:opacity-30 transition-colors"><i className="bi bi-chevron-right text-[10px]" /></button>
                    <button type="button" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="flex items-center justify-center w-6 h-6 rounded border border-hairline hover:bg-foreground/5 disabled:opacity-30 transition-colors"><i className="bi bi-chevron-double-right text-[10px]" /></button>
                  </div>
                  <span className="text-muted-foreground">{processedData.length} total frames</span>
                </div>

                <div className="border-b border-hairline flex gap-6 font-mono text-xs overflow-x-auto hide-scrollbar">
                  <button type="button" onClick={() => setActiveTab("stream")} className={`pb-2 shrink-0 transition-colors ${activeTab === "stream" ? "text-foreground border-b border-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}>Log</button>
                  <button type="button" onClick={() => setActiveTab("windows")} className={`pb-2 shrink-0 transition-colors ${activeTab === "windows" ? "text-foreground border-b border-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}>Analytics</button>
                  <button type="button" onClick={() => setActiveTab("analytics")} className={`pb-2 shrink-0 transition-colors ${activeTab === "analytics" ? "text-foreground border-b border-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}>Summary</button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-hairline bg-background/20">
                  {activeTab === "stream" && (
                    <table className="w-full text-left font-mono text-[11px] tabular-nums">
                      <thead><tr className="border-b border-hairline bg-foreground/1 text-muted-foreground uppercase text-[9px]"><th className="px-4 py-2 w-8">#</th><th className="px-4 py-2">Time (ms)</th><th className="px-4 py-2">ax (g)</th><th className="px-4 py-2">ay (g)</th><th className="px-4 py-2">az (g)</th><th className="px-4 py-2">|accel| (g)</th></tr></thead>
                      <tbody className="divide-y divide-hairline">{paginatedData.map((frame, idx) => (<tr key={idx} onClick={() => { setIsPlaying(false); setSelectedFrameIndex(idx); }} className={`cursor-pointer transition-colors ${selectedFrameIndex === idx ? "bg-foreground/4" : "hover:bg-foreground/1"}`}><td className="px-4 py-2 text-center"><span className={`inline-flex items-center justify-center w-3 h-3 rounded-full ${selectedFrameIndex === idx ? "bg-foreground" : "border border-muted-foreground/40"}`} /></td><td className="px-4 py-2">{frame.timestamp_ms}</td><td className="px-4 py-2 text-blue-500">{frame.ax.toFixed(3)}</td><td className="px-4 py-2 text-emerald-500">{frame.ay.toFixed(3)}</td><td className="px-4 py-2 text-red-500">{frame.az.toFixed(3)}</td><td className="px-4 py-2">{frame.magnitude.toFixed(3)}</td></tr>))}</tbody>
                    </table>
                  )}
                  {activeTab === "windows" && (
                    <div>
                      {computedWindows.length === 0 ? (<div className="p-8 text-center text-xs text-muted-foreground font-mono">{isAnalyzing ? "Computing window metrics..." : "No window data available."}</div>) : (
                        <table className="w-full text-left font-mono text-[11px] tabular-nums">
                          <thead><tr className="border-b border-hairline bg-foreground/1 text-muted-foreground uppercase text-[9px]"><th className="px-4 py-2">Window</th><th className="px-4 py-2">Time</th><th className="px-4 py-2">Activity</th><th className="px-4 py-2">CSI</th><th className="px-4 py-2">KSI</th><th className="px-4 py-2">Jerk</th><th className="px-4 py-2">Variance</th><th className="px-4 py-2">State</th></tr></thead>
                          <tbody className="divide-y divide-hairline">{computedWindows.map((w) => (<tr key={w.id} className="hover:bg-foreground/1"><td className="px-4 py-2 text-muted-foreground">{w.id}</td><td className="px-4 py-2">{w.timestamp}</td><td className="px-4 py-2">{w.activity}</td><td className="px-4 py-2 font-medium">{w.csi}</td><td className="px-4 py-2">{w.ksi}</td><td className="px-4 py-2">{w.jerk.toFixed(3)}</td><td className="px-4 py-2">{w.variance.toFixed(3)}</td><td className="px-4 py-2"><span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-medium ${w.stabilityState === "Optimal" ? "bg-emerald-500/10 text-emerald-500" : w.stabilityState === "Degraded" ? "bg-yellow-500/10 text-yellow-500" : "bg-red-500/10 text-red-500"}`}>{w.stabilityState}</span></td></tr>))}</tbody>
                        </table>
                      )}
                    </div>
                  )}
                  {activeTab === "analytics" && (
                    <div className="p-6 space-y-4">
                      {computedWindows.length > 0 ? (
                        <>
                          {  }
                          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                            <div className="rounded-lg border border-hairline p-3 font-mono"><div className="text-[9px] text-muted-foreground uppercase tracking-wider">Average CSI</div><div className="mt-1 text-lg font-display">{Math.round(computedWindows.reduce((a, w) => a + w.csi, 0) / computedWindows.length)}</div></div>
                            <div className="rounded-lg border border-hairline p-3 font-mono"><div className="text-[9px] text-muted-foreground uppercase tracking-wider">Average KSI</div><div className="mt-1 text-lg font-display">{Math.round(computedWindows.reduce((a, w) => a + w.ksi, 0) / computedWindows.length)}</div></div>
                            <div className="rounded-lg border border-hairline p-3 font-mono"><div className="text-[9px] text-muted-foreground uppercase tracking-wider">Top Activity</div><div className="mt-1 text-lg font-display">{computedWindows.length > 0 ? computedWindows.sort((a, b) => computedWindows.filter(w => w.activity === b.activity).length - computedWindows.filter(w => w.activity === a.activity).length)[0]?.activity || "N/A" : "N/A"}</div></div>
                          </div>
                          {  }
                          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                            <div className="rounded-lg border border-hairline p-3 font-mono"><div className="text-[9px] text-muted-foreground uppercase tracking-wider">Windows</div><div className="mt-1 text-lg font-display">{computedWindows.length}</div></div>
                            <div className="rounded-lg border border-hairline p-3 font-mono"><div className="text-[9px] text-muted-foreground uppercase tracking-wider">Total Energy</div><div className="mt-1 text-lg font-display">{summaryStats.totalEnergy}</div></div>
                            <div className="rounded-lg border border-hairline p-3 font-mono"><div className="text-[9px] text-muted-foreground uppercase tracking-wider">Peak Jerk</div><div className="mt-1 text-lg font-display">{summaryStats.maxJerk} m/s³</div></div>
                          </div>
                          {  }
                          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                            <div className="rounded-lg border border-hairline p-3 font-mono"><div className="text-[9px] text-muted-foreground uppercase tracking-wider">Optimal</div><div className="mt-1 text-lg font-display text-emerald-500">{computedWindows.filter(w => w.stabilityState === "Optimal").length}</div></div>
                            <div className="rounded-lg border border-hairline p-3 font-mono"><div className="text-[9px] text-muted-foreground uppercase tracking-wider">Degraded</div><div className="mt-1 text-lg font-display text-yellow-500">{computedWindows.filter(w => w.stabilityState === "Degraded").length}</div></div>
                            <div className="rounded-lg border border-hairline p-3 font-mono"><div className="text-[9px] text-muted-foreground uppercase tracking-wider">Critical</div><div className="mt-1 text-lg font-display text-red-500">{computedWindows.filter(w => w.stabilityState === "Critical").length}</div></div>
                          </div>
                          <div className="mt-4 bg-foreground/2 rounded-lg p-3 font-mono text-[10px] text-muted-foreground leading-relaxed">
                            <p className="font-medium text-foreground">Summary</p>
                            <p className="mt-1">Analysis of {computedWindows.length} windows across {processedData.length} frames ({processedData.length * 20 / 1000}s of data at 50Hz). Current Stability (CSI): {summaryStats.avgCsi}. Predictive Risk (KSI): {summaryStats.avgKsi} — {summaryStats.riskLevel} risk.{realPredictedActivity && ` Predominant activity: ${realPredictedActivity}.`} Signal processed with <strong>{activeFilter}</strong> filter.</p>
                          </div>
                        </>
                      ) : (<div className="p-8 text-center text-xs text-muted-foreground font-mono">Summary view — load telemetry data to see analytics breakdown.</div>)}
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}