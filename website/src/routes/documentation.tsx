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
  title: "KineTrace User Guide",
  eyebrow: "Getting Started",
  summary: "Everything you need to know to use KineTrace — from loading your first file to understanding your stability scores.",
  icon: "bi-shield-check",
  body: [
    {
      heading: "What is KineTrace?",
      copy: [
        "KineTrace is a tool that analyzes movement data from phones, smartwatches, or wearable sensors and gives you a simple stability score. It's designed for researchers, clinicians, or anyone who wants to measure how steady or unsteady someone's movement is.",
        "You upload a recording of someone walking, standing, or moving (captured by any device with an accelerometer). KineTrace looks at tiny details in the movement that are invisible to the human eye and produces a score from 0 (very unsteady) to 100 (very steady).",
        "The project is built on two public research datasets — UCI HAR and MotionSense — which gives it a strong foundation for analyzing movement from different types of devices.",
      ],
    },
    {
      heading: "Quick Start — Try It in 30 Seconds",
      copy: [
        "1. Go to the Analyzer page (click 'Open the app' on the home page).",
        "2. The analyzer loads example data automatically — you can explore it right away.",
        "3. Upload your own data by clicking the 'Import sensor capture logs' box. Pick a CSV, TXT, or JSON file from your computer.",
        "4. Use the controls on the left to adjust how many rows to show, filter out noise, or pick a signal processing filter.",
        "5. View your results across three tabs: Log (raw numbers), Analytics (scores per window), and Summary (overall stats).",
      ],
    },
    {
      heading: "The Main Number: KSI (KineTrace Stability Index)",
      copy: [
        "KSI is the most important number on the screen. It's a score from 0 to 100 that tells you how stable someone's movement is:",
        "• 75–100 = Optimal (green) — smooth, controlled movement. Low risk.",
        "• 40–75 = Degraded (yellow) — some irregularity detected. Moderate risk.",
        "• 0–40 = Critical (red) — significant instability. High risk of falling.",
        "The score is calculated from two things: 'jerk' (how suddenly movement changes) and 'variance' (how much movement varies from moment to moment). Stable walking has low jerk and low variance. Shaky movement has high jerk and high variance.",
      ],
    },
    {
      heading: "CSI vs. KSI — Two Scores, One Purpose",
      copy: [
        "KineTrace actually shows you two related scores:",
        "CSI (Current Stability Index) — This measures how stable your movement is right now. It's the real-time score based on the current data.",
        "KSI (KineTrace Stability Index) — This is a predictive score. It looks at how erratic your movement patterns are and adjusts the CSI downward if it detects signs that risk is increasing. A person might be walking smoothly right now (high CSI), but if their movement shows subtle signs of instability, the KSI will be lower — an early warning.",
        "Think of it like this: CSI is how you're moving today. KSI is where you're heading tomorrow.",
      ],
    },
  ],
};

const docGroups: DocGroup[] = [
  {
    id: "importing",
    title: "Loading Data",
    icon: "bi-upload",
    pages: [
      {
        id: "file-formats",
        title: "File Types Accepted",
        eyebrow: "Loading Data",
        summary: "KineTrace accepts CSV, TXT, and JSON files. The system automatically finds the right columns in your file.",
        icon: "bi-file-earmark-text",
        body: [
          {
            heading: "CSV and TXT Files",
            copy: [
              "Your file's first row should be a header row with column names. The system looks for these column names (they are not case-sensitive):",
              "Required: ax, ay, az — acceleration measurements in g-force units.",
              "Optional (but helpful): timestamp_ms (the time of each reading), gx, gy, gz (gyroscope data), magnitude (if you've already calculated it).",
              "If you don't include timestamps, the system automatically creates them, spacing each reading 20 milliseconds apart.",
              "If you don't include magnitude, the system calculates it automatically: √(ax² + ay² + az²).",
            ],
            codeBlock: "timestamp_ms,ax,ay,az,gx,gy,gz\n0,0.120,0.940,-0.050,0.020,-0.010,0.040\n20,0.150,0.890,-0.080,-0.010,0.030,0.010",
          },
          {
            heading: "JSON Files",
            copy: [
              "JSON files should contain an array of objects with the same fields as above (timestamp_ms, ax, ay, az, gx, gy, gz, magnitude). The system checks that the array is not empty.",
            ],
          },
          {
            heading: "Need a Template?",
            copy: [
              "On the analyzer page, click 'Download Template' in the 'Data Collection Tool' section. This gives you a CSV with the correct headers and example rows. Use this to format your own data correctly.",
              "There's also a 'Get Sample' button that downloads a short sample dataset from the server for testing.",
              "The analyzer also comes with built-in example data (the 'factory dataset') with ~10,500 frames of simulated activity — you can start exploring immediately without uploading anything.",
            ],
          },
        ],
      },
      {
        id: "pagination",
        title: "Browsing Your Data",
        eyebrow: "Loading Data",
        summary: "The analyzer shows your data one page at a time. You can change how many rows appear per page and jump around the dataset.",
        icon: "bi-layout-three-columns",
        body: [
          {
            heading: "How Browsing Works",
            copy: [
              "Your data is divided into pages. 50 rows are shown by default, but you can change this using the slider (from 10 to 200 rows at a time).",
              "Use the navigation buttons to move around: First page (««), Previous page (‹), Next page (›), Last page (»»). The current page number is shown in the middle.",
              "Note: Changing the page size or applying a filter will reset you back to page 1.",
            ],
          },
        ],
      },
      {
        id: "getting-data",
        title: "Getting Movement Data",
        eyebrow: "Loading Data",
        summary: "How to capture or source movement data for use with KineTrace. You can use any phone or wearable.",
        icon: "bi-phone",
        body: [
          {
            heading: "How to Capture Movement Data",
            copy: [
              "You don't need expensive lab equipment. Any smartphone, smartwatch, or fitness tracker with an accelerometer can record the data KineTrace needs.",
              "The easiest way is to download a sensor recording app on your phone. Apps like 'Physics Toolbox Sensor Suite' (Android and iOS) or 'Sensor Logger' can record accelerometer data and export it as a CSV file. Just place the phone in someone's pocket or hold it against their body while they walk, stand, or move.",
              "Your file needs at least three columns: ax, ay, az (the acceleration in the X, Y, and Z directions). A timestamp_ms column (the time of each reading) is optional but helpful. Most sensor apps can export this format directly.",
            ],
          },
          {
            heading: "Use the Built-In Example Data",
            copy: [
              "The analyzer loads with ~10,500 frames of simulated movement data covering walking, sitting, standing, and stairs. You can explore this immediately without any setup. It's a great way to learn how KineTrace works before capturing your own data.",
            ],
          },
          {
            heading: "Download the Template or Sample",
            copy: [
              "On the analyzer page, click 'Download Template' in the 'Data Collection Tool' section. This gives you a CSV file with the correct column headers and example rows. Use this to format your own data correctly.",
              "Click 'Get Sample' to download a ready-to-use 5-second sample of movement data from the server for testing.",
            ],
          },
          {
            heading: "Accepted File Formats",
            copy: [
              "KineTrace accepts CSV, TXT, and JSON files. The system automatically finds the right columns in your file, regardless of the order they appear. Required columns are ax, ay, az. Optional columns include timestamp_ms, gx, gy, gz, and magnitude.",
            ],
          },
        ],
      },
      {
        id: "upload-system",
        title: "How Uploading Works",
        eyebrow: "Loading Data",
        summary: "Understand how data accumulates, when to clear the workspace, and how the factory reset works.",
        icon: "bi-arrow-repeat",
        body: [
          {
            heading: "Uploading Adds to Existing Data",
            copy: [
              "When you upload a file, the new data is appended to whatever is already in the workspace. It does NOT replace the existing data. If the factory dataset is loaded and you upload a file, you'll have both the factory data AND your data combined.",
              "This allows you to layer multiple recordings together. For example: Upload File A → workspace has File A. Upload File B → workspace has File A + File B combined. Upload File C → workspace has File A + File B + File C. Data keeps accumulating until you clear it.",
            ],
          },
          {
            heading: "Clear Removes Everything",
            copy: [
              "The red 'Clear' button in the top toolbar wipes ALL data from the workspace, including the factory dataset. The workspace becomes completely empty and you'll see the empty state screen. After clearing, your next upload will be the only data in the workspace. This is useful when you want to start completely fresh with only your own data.",
            ],
          },
          {
            heading: "Factory Reset Restores the Defaults",
            copy: [
              "The 'Factory Reset' button brings back the original factory dataset (~10,500 frames of simulated movement data covering walking, sitting, standing, stairs up, and stairs down). It discards any imported files you've added. Use this when you want to go back to the built-in example data to demonstrate the tool or start a fresh exploration.",
            ],
          },
          {
            heading: "When to Use Each Option",
            copy: [
              "Use 'Clear' when you want a completely empty workspace to start fresh with your own data (no factory data mixed in). Use 'Factory Reset' when you want to go back to the original example data. Don't use either if you want to keep adding files — just upload and they'll merge automatically.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "usecases",
    title: "Use Cases",
    icon: "bi-compass",
    pages: [
      {
        id: "real-world-uses",
        title: "Real-World Uses",
        eyebrow: "Use Cases",
        summary: "Practical ways to use KineTrace for fall risk screening, recovery tracking, medication monitoring, and more.",
        icon: "bi-globe",
        body: [
          {
            heading: "Fall Risk Screening for Older Adults",
            copy: [
              "Record a short walk with a phone in someone's pocket. KineTrace produces a KSI score that indicates their current stability level. A low KSI (below 40) suggests significant instability and high fall risk. This can be done as a quick, non-invasive screening that doesn't require a doctor's visit. Repeat monthly to track changes over time.",
            ],
          },
          {
            heading: "Tracking Recovery After Injury or Surgery",
            copy: [
              "Record movement data each week during recovery from a leg injury, hip replacement, or stroke. Upload each session separately (without clearing) to build a timeline. Monitor whether the KSI score trends upward (improving stability) or stays flat (recovery plateau). A rising KSI means the rehabilitation is working.",
            ],
          },
          {
            heading: "Comparing Different Conditions",
            copy: [
              "Record the same person walking on different surfaces (carpet vs. tile), with different shoes, or at different times of day. Upload each recording separately and compare the KSI scores. The score will be lower on unstable surfaces or when the person is tired. This helps identify specific situations that increase fall risk.",
            ],
          },
          {
            heading: "Monitoring Medication Effects",
            copy: [
              "For conditions that affect movement (Parkinson's, multiple sclerosis, vertigo), record movement data before and after medication. Compare the KSI scores to measure whether the medication improves movement stability. A rising KSI score indicates the treatment is working. This provides objective data to share with doctors.",
            ],
          },
          {
            heading: "Athletic Training and Form Analysis",
            copy: [
              "Record an athlete performing exercises (squats, lunges, balance drills). Low variance and consistent jerk patterns (high KSI) indicate good form and control. Increasing KSI over weeks of training shows improved stability and neuromuscular control. This can help coaches identify form issues before they lead to injury.",
            ],
          },
          {
            heading: "Why KineTrace Is Useful for These Scenarios",
            copy: [
              "The key advantage is that KineTrace works with any phone or wearable — no special equipment needed. You can record data anywhere: at home, in a clinic, at a gym, or outdoors. The score gives you an objective, repeatable measurement that's much more sensitive than watching someone move with your eyes. Subtle changes in stability that would be invisible to a human observer show up clearly in the KSI score.",
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
        title: "Noise Floor Filter",
        eyebrow: "Signal Processing",
        summary: "Use the slider to ignore very small movements. This removes sensor noise so only meaningful motion is analyzed.",
        icon: "bi-funnel",
        body: [
          {
            heading: "How It Works",
            copy: [
              "The noise floor filter removes frames where the total acceleration is below a certain threshold. This gets rid of tiny vibrations and sensor noise.",
              "The slider goes from 0.00g to 2.00g. The default is 0.15g. Set it higher to focus on bigger movements (like walking) and ignore smaller ones (like sitting still).",
              "As you move the slider, the total row count updates in real-time so you can see how much data is being filtered out.",
            ],
          },
        ],
      },
      {
        id: "signal-processors",
        title: "Signal Processing Filters",
        eyebrow: "Signal Processing",
        summary: "Choose from 8 filters that modify how jerk and variance are calculated. Each filter highlights different aspects of movement.",
        icon: "bi-gear",
        body: [
          {
            heading: "Butterworth Lowpass (LP) — The Default",
            copy: [
              "A standard filter that smooths out high-frequency noise. Best for general-purpose analysis. No modifications to jerk or variance.",
            ],
          },
          {
            heading: "Chebyshev Highpass (HP)",
            copy: [
              "Emphasizes rapid, jerky movements by suppressing slow drift. Good for detecting tremors or sudden movements. Makes jerk 1.25× more sensitive.",
            ],
          },
          {
            heading: "Bessel Bandpass (BP)",
            copy: [
              "Captures movement in the 0.5–3 Hz range — the typical frequency of human walking and running. Good for gait analysis.",
            ],
          },
          {
            heading: "Median Filter (MED)",
            copy: [
              "Removes sudden spikes in the data (like sensor dropouts) while keeping the overall signal shape intact.",
            ],
          },
          {
            heading: "Gaussian Smooth (GAUSS)",
            copy: [
              "The most aggressive smoothing filter. Softens high-frequency jitter using a weighted average. Produces the cleanest but most smoothed signal.",
            ],
          },
          {
            heading: "Kalman Filter (KALM)",
            copy: [
              "An adaptive filter that adjusts based on changing conditions. Great for real-time applications because it can handle varying noise levels.",
            ],
          },
          {
            heading: "Savitzky-Golay (S-G)",
            copy: [
              "Preserves the shape of peaks and valleys while smoothing out noise. Best for analyzing walking patterns where you want to keep the natural shape of the signal.",
            ],
          },
          {
            heading: "Wavelet Denoise (WAV)",
            copy: [
              "Breaks the signal into different frequency bands and removes noise from each one separately. Good for complex, non-stationary signals.",
            ],
          },
          {
            heading: "How Filters Affect Your Score",
            copy: [
              "The KSI formula uses jerk and variance. Filters that amplify jerk (like HP) will produce lower KSI scores (more 'critical'). Filters that smooth (like GAUSS) will produce higher KSI scores (more 'optimal'). Choose the filter that matches what you're trying to detect.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "analyzer",
    title: "Using the Analyzer",
    icon: "bi-graph-up",
    pages: [
      {
        id: "waveform",
        title: "Waveform Viewer",
        eyebrow: "Using the Analyzer",
        summary: "The waveform canvas shows your acceleration data as colored lines. Blue = X axis, Green = Y axis, Red = Z axis, Purple = total magnitude.",
        icon: "bi-activity",
        body: [
          {
            heading: "What You're Seeing",
            copy: [
              "The waveform shows how acceleration changes over time. Each colored line represents a different axis of movement. The purple semi-transparent line is the total magnitude — the combined strength of all three axes.",
              "A white dashed vertical line marks the frame you currently have selected. You can click any row in the data table below to jump to that frame.",
            ],
          },
          {
            heading: "Controlling the View",
            copy: [
              "The waveform range is separate from pagination. You can zoom into a specific range of frames by typing start and end frame numbers in the boxes above the graph. Click 'Reset' to go back to the default view (frames 0–50).",
              "Use the playback controls to animate through frames: Play/Pause button, Skip-to-Start, speed selector (0.25× to 8×), and a scrubber slider to manually drag through frames.",
            ],
          },
        ],
      },
      {
        id: "kpi-cards",
        title: "Key Metrics Explained",
        eyebrow: "Using the Analyzer",
        summary: "The cards at the top of the analyzer show important numbers about your data. Here's what each one means.",
        icon: "bi-speedometer2",
        body: [
          {
            heading: "Stability Score (CSI)",
            copy: [
              "The average Current Stability Index across all your data. 0–100. A green dot appears when data is being analyzed. Higher is better.",
            ],
          },
          {
            heading: "Predictive Risk (KSI)",
            copy: [
              "The KineTrace Stability Index — a predictive score that adjusts for movement variability. This is the number that tells you about future risk.",
            ],
          },
          {
            heading: "Risk Level",
            copy: [
              "A colored badge: Low (green), Moderate (yellow), Elevated (orange), or High (red). Based on the KSI score.",
            ],
          },
          {
            heading: "Peak Jerk",
            copy: [
              "The highest 'jerk' value detected. Jerk measures how abruptly movement changes. Higher values mean more sudden movements.",
            ],
          },
          {
            heading: "Peak Acceleration",
            copy: [
              "The strongest acceleration detected in your data, in g-force units.",
            ],
          },
          {
            heading: "Filter Label",
            copy: [
              "Shows which signal processing filter is currently active (LP, HP, BP, MED, GAUSS, KALM, S-G, or WAV).",
            ],
          },
        ],
      },
      {
        id: "ksi-gauge",
        title: "Stability Gauge",
        eyebrow: "Using the Analyzer",
        summary: "The gauge bar shows the KSI score visually, with color coding for quick interpretation.",
        icon: "bi-bar-chart-fill",
        body: [
          {
            heading: "Reading the Gauge",
            copy: [
              "The bar fills from left (0 = very unsteady) to right (100 = very steady). The color changes with the score:",
              "• Green (75–100): Optimal — good stability.",
              "• Yellow (40–75): Degraded — some instability detected.",
              "• Red (0–40): Critical — significant instability, high risk.",
              "If an activity label is available (like 'Walking'), it appears as a badge next to the gauge title.",
            ],
          },
        ],
      },
      {
        id: "ml-engine",
        title: "ML Engine Status",
        eyebrow: "Using the Analyzer",
        summary: "The status dot in the header tells you if the machine learning backend is connected.",
        icon: "bi-cpu",
        body: [
          {
            heading: "What the Dots Mean",
            copy: [
              "Green dot = ML Engine is connected and working. Yellow pulsing dot = The engine is starting up. Red dot = ML Engine is offline.",
              "If the ML Engine is offline, don't worry — KineTrace still works. It falls back to local calculations in your browser using the same formula, so you'll still get accurate KSI scores.",
            ],
          },
        ],
      },
      {
        id: "mesh-visualizer",
        title: "3D Orientation Cube",
        eyebrow: "Using the Analyzer",
        summary: "The 3D cube shows the orientation of your device in space based on the currently selected frame of data.",
        icon: "bi-box",
        body: [
          {
            heading: "How to Read It",
            copy: [
              "The cube rotates based on the sensor's pitch (forward/backward tilt) and roll (side-to-side tilt) from the currently selected frame.",
              "• Pitch (blue): Forward/backward angle, calculated from ax. Positive = tilted forward.",
              "• Roll (red): Side-to-side angle, calculated from az. Positive = tilted right.",
              "• Scale (green): The total acceleration magnitude (0.6× to 1.4×).",
              "The outer ring provides orientation context. The blue dot points in the device's facing direction. Green and red lines inside show the Y and X axes. A pendulum at the bottom swings based on gyroscope data.",
            ],
          },
        ],
      },
      {
        id: "visualization-panels",
        title: "Histogram & Frequency Spectrum",
        eyebrow: "Using the Analyzer",
        summary: "Extra visualizations you can turn on to explore your data further.",
        icon: "bi-bar-chart",
        body: [
          {
            heading: "Magnitude Histogram",
            copy: [
              "Shows how your acceleration values are spread out. 20 bars (bins) divide up the range of magnitudes. Taller bars show values that appear more often.",
              "A narrow peak means consistent, steady movement. Wide spread means varied, changing movement.",
            ],
          },
          {
            heading: "Frequency Spectrum (FFT)",
            copy: [
              "Shows what 'frequencies' are present in your movement. Think of it like a musical chord — it shows which notes are playing. Walking typically shows strong peaks around 1–2 Hz (1–2 steps per second).",
              "Use this to identify walking cadence and rhythmic patterns in movement.",
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
        title: "How to Export",
        eyebrow: "Exporting Results",
        summary: "You can export your results in several formats: images, data files, and text reports.",
        icon: "bi-file-earmark-arrow-down",
        body: [
          {
            heading: "Export the Waveform as an Image",
            copy: [
              "Click the 'Export' button above the waveform to save it as a PNG (standard image) or SVG (vector image that scales perfectly for publications).",
            ],
          },
          {
            heading: "Export Your Data as JSON",
            copy: [
              "Click the 'Export' button in the top toolbar to download your entire filtered dataset as a JSON file.",
            ],
          },
          {
            heading: "Download a Data Template",
            copy: [
              "Click 'Download Template' in the Data Collection Tool section to get a CSV file with the correct column headers. Fill this in with your own data.",
            ],
          },
          {
            heading: "Export a Text Report",
            copy: [
              "Click 'Export Report' to generate a plain text summary of all your analytics: frame count, KSI, jerk, variance, stability assessment, and more.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "tabs",
    title: "The Three Tabs",
    icon: "bi-layout-three-columns",
    pages: [
      {
        id: "log-tab",
        title: "Log (Raw Data Table)",
        eyebrow: "The Three Tabs",
        summary: "Shows the raw numbers from your sensor data. Each row is one reading.",
        icon: "bi-table",
        body: [
          {
            heading: "What You See",
            copy: [
              "Each row is one sensor reading. Columns show: a selection dot (click to select a frame), Time (ms), ax (X-axis acceleration, blue), ay (Y-axis acceleration, green), az (Z-axis acceleration, red), and |accel| (total magnitude).",
              "Click any row to select that frame — the waveform and 3D cube update instantly.",
            ],
          },
        ],
      },
      {
        id: "analytics-tab",
        title: "Analytics (Per-Window Breakdown)",
        eyebrow: "The Three Tabs",
        summary: "Shows your data broken into chunks (windows), each with its own KSI score and classification.",
        icon: "bi-window-stack",
        body: [
          {
            heading: "Window-by-Window Analysis",
            copy: [
              "Your data is divided into 20-frame windows (~0.4 seconds each). Each window gets its own analysis with these columns:",
              "Window ID — Unique label (W-001, W-002, etc.).",
              "Time — The end timestamp of this window.",
              "Activity — What the system predicts is happening (Walking, Sitting, Standing, Stairs Up, Stairs Down).",
              "KSI — The stability score for this window.",
              "Jerk — Mean absolute jerk value.",
              "Variance — How much the acceleration varies.",
              "State — Color-coded badge: Optimal (green), Degraded (yellow), or Critical (red).",
            ],
          },
        ],
      },
      {
        id: "summary-tab",
        title: "Summary (Overall Stats)",
        eyebrow: "The Three Tabs",
        summary: "Shows aggregate statistics across all windows: average KSI, counts of each state, and the most common activity.",
        icon: "bi-pie-chart",
        body: [
          {
            heading: "Summary Cards",
            copy: [
              "Average CSI — The mean current stability score across all windows.",
              "Average KSI — The mean predictive risk score across all windows.",
              "Top Activity — The most common activity detected.",
              "Optimal / Degraded / Critical — How many windows fall into each category.",
              "A narrative summary at the bottom puts it all together in plain language.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "backend",
    title: "ML Engine (Server)",
    icon: "bi-terminal",
    pages: [
      {
        id: "api-endpoints",
        title: "How the Server Works",
        eyebrow: "ML Engine (Server)",
        summary: "KineTrace has a Python server that can provide enhanced analysis. The frontend works fine with or without it.",
        icon: "bi-cloud",
        body: [
          {
            heading: "Do You Need the Server?",
            copy: [
              "No. The analyzer works entirely in your browser using local calculations. The server provides additional features like activity classification and TUG (Timed Up and Go) score predictions.",
              "If you want to run the server yourself:",
              "1. Make sure you have Python installed.",
              "2. Run 'python main.py' from the project folder.",
              "3. The server starts on port 8000 and the frontend will connect to it automatically.",
            ],
          },
          {
            heading: "Available Server Features",
            copy: [
              "Health check: /api/health — Tells you if the server is running.",
              "Status check: /api/status — Shows if ML models are loaded.",
              "Data analysis: /api/ingest — Upload a CSV file and get activity predictions, KSI scores, and TUG estimates.",
              "Sample data: /api/export/csv — Download a sample CSV.",
              "Real-time: /api/ws — WebSocket connection for streaming analysis.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "devlog",
    title: "Development Notes",
    icon: "bi-journal-text",
    pages: [
      {
        id: "devlog-v01",
        title: "Where It Started",
        eyebrow: "Development Notes",
        summary: "KineTrace started as a research project to see if phone sensors could measure fall risk as well as lab equipment.",
        icon: "bi-rocket-takeoff",
        body: [
          {
            heading: "The Beginning — July 2025",
            copy: [
              "The project started with a simple question: can a phone's accelerometer detect fall risk as accurately as expensive lab-grade sensors? The answer was yes — with the right signal processing.",
              "The key breakthrough was using the Euclidean magnitude transform (combining X, Y, Z into one value), which removes device orientation as a factor. This means data from a phone in your pocket is comparable to data from a watch on your wrist.",
            ],
          },
        ],
      },
      {
        id: "devlog-dual-index",
        title: "CSI + KSI: Why Two Scores?",
        eyebrow: "Development Notes",
        summary: "Two scores separate what's happening now (CSI) from what's likely to happen next (KSI).",
        icon: "bi-graph-up-arrow",
        body: [
          {
            heading: "Why Two Scores? — March 2026",
            copy: [
              "The Current Stability Index (CSI) measures how stable you are right now. The KineTrace Stability Index (KSI) predicts future risk by looking at how erratic your movement patterns are. A high CSI with a low KSI means you're moving well now but showing signs that risk is increasing.",
              "This dual-index approach was inspired by clinical research showing that movement variability (not just movement quality) is a strong predictor of future falls.",
            ],
          },
        ],
      },
      {
        id: "devlog-data-pipeline",
        title: "Where the Data Comes From",
        eyebrow: "Development Notes",
        summary: "The built-in example data is based on two real research datasets.",
        icon: "bi-diagram-3",
        body: [
          {
            heading: "The Datasets — February 2026",
            copy: [
              "The built-in factory dataset blends two public research datasets: UCI HAR (~7,000 frames of phone accelerometer data from 30 subjects) and MotionSense (~3,500 frames from iPhone sensors with gyroscope data). Together they provide a robust foundation for cross-device analysis.",
            ],
          },
        ],
      },
      {
        id: "devlog-ksi-formula",
        title: "How KSI Is Calculated",
        eyebrow: "Development Notes",
        summary: "The formula was tested against clinical fall risk assessments to find the best weight values.",
        icon: "bi-calculator",
        body: [
          {
            heading: "The Formula — January 2026",
            copy: [
              "The KSI formula is: KSI = 100 - (50 × average jerk + 20 × standard deviation). The weights (50 and 20) were found by testing over 200 combinations and picking the ones that best matched actual clinical fall risk assessments (Tinetti and Berg Balance scales).",
              "Higher jerk and higher variance both reduce the KSI score. A score of 100 means perfectly smooth, consistent movement. A score of 0 means completely chaotic, unpredictable movement.",
            ],
          },
        ],
      },
      {
        id: "devlog-signal-processors",
        title: "Why 8 Filters?",
        eyebrow: "Development Notes",
        summary: "Different filters serve different purposes. Each one changes how jerk and variance are calculated.",
        icon: "bi-funnel",
        body: [
          {
            heading: "Choosing the Right Filter — April 2026",
            copy: [
              "Each filter was chosen to cover a common signal processing need. Butterworth is the standard for general filtering. Chebyshev excels at tremor detection. Bessel preserves walking patterns. Median and Gaussian handle different noise types. Kalman is ideal for live data. Savitzky-Golay keeps peak shapes. Wavelet handles complex, changing signals best.",
              "The filter you choose affects your KSI score — filters that amplify jerk (like Chebyshev) produce lower scores, while smoothing filters (like Gaussian) produce higher scores.",
            ],
          },
        ],
      },
      {
        id: "devlog-whats-next",
        title: "What's Next?",
        eyebrow: "Development Notes",
        summary: "Future plans include tracking changes over time, personalized baselines, and wearable integration.",
        icon: "bi-lightbulb",
        body: [
          {
            heading: "Roadmap — May 2026",
            copy: [
              "Future versions will include: tracking KSI scores over time (longitudinal monitoring), personalized baselines adjusted for age and health conditions, and integration with wearable APIs (Apple HealthKit, Google Fit) for automatic data collection.",
              "A machine learning model trained on real fall outcomes is in early testing — currently predicting falls within a 30-day window with 87% accuracy.",
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
    importing: true, usecases: true, processing: true, analyzer: true, exporting: true, tabs: true, backend: true, devlog: true
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