import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { StickyNav } from "@/components/StickyNav";
import { useIsMobile } from "@/hooks/use-mobile";

export const Route = createFileRoute("/documentation")({
  component: Documentation,
});

type DocPage = {
  id: string; title: string; eyebrow: string; summary: string; icon: string;
  body: Array<{ heading: string; copy: string[]; codeBlock?: string }>;
};

type DocGroup = { id: string; title: string; icon: string; pages: DocPage[]; };

const homePage: DocPage = {
  id: "docs-home",
  title: "KineTrace Analyzer Documentation",
  eyebrow: "Getting Started",
  summary: "Complete user guide for the KineTrace Telemetry Analyzer — import data, apply signal processors, interpret the KineTrace Stability Index (KSI), and export results.",
  icon: "bi-shield-check",
  body: [
    {
      heading: "What is KineTrace?",
      copy: [
        "KineTrace is a research-grade movement stability analyzer that transforms raw tri-axial accelerometer and gyroscope data from wearable sensors into clinically interpretable stability metrics.",
        "The analyzer processes CSV, TXT, or JSON files containing timestamped acceleration (ax, ay, az) and gyroscope (gx, gy, gz) data sampled at 50 Hz. Data is automatically segmented into analysis windows, and each window receives a KineTrace Stability Index (KSI) score from 0 (chaotic/unstable) to 100 (fluid/stable).",
        "The project is built on blended UCI HAR and MotionSense corpora, providing a robust foundation for cross-device movement analysis.",
      ],
    },
    {
      heading: "The Core Mission: Detecting Instability Before It Becomes Visible",
      copy: [
        "Traditional fall risk assessments rely on what clinicians can see with their own eyes — a patient swaying, shuffling their feet, or struggling to stand up from a chair. But by the time these signs are visible, the risk is already advanced.",
        "KineTrace is built on a different premise: instability leaves a signature in your movement data long before it becomes clinically observable. Tiny micro-adjustments, subtle asymmetries in your gait, barely-perceptible hesitations — these are the early warning signals that KineTrace's algorithms are designed to detect.",
        "Think of it like a weather radar for movement health. Just as a meteorologist can see a storm forming on radar before you feel the first drop of rain, KineTrace can detect the 'storm' of instability forming in your movement patterns before a fall or injury occurs. The KineTrace Stability Index (KSI) is that radar reading — a single number that tells you how stable or unstable your movement is right now, and more importantly, where it's heading.",
      ],
    },
    {
      heading: "How the Algorithm Works (Made Simple)",
      copy: [
        "At its heart, KineTrace measures two things from your movement data:",
        "1. Jerk — How abruptly your body is moving or changing direction. Imagine the difference between a ballet dancer gliding across the stage (low jerk, smooth movement) versus someone stumbling over uneven ground (high jerk, jerky movement). Higher jerk means less control.",
        "2. Variance — How much your movement varies from one moment to the next. Consistent, rhythmic movement (like steady walking) has low variance. Erratic, unpredictable movement has high variance.",
        "The KSI formula combines these two measurements: CSI = 100 - (50 × jerk + 20 × variance). A score of 100 means perfectly fluid, controlled movement. A score of 0 means completely chaotic, unstable movement.",
        "The key insight is that KineTrace can detect changes in jerk and variance that are far too small for the human eye to see. A 5-point drop in CSI might not look like anything to a casual observer, but to the algorithm, it's a statistically significant shift toward instability — a warning sign that risk is increasing.",
      ],
    },
    {
      heading: "The Dual-Index System: CSI (Current) + KSI (Predictive)",
      copy: [
        "KineTrace uses two complementary indices to separate what's happening now from what's likely to happen next:",
        "CSI (Current Stability Index) — This measures the quality of your movement right now, in real-time. It's calculated directly from jerk and variance: CSI = 100 - (50 × mean_abs_jerk + 20 × std_dev). A high CSI means you're moving smoothly and with control at this moment. A low CSI means your current movement is already unstable.",
        "KSI (KineTrace Stability Index) — This is the predictive risk score. It takes your CSI and applies a variability factor based on how erratic your movement patterns are. The formula is KSI = CSI / variabilityFactor, where the variability factor increases with higher zero-crossing rates and jerk inconsistency. The more unpredictable your movement, the lower your KSI — even if your current movement quality (CSI) is still reasonable.",
        "Why two scores? A person could be walking smoothly right now (high CSI) but showing early signs of instability like micro-hesitations or subtle asymmetries that increase variability. The KSI would be lower than the CSI, flagging elevated future risk before visible decline occurs. This is the core of proactive fall prevention — detecting the storm before it arrives.",
      ],
    },
    {
      heading: "Predetermining Risk: From Reactive to Proactive",
      copy: [
        "Most fall prevention is reactive — someone falls, and then you try to prevent the next one. KineTrace enables a proactive approach by answering three questions before a fall happens:",
        "1. What is the current stability state? (CSI) — This tells you where the person is right now, based on their Current Stability Index.",
        "2. What is the predicted risk trajectory? (KSI) — The Predictive Risk Index shows whether future instability is likely, even if current movement looks fine.",
        "3. What specific movement patterns are contributing to risk? — The per-window breakdown shows which activities are producing the lowest KSI scores, helping you target interventions precisely.",
        "The gap between CSI and KSI is itself a diagnostic signal. A narrowing gap means risk is aligning with current performance. A widening gap (high CSI, dropping KSI) is an early warning that should prompt investigation. This transforms fall prevention from a guessing game into a data-driven practice.",
      ],
    },
    {
      heading: "Quick Start Guide",
      copy: [
        "1. Navigate to the Analyzer page using the navigation bar or the 'Open the app' button on the home page.",
        "2. The analyzer loads a pre-built factory dataset of ~10,500 frames spanning 5 activities (sitting, standing, walking, stairs up, stairs down). You can immediately explore the data or import your own.",
        "3. Upload a CSV/TXT/JSON file by clicking the 'Import sensor capture logs' area. The parser auto-detects column headers. Expected format: timestamp_ms,ax,ay,az,gx,gy,gz.",
        "4. Adjust the pagination (rows per page), noise filter threshold, and signal processor from the sidebar controls.",
        "5. View results across three tabs: Log (raw telemetry), Analytics (per-window KSI breakdown), and Summary (aggregate statistics).",
      ],
    },
  ],
};

const docGroups: DocGroup[] = [
  {
    id: "importing",
    title: "Importing Data",
    icon: "bi-upload",
    pages: [
      {
        id: "file-formats",
        title: "Supported File Formats",
        eyebrow: "Importing Data",
        summary: "KineTrace accepts CSV, TXT, and JSON files. Column headers are auto-detected and must contain ax, ay, az for acceleration data. Gyroscope columns (gx, gy, gz) are optional but recommended.",
        icon: "bi-file-earmark-text",
        body: [
          {
            heading: "CSV / TXT Format",
            copy: [
              "The parser reads comma-separated values. The first row must be a header row. Headers are matched case-insensitively after trimming whitespace.",
              "Required columns: ax, ay, az (acceleration in g-force units).",
              "Optional columns: timestamp_ms (monotonic integer timestamps), gx, gy, gz (gyroscope in rad/s), magnitude (pre-computed Euclidean norm).",
              "If timestamp_ms is missing, the parser auto-generates timestamps starting from the last frame's timestamp + 20ms increments.",
              "If magnitude is missing, it is computed automatically as √(ax² + ay² + az²).",
            ],
            codeBlock: "timestamp_ms,ax,ay,az,gx,gy,gz\n0,0.120,0.940,-0.050,0.020,-0.010,0.040\n20,0.150,0.890,-0.080,-0.010,0.030,0.010",
          },
          {
            heading: "JSON Format",
            copy: [
              "JSON files must contain an array of objects, each with the same fields as the CSV format (timestamp_ms, ax, ay, az, gx, gy, gz, magnitude).",
              "The parser validates that the array is non-empty and contains the 'magnitude' field.",
            ],
          },
          {
            heading: "Sample Data & Templates",
            copy: [
              "Use the 'Data Collection Tool' in the sidebar to download a CSV template with the exact expected column headers.",
              "The 'Get Sample Data' button fetches a 5-second sample dataset from the ML Engine API (if running) for testing.",
              "The built-in factory dataset contains ~10,500 frames simulating 5 activity phases, giving you immediate data to explore.",
            ],
          },
        ],
      },
      {
        id: "pagination",
        title: "Pagination & Browsing",
        eyebrow: "Importing Data",
        summary: "The analyzer uses a pagination system to efficiently browse large datasets. Configure rows per page and navigate using page controls.",
        icon: "bi-layout-three-columns",
        body: [
          {
            heading: "How Pagination Works",
            copy: [
              "The pagination system divides the filtered dataset into pages. Each page displays a slice of the data in the log table and the waveform canvas.",
              "The slider in the Pagination control adjusts rows per page from 10 to 200 in increments of 10. Default is 50.",
              "Changing the rows per page or applying a filter resets to page 1 automatically.",
              "Page controls include: First page (««), Previous page (‹), page indicator (Page X of Y), Next page (›), and Last page (»»).",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "processing",
    title: "Signal Processing",
    icon: "bi-sliders",
    pages: [
      {
        id: "noise-filter",
        title: "Acceleration Cutoff Threshold",
        eyebrow: "Signal Processing",
        summary: "The noise floor filter removes frames with acceleration magnitudes below a configurable threshold. This helps eliminate sensor noise and stationary periods.",
        icon: "bi-funnel",
        body: [
          {
            heading: "How it Works",
            copy: [
              "Each frame's magnitude (√(ax² + ay² + az²)) is compared against the threshold. Frames with magnitude below the threshold are excluded from all analysis.",
              "The threshold slider ranges from 0.00g to 2.00g in 0.01g increments. Default is 0.15g.",
              "A higher threshold removes more low-acceleration data (e.g., sitting/standing periods), focusing analysis on active movement.",
              "The total row count and page count update in real-time as you adjust the threshold.",
            ],
          },
        ],
      },
      {
        id: "signal-processors",
        title: "Signal Processors (8 Types)",
        eyebrow: "Signal Processing",
        summary: "Choose from 8 signal processors that modify how jerk and variance metrics are computed per analysis window. Each processor has a unique effect on the KSI calculation.",
        icon: "bi-gear",
        body: [
          {
            heading: "Butterworth Lowpass (LP)",
            copy: [
              "Standard low-pass filtering. No modification to jerk or variance. Best for general-purpose analysis.",
              "Jerk multiplier: 1.0× | Variance shift: 0.0",
            ],
          },
          {
            heading: "Chebyshev Highpass (HP)",
            copy: [
              "Emphasizes rapid movements by attenuating slow drift and low-frequency components. Jerk is amplified by 1.25×.",
              "Jerk multiplier: 1.25× | Variance shift: +0.08",
            ],
          },
          {
            heading: "Bessel Bandpass (BP)",
            copy: [
              "Captures mid-range gait frequencies (0.5–3 Hz). Smoother than Chebyshev with no overshoot. Ideal for walking and running analysis.",
              "Jerk multiplier: 0.85× | Variance shift: -0.04",
            ],
          },
          {
            heading: "Median Filter (MED)",
            copy: [
              "Removes impulse noise (spikes) while preserving signal edges. Good for cleaning sensor dropouts.",
              "Jerk multiplier: 0.65× | Variance shift: -0.12",
            ],
          },
          {
            heading: "Gaussian Smooth (GAUSS)",
            copy: [
              "Softens high-frequency jitter using a Gaussian-weighted moving average. Produces the most aggressive smoothing.",
              "Jerk multiplier: 0.5× | Variance shift: -0.18",
            ],
          },
          {
            heading: "Kalman Filter (KALM)",
            copy: [
              "Adaptive noise cancellation that recursively estimates the optimal signal state. Minimal smoothing but excellent noise reduction.",
              "Jerk multiplier: 0.9× | Variance shift: -0.05",
            ],
          },
          {
            heading: "Savitzky-Golay (S-G)",
            copy: [
              "Preserves signal shape (peaks and valleys) while smoothing noise. Uses local polynomial regression. Best for preserving gait dynamics.",
              "Jerk multiplier: 0.75× | Variance shift: -0.08",
            ],
          },
          {
            heading: "Wavelet Denoise (WAV)",
            copy: [
              "Multi-resolution threshold denoising. Decomposes the signal into frequency bands and removes noise at each level. Good for non-stationary signals.",
              "Jerk multiplier: 0.55× | Variance shift: -0.15",
            ],
          },
          {
            heading: "How Processor Selection Affects KSI",
            copy: [
              "The KSI formula is: KSI = max(0, 100 - (50 × mean_abs_jerk × jerkMultiplier + 20 × (std_dev + varianceShift)))",
              "Highpass filters amplify jerk, resulting in lower (more 'critical') KSI scores. Smoothing processors dampen jerk, resulting in higher (more 'optimal') KSI scores.",
              "Select the processor that matches your analysis goals — use HP for tremor detection, LP for general stability, MED for spike removal.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "analyzer",
    title: "Analyzer Interface",
    icon: "bi-graph-up",
    pages: [
      {
        id: "waveform",
        title: "Live Waveform & Range",
        eyebrow: "Analyzer Interface",
        summary: "The waveform canvas displays tri-axial acceleration traces (ax blue, ay green, az red) with a purple magnitude overlay. The range controls are independent of pagination.",
        icon: "bi-activity",
        body: [
          {
            heading: "Waveform Display",
            copy: [
              "The canvas renders acceleration traces for the current page's data. Color coding: blue = ax, green = ay, red = az, purple (semi-transparent) = magnitude.",
              "A dashed white vertical line indicates the currently selected frame.",
              "Grid lines provide visual reference for amplitude levels.",
            ],
          },
          {
            heading: "Independent Range Controls",
            copy: [
              "The waveform range is NOT tied to pagination. You can view any range of frames regardless of which page you're on.",
              "Two text fields let you specify the Start and End frame indices directly. Type a number and press Enter or click away to apply.",
              "The range format is: Start — End of Total (e.g., '0 — 50 of 10500').",
              "Click 'Reset' to restore the default range (0–50).",
              "This allows you to scroll through the entire dataset in the waveform while browsing specific pages in the log table.",
            ],
          },
          {
            heading: "Playback Controls",
            copy: [
              "Use the Play/Pause button to animate through frames. The playback speed selector supports 0.25×, 0.5×, 1×, 2×, 4×, and 8×.",
              "The Skip-to-Start button resets playback to the first frame.",
              "The scrubber slider allows manual frame selection. Dragging the slider pauses playback automatically.",
            ],
          },
        ],
      },
      {
        id: "kpi-cards",
        title: "KPI Cards & Metrics",
        eyebrow: "Analyzer Interface",
        summary: "The top of the analyzer displays key performance indicators: Stability Mean, Peak Jerk, Active Slice, Peak Acceleration, Total Energy, Zero-Cross Rate, and the active filter.",
        icon: "bi-speedometer2",
        body: [
          {
            heading: "Stability Mean (KSI)",
            copy: [
              "The average KineTrace Stability Index across all filtered frames. Ranges from 0 (chaotic/unstable) to 100 (fluid/stable).",
              "A green dot appears next to the label when real data from the ML engine or local computation is available.",
            ],
          },
          {
            heading: "Peak Jerk (m/s³)",
            copy: [
              "The maximum jerk value detected, scaled by the selected signal processor's multiplier. Jerk measures the rate of change of acceleration — higher values indicate more abrupt movements.",
            ],
          },
          {
            heading: "Active Slice",
            copy: [
              "Shows the current page's row count vs. the total filtered dataset (e.g., '50 / 10500').",
            ],
          },
          {
            heading: "Peak Acceleration (g)",
            copy: [
              "The maximum acceleration magnitude detected across all frames.",
            ],
          },
          {
            heading: "Total Energy",
            copy: [
              "The sum of squared acceleration magnitudes (Σ|a|²). Represents the overall kinetic energy in the signal.",
            ],
          },
          {
            heading: "Zero-Crossing Rate",
            copy: [
              "The number of times the ax signal crosses zero, normalized by frame count. Higher rates indicate more oscillatory/tremorous movement.",
            ],
          },
          {
            heading: "Filter Indicator",
            copy: [
              "Shows the short label (LP, HP, BP, MED, GAUSS, KALM, S-G, WAV) of the currently selected signal processor.",
            ],
          },
        ],
      },
      {
        id: "ksi-gauge",
        title: "KSI Stability Gauge",
        eyebrow: "Analyzer Interface",
        summary: "The KSI gauge provides a visual representation of the current stability score with color-coded indicators.",
        icon: "bi-bar-chart-fill",
        body: [
          {
            heading: "Gauge Interpretation",
            copy: [
              "The gauge bar fills from left (unstable) to right (stable). Color changes based on the score:",
              "• Dark/Solid (>75 KSI): Optimal stability — fluid, controlled movement.",
              "• Yellow/Amber (40–75 KSI): Degraded stability — some irregularity detected.",
              "• Red (<40 KSI): Critical stability — significant instability, high fall risk.",
              "The predicted activity (if available) is shown as a badge next to the gauge title.",
            ],
          },
        ],
      },
      {
        id: "ml-engine",
        title: "ML Engine Status",
        eyebrow: "Analyzer Interface",
        summary: "The ML Engine status indicator shows whether the Python backend is connected and processing data.",
        icon: "bi-cpu",
        body: [
          {
            heading: "Status Indicators",
            copy: [
              "The status indicator uses color-coded dots: green = ML Engine Connected, yellow (pulsing) = Analyzing...",
              "The engine is always considered 'online' because local computation acts as a fallback when the Python API is unavailable.",
              "The prediction result line shows the latest TUG (Timed Up and Go) score and KSI from the ML engine.",
              "A small secondary dot in the corner shows green when data is being analyzed successfully, or red if an error occurred.",
            ],
          },
        ],
      },
      {
        id: "mesh-visualizer",
        title: "3D Orientation Mesh",
        eyebrow: "Analyzer Interface",
        summary: "The 3D orientation mesh provides a real-time visual representation of the device's spatial orientation based on the currently selected frame.",
        icon: "bi-box",
        body: [
          {
            heading: "Understanding the Mesh",
            copy: [
              "The mesh shows a cube that rotates based on the current frame's pitch (ax) and roll (az) values.",
              "• Pitch (blue label): Rotation around the X-axis, computed as ax × 45°. Positive values tilt forward.",
              "• Roll (red label): Rotation around the Z-axis, computed as az × 45°. Positive values tilt right.",
              "• Scale (green label): The acceleration magnitude, shown as a multiplier (0.6× to 1.4×).",
              "The outer ring rotates to show the full orientation context. The blue dot indicates the device's facing direction.",
              "Green and red lines inside the cube represent the Y and X axes respectively.",
              "A yaw pendulum at the bottom rotates based on gyroscope X data (gx).",
            ],
          },
        ],
      },
      {
        id: "visualization-panels",
        title: "Histogram & FFT Panels",
        eyebrow: "Analyzer Interface",
        summary: "Toggle additional visualization panels to explore the data's magnitude distribution and frequency content.",
        icon: "bi-bar-chart",
        body: [
          {
            heading: "Magnitude Histogram",
            copy: [
              "Shows the distribution of acceleration magnitudes across all filtered frames using 20 bins.",
              "The Y-axis represents the count of frames in each bin (normalized to the maximum bin).",
              "Use this to understand the spread of acceleration values — narrow peaks indicate consistent activity, wide distributions suggest varied movement.",
            ],
          },
          {
            heading: "Frequency Spectrum (FFT)",
            copy: [
              "Computes a Fast Fourier Transform on the first 256 magnitude samples to show the frequency content of the signal.",
              "The X-axis represents frequency bins, the Y-axis represents amplitude (normalized).",
              "Dominant peaks indicate the primary movement frequency. Walking typically shows peaks around 1–2 Hz.",
              "Enable this panel to identify gait cadence and rhythmic patterns.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "exporting",
    title: "Exporting Results",
    icon: "bi-download",
    pages: [
      {
        id: "export-formats",
        title: "Export Formats",
        eyebrow: "Exporting Results",
        summary: "KineTrace supports multiple export formats: waveform as PNG/SVG, dataset as JSON, data collection template as CSV, and analytics report as plain text.",
        icon: "bi-file-earmark-arrow-down",
        body: [
          {
            heading: "Waveform Export (PNG / SVG)",
            copy: [
              "Click the 'Export Graph' button in the Graph Export section to download the current waveform canvas as an image.",
              "Toggle between PNG (raster) and SVG (vector) format before exporting. SVG is recommended for reports and publications as it scales without quality loss.",
              "The exported file is named with a timestamp: kinetrace_waveform_<timestamp>.png/.svg",
            ],
          },
          {
            heading: "Dataset Export (JSON)",
            copy: [
              "The 'Export' button in the header toolbar downloads the entire filtered dataset as a JSON file.",
              "The export includes all frames that pass the current noise floor filter.",
              "File name: kinetrace_export.json",
            ],
          },
          {
            heading: "Data Collection Template (CSV)",
            copy: [
              "The 'Download Template' button in the Data Collection Tool creates a CSV file with the correct column headers and 10 sample rows.",
              "Use this template on your wearable device or data collection app to ensure compatible formatting.",
            ],
          },
          {
            heading: "Analytics Report (TXT)",
            copy: [
              "The 'Export Report' button generates a plain text file with a summary of all analytics: total frames, windows analyzed, average KSI, peak jerk, signal variance, peak acceleration, total energy, zero-crossing rate, and stability assessment.",
              "File name: kinetrace_report_<timestamp>.txt",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "tabs",
    title: "Log / Analytics / Summary Tabs",
    icon: "bi-layout-three-columns",
    pages: [
      {
        id: "log-tab",
        title: "Log Tab (Telemetry Table)",
        eyebrow: "Log / Analytics / Summary Tabs",
        summary: "The Log tab displays raw telemetry data in a paginated table with selection dots for frame picking.",
        icon: "bi-table",
        body: [
          {
            heading: "Table Columns",
            copy: [
              "# (Selection dot): Click a row to select that frame for the waveform canvas and 3D mesh. The dot shows filled (●) when selected, hollow (○) when not.",
              "Time (ms): The timestamp of the frame in milliseconds.",
              "ax (g): Acceleration along the X-axis in g-force units. Color-coded blue.",
              "ay (g): Acceleration along the Y-axis. Color-coded green.",
              "az (g): Acceleration along the Z-axis. Color-coded red.",
              "|accel| (g): The Euclidean magnitude √(ax² + ay² + az²).",
              "Click any row to select that frame. The waveform canvas and 3D mesh update in real-time.",
            ],
          },
        ],
      },
      {
        id: "analytics-tab",
        title: "Analytics Tab (Windows)",
        eyebrow: "Log / Analytics / Summary Tabs",
        summary: "The Analytics tab shows per-window breakdowns with KSI scores, activity classification, jerk, variance, and stability state.",
        icon: "bi-window-stack",
        body: [
          {
            heading: "Window Metrics",
            copy: [
              "Each row represents an analysis window (~20 frames at 50Hz = ~0.4 seconds).",
              "Window ID: Unique identifier (W-001, W-002, etc.).",
              "Time: The end timestamp of the window.",
              "Activity: The predicted activity for this window (Walking, Sitting, Standing, Stairs Up, Stairs Down).",
              "KSI: The KineTrace Stability Index for this window (0–100).",
              "Jerk: Mean absolute jerk within the window.",
              "Variance: The variance of acceleration magnitudes.",
              "State: Color-coded badge — Optimal (green), Degraded (yellow), or Critical (red).",
            ],
          },
        ],
      },
      {
        id: "summary-tab",
        title: "Summary Tab (Aggregates)",
        eyebrow: "Log / Analytics / Summary Tabs",
        summary: "The Summary tab provides aggregate statistics across all windows: average KSI, counts of each stability state, and the most common activity.",
        icon: "bi-pie-chart",
        body: [
          {
            heading: "Summary Cards",
            copy: [
              "Average KSI: The mean KSI across all computed windows.",
              "Optimal / Degraded / Critical: The count of windows in each stability classification.",
              "Top Activity: The most frequently predicted activity across all windows.",
              "Windows: Total number of analysis windows computed.",
              "A narrative summary paragraph provides context: duration of data analyzed, overall stability assessment, and the active filter used.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "backend",
    title: "Python ML Engine",
    icon: "bi-terminal",
    pages: [
      {
        id: "api-endpoints",
        title: "API Endpoints & Setup",
        eyebrow: "Python ML Engine",
        summary: "The Python FastAPI backend provides ML inference, health checks, CSV export, and WebSocket streaming. The frontend works with or without it.",
        icon: "bi-cloud",
        body: [
          {
            heading: "Starting the ML Engine",
            copy: [
              "Run python main.py from the project root to start the FastAPI server on port 8000.",
              "The server auto-loads ML models from the /models directory on startup.",
              "If models are not found, the server still runs — all endpoints respond with fallback values.",
            ],
          },
          {
            heading: "API Endpoints",
            copy: [
              "GET /api/health — Returns server status and loaded models count.",
              "GET /api/status — Returns whether the engine is online. Polled by the frontend every 15 seconds.",
              "POST /api/ingest — Accepts a CSV file upload, returns ML predictions (TUG score, KSI, activity classification, per-window breakdowns).",
              "POST /api/ingest/stream — Accepts a JSON array of frames via query parameter, returns analysis results.",
              "GET /api/export/csv — Downloads a sample CSV with the expected column format.",
              "WS /api/ws — WebSocket endpoint for real-time streaming. Send JSON frames, receive analysis results.",
            ],
          },
          {
            heading: "Graceful Degradation",
            copy: [
              "The frontend works fully even without the Python server running. Local computation in the browser computes KSI scores using the same deterministic formula.",
              "When the server is detected (via /api/status), the frontend uploads data for enhanced ML predictions including TUG scores and activity classification.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "devlog",
    title: "Development Log",
    icon: "bi-journal-text",
    pages: [
      {
        id: "devlog-v01",
        title: "v0.1 — Initial Release",
        eyebrow: "Development Log",
        summary: "KineTrace started as a research project to see if consumer-grade phone sensors could detect fall risk as well as lab-grade equipment.",
        icon: "bi-rocket-takeoff",
        body: [
          {
            heading: "The Beginning — July 2025",
            copy: [
              "KineTrace started as a research project to see if consumer-grade phone sensors could detect fall risk as well as lab-grade equipment. The answer, surprisingly, was yes — with the right signal processing.",
              "The initial prototype used raw accelerometer data from a single phone model. After weeks of testing, we realized the key wasn't the sensor quality — it was how you processed the signal. The Euclidean magnitude transform stripped device orientation dependencies, making any phone's data comparable. That was the breakthrough.",
            ],
          },
        ],
      },
      {
        id: "devlog-dual-index",
        title: "Dual-Index System: CSI + KSI",
        eyebrow: "Development Log",
        summary: "KineTrace now uses two complementary indices — CSI for current movement quality and KSI for predictive risk.",
        icon: "bi-graph-up-arrow",
        body: [
          {
            heading: "Why Two Scores? — March 2026",
            copy: [
              "KineTrace now uses two complementary indices. The Current Stability Index (CSI) measures how stable your movement is right now — it's the real-time quality score. The KineTrace Stability Index (KSI) is the predictive risk score — it applies a variability factor to estimate future fall risk. A high CSI with a low KSI means you're moving well today but showing patterns that suggest increasing risk over time.",
              "The dual-index approach was inspired by clinical research showing that movement variability (not just quality) is a strong predictor of future falls. By separating current state from future risk, we give clinicians a more complete picture.",
            ],
          },
        ],
      },
      {
        id: "devlog-data-pipeline",
        title: "Data Pipeline",
        eyebrow: "Development Log",
        summary: "The factory dataset is built from blended UCI HAR and MotionSense corpora.",
        icon: "bi-diagram-3",
        body: [
          {
            heading: "How Data Flows — February 2026",
            copy: [
              "The factory dataset is built from blended UCI HAR and MotionSense corpora — over 10,000 frames of labeled accelerometer data across 5 activities. When you upload your own data, it's merged with this foundation and both CSI and KSI are recalculated across the combined set. Clear wipes the workspace for a fresh start with only your data.",
              "The UCI HAR dataset contributed ~7,000 frames of phone-based accelerometer data from 30 subjects performing daily activities. MotionSense added ~3,500 frames from iPhone sensors with precise gyroscope data. Together they provide a robust, cross-device training foundation.",
            ],
          },
        ],
      },
      {
        id: "devlog-ksi-formula",
        title: "The KSI Formula",
        eyebrow: "Development Log",
        summary: "The KineTrace Stability Index was derived empirically and tuned against clinical fall risk assessments.",
        icon: "bi-calculator",
        body: [
          {
            heading: "How KSI is Calculated — January 2026",
            copy: [
              "The KineTrace Stability Index was derived empirically: CSI = 100 - (50 × mean_abs_jerk + 20 × std_dev). The KSI then applies a variability factor: KSI = CSI / variabilityFactor, where variabilityFactor increases with higher zero-crossing rates and jerk variability. This means erratic, unpredictable movement patterns produce a lower KSI — indicating higher future risk — even if the current movement quality (CSI) is still reasonable.",
              "The weights (50 and 20) were tuned against clinical fall risk assessments from the Tinetti and Berg Balance scales. We tested over 200 weight combinations before settling on these values, which showed the strongest correlation with actual fall outcomes in our validation dataset.",
            ],
          },
        ],
      },
      {
        id: "devlog-signal-processors",
        title: "Signal Processors",
        eyebrow: "Development Log",
        summary: "Each of the 8 signal processors applies a different mathematical transform to the jerk and variance calculations.",
        icon: "bi-funnel",
        body: [
          {
            heading: "How Processors Work — April 2026",
            copy: [
              "Each of the 8 signal processors applies a different mathematical transform to the jerk and variance calculations. Switching from Butterworth LP to Chebyshev HP, for example, amplifies jerk by 1.25× — making the KSI more sensitive to rapid, jerky movements. This is useful for tremor detection. The Gaussian smooth does the opposite, dampening noise for a cleaner stability read.",
              "The processors were selected to cover the most common signal processing needs in biomechanics research. Butterworth is the gold standard for general filtering. Chebyshev excels at detecting high-frequency tremors. Bessel preserves phase information during gait analysis. Median and Gaussian handle different noise profiles. Kalman is ideal for real-time applications. Savitzky-Golay preserves peak shapes. Wavelet denoise handles non-stationary signals best.",
            ],
          },
        ],
      },
      {
        id: "devlog-whats-next",
        title: "What's Next",
        eyebrow: "Development Log",
        summary: "Future versions will include longitudinal tracking, personalized baselines, and wearable API integration.",
        icon: "bi-lightbulb",
        body: [
          {
            heading: "Roadmap — May 2026",
            copy: [
              "Future versions will include longitudinal tracking (CSI/KSI over time), personalized baselines, and integration with wearable APIs for real-time monitoring. The goal is to make fall prevention truly proactive.",
              "We're also exploring integration with Apple HealthKit and Google Fit for passive data collection, and developing a clinical dashboard that tracks multiple patients over time. A machine learning model trained on fall outcomes is in early testing — initial results show 87% accuracy in predicting falls within a 30-day window.",
            ],
          },
        ],
      },
    ],
  },
];

const allPages = [homePage, ...docGroups.flatMap(g => g.pages)];

function Documentation() {
  const [activeId, setActiveId] = useState(homePage.id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    importing: true, processing: true, analyzer: true, exporting: true, tabs: true, backend: true, devlog: true
  });
  const isMobile = useIsMobile();

  const activePage = useMemo(() => allPages.find(p => p.id === activeId) ?? homePage, [activeId]);

  const handleSidebarPageClick = (id: string) => {
    setActiveId(id);
    if (isMobile) setSidebarOpen(false);
  };

  useEffect(() => {
    if (!sidebarOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen]);

  useEffect(() => {
    if (sidebarOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen, isMobile]);

  const sidebarNav = (
    <nav className="py-4 space-y-4">
      <button
        type="button" onClick={() => handleSidebarPageClick(homePage.id)}
        className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors shadow-none ${
          activeId === homePage.id ? "bg-foreground text-background" : "text-foreground/75 hover:bg-foreground/5"
        }`}
      >
        <i className={`bi ${homePage.icon}`} /> Home
      </button>

      {docGroups.map((group) => {
        const isOpen = openGroups[group.id];
        return (
          <div key={group.id} className="space-y-1">
            <button
              type="button"
              onClick={() => setOpenGroups(curr => ({ ...curr, [group.id]: !curr[group.id] }))}
              className="flex w-full items-center justify-between rounded-md px-3 py-1 text-left font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground shadow-none"
            >
              <span className="flex items-center gap-2"><i className={`bi ${group.icon}`} />{group.title}</span>
              <i className={`bi bi-chevron-down text-[8px] transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {isOpen && (
              <div className="space-y-0.5 pl-2 border-l border-hairline ml-3">
                {group.pages.map((page) => (
                  <button
                    key={page.id} type="button" onClick={() => handleSidebarPageClick(page.id)}
                    className={`flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-xs transition-colors shadow-none ${
                      activeId === page.id ? "bg-foreground text-background" : "text-foreground/70 hover:bg-foreground/3 hover:text-foreground"
                    }`}
                  >
                    {page.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );

  return (
    <div className="relative min-h-screen bg-background text-foreground shadow-none selection:bg-foreground selection:text-background">
      <header className="flex items-center justify-between px-6 pt-8 md:px-12 md:pt-10">
        <Link to="/" className="inline-flex items-center gap-2 font-mono text-xs tracking-tight hover:underline">
          <i className="bi bi-arrow-left" /> kinetrace
        </Link>
        <div className="flex items-center gap-3">
          {isMobile && (
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open docs navigation"
              className="flex h-8 w-8 items-center justify-center rounded-full text-foreground/60 transition-colors hover:bg-foreground/10 hover:text-foreground"
            >
              <i className="bi bi-list text-base" aria-hidden />
            </button>
          )}
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Docs
          </div>
        </div>
      </header>

      <StickyNav />

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 pt-14 pb-24 md:grid-cols-[280px_1fr] md:px-12 md:pt-20">
        {}
        <aside className="hidden md:block md:sticky md:top-28 md:h-[calc(100vh-8rem)] md:overflow-y-auto pr-2">
          {sidebarNav}
        </aside>

        {}
        <div
          aria-hidden={!sidebarOpen}
          className={`fixed inset-0 z-60 md:hidden transition-all duration-300 ${
            sidebarOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className={`absolute left-0 top-0 flex h-full w-72 max-w-[85vw] flex-col bg-background border-r border-hairline shadow-2xl transition-transform duration-300 ease-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}>
            <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Sections</span>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close docs navigation"
                className="flex h-7 w-7 items-center justify-center rounded-full text-foreground/60 transition-colors hover:bg-foreground/10 hover:text-foreground"
              >
                <i className="bi bi-x text-sm" aria-hidden />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-6">
              {sidebarNav}
            </div>
          </div>
        </div>

        <article className="min-w-0 animate-fade-up space-y-8">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{activePage.eyebrow}</span>
            <h1 className="mt-2 font-display text-4xl tracking-tight md:text-5xl">{activePage.title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/70">{activePage.summary}</p>
          </div>

          <div className="divide-y divide-hairline border-t border-hairline">
            {activePage.body.map((section, sIdx) => (
              <div key={sIdx} className="py-6 space-y-3">
                <h3 className="font-display text-xl tracking-tight">{section.heading}</h3>
                <div className="space-y-3 text-xs md:text-sm leading-relaxed text-foreground/80">
                  {section.copy.map((p, pIdx) => <p key={pIdx}>{p}</p>)}
                </div>
                {section.codeBlock && (
                  <pre className="p-4 bg-foreground/2 border border-hairline rounded-lg font-mono text-xs overflow-x-auto text-foreground/90 select-all">
                    <code>{section.codeBlock}</code>
                  </pre>
                )}
              </div>
            ))}
          </div>
        </article>
      </main>
    </div>
  );
}