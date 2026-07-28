import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { StickyNav } from "@/components/StickyNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/documentation")({
  component: Documentation,
  head: () => ({
    meta: [
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
});

type DocPage = {
  id: string; title: string; eyebrow: string; summary: string; icon: string;
  body: Array<{ heading: string; copy: string[]; codeBlock?: string; button?: { label: string; href: string; icon?: string } }>;
};

type DocGroup = { id: string; title: string; icon: string; pages: DocPage[]; };

const homePage: DocPage = {
  id: "docs-home",
  title: "Home",
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
        "KineTrace processes data in 2.56-second windows (50 frames at 50 Hz), computing jerk and variance for each window. These values feed into the KSI formula, which produces a score that correlates with movement stability. The system also classifies the type of movement (walking, sitting, standing, stairs) using a trained Random Forest classifier.",
      ],
    },
    {
      heading: "CSI vs. KSI — Two Scores, One Purpose",
      copy: [
        "KineTrace actually shows you two related scores:",
        "CSI (Current Stability Index) — This measures how stable your movement is right now. It's the real-time score based on the current data.",
        "KSI (KineTrace Stability Index) — This is a predictive score. It looks at how erratic your movement patterns are and adjusts the CSI downward if it detects signs that risk is increasing. A person might be walking smoothly right now (high CSI), but if their movement shows subtle signs of instability, the KSI will be lower — an early warning.",
        "Think of it like this: CSI is how you're moving today. KSI is where you're heading tomorrow.",
        "Both scores are calculated from the same underlying metrics — jerk (the rate of change of acceleration) and variance (the spread of acceleration values). The difference is that KSI applies a penalty factor based on the variability of movement patterns across windows, making it more sensitive to emerging instability that hasn't yet affected the current movement quality.",
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
      {
        id: "for-trial-holders",
        title: "For Trial Holders",
        eyebrow: "Use Cases",
        summary: "Guidelines for researchers and clinicians conducting trials with KineTrace — consent, safety, and submission.",
        icon: "bi-clipboard-check",
        body: [
          {
            heading: "Conducting a Trial Safely",
            copy: [
              "If you are running a formal research trial or clinical study using KineTrace, participant safety and proper consent are essential. Before collecting any data, make sure every participant has signed the KineTrace Trial Collection Waiver. Keep a signed copy on file for your records.",
              "All participants should be informed that KineTrace is a research prototype and not a medical device. They should understand that the tool does not provide medical diagnoses and that they should consult a healthcare professional for any medical concerns.",
              "Data collection should take place in a safe environment. Participants should be supervised during physical activities. Make sure first aid is available and that participants are physically able to perform the requested movements without risk of injury.",
            ],
          },
          {
            heading: "What to Send When You're Finished",
            copy: [
              "When your trial is complete, email your anonymized dataset and a brief summary to advait.patel@outlook.com. Include:",
              "• The trial name and institution.",
              "• A short description of the study design and participant demographics.",
              "• The exported data file(s) in CSV or JSON format.",
              "• Any observations or findings you'd like to share.",
              "This helps improve KineTrace and contributes to the broader research community.",
            ],
          },
          {
            heading: "Setting Up Your Own Trial",
            copy: [
              "If you're interested in running your own trial or collaborating on a research study, you can reach out directly at advait.patel@outlook.com to discuss trial setup, access to additional documentation, and any custom requirements for your study.",
            ],
          },
          {
            heading: "Download the Trial Waiver",
            copy: [
              "Before beginning any formal data collection, download and review the KineTrace Trial Collection Waiver. This document outlines the responsibilities of researchers, the consent process, and the terms under which KineTrace may be used in a study.",
            ],
            button: { label: "Download Trial Waiver", href: "/files/KineTrace_Trial_Collection_Waiver.pdf", icon: "bi bi-file-earmark-pdf" },
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
        id: "window-selection",
        title: "Window Selection & Filtering",
        eyebrow: "Using the Analyzer",
        summary: "Select individual windows in the Analytics tab to focus your analysis on specific time periods.",
        icon: "bi-check2-square",
        body: [
          {
            heading: "How Window Selection Works",
            copy: [
              "In the Analytics tab, each window row has a small circular selection control on the left, just like the frame selector in the Log tab.",
              "Click any window row to select it. The circle fills in to indicate selection. Click again to deselect.",
              "You can select multiple windows. The selection state is shown above the tab bar as a count.",
            ],
          },
          {
            heading: "What Gets Filtered",
            copy: [
              "Once you select one or more windows, the Log tab shows only the frames that fall inside those windows (between each window's startIdx and endIdx). The table paginates over only those frames.",
              "The Analytics tab table continues showing all windows so you can keep selecting. Selected rows are visually highlighted.",
              "Summary tab: All statistics recalculate from only the selected windows.",
              "Waveform: Updates to show only the data from selected windows.",
              "Stability Gauges: Recalculate based on filtered data.",
              "Orientation Cube: Reflects the current frame from the filtered dataset.",
              "Histogram and Frequency Spectrum: Both update to reflect the filtered dataset.",
            ],
          },
          {
            heading: "Resetting the Selection",
            copy: [
              "Click the Reset button that appears when windows are selected to clear the selection and return to the unfiltered view.",
              "Resetting returns all tabs to showing the complete dataset.",
            ],
          },
          {
            heading: "Typical Use Cases",
            copy: [
              "Select specific windows to isolate a particular movement pattern (e.g., only the windows where the person was walking).",
              "Compare metrics across a subset of windows without losing the context of the full recording.",
              "Drill down from the Summary view into the Analytics view by selecting windows of interest.",
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
        id: "journal1",
        title: "The Genesis and the Data Problem",
        eyebrow: "Development Notes",
        summary: "Realized the core challenge is standardizing messy kinematic data, not algorithms, and started researching normalization methods.",
        icon: "bi-rocket-takeoff",
        body: [
          {
            heading: "March 12, 2026",
            copy: [
              "The conceptual groundwork for what will eventually become KineTrace began today. For weeks now, I have been turning the same problem over and over in my head. How do you extract meaningful, predictive insight from raw kinematic data? It seems simple until you actually sit down and try to answer it. Today was the day I finally sat down.",
              "What struck me almost immediately is that the initial challenge isn't algorithmic at all. It is structural. It would be easy to assume that the hard part of a project like this is choosing the right model or tuning the right parameters. That assumption falls apart the moment you actually look at the data you're working with. I spent the evening working through open source datasets. The deeper I got, the more I realized just how messy and unstandardized real world data truly is. Nothing arrives in a clean, ready to use form. It arrives noisy, inconsistent, and full of quiet traps for anyone who tries to build on top of it too fast.",
              "The goal, as I've defined it for myself, is to build an engine capable of tracing and predicting movement patterns. But raw time series data is inherently noisy by nature. It is full of small fluctuations, irregularities, and outliers that don't reflect anything meaningful about the underlying pattern. Before I can even begin to think seriously about neural networks or predictive trees, I need something much more foundational. I need a robust mathematical basis for standardizing this information, so that later stages of the project aren't built on sand.",
              "So that's where I started tonight. Not with modeling, but with math. I began sketching out a data pipeline. I researched how to mathematically normalize multidimensional arrays, so that whatever algorithm eventually sits downstream of this preprocessing won't be skewed by outliers it was never equipped to handle. It's not glamorous work, and there's no visible progress to point to yet. No working model, no interface, nothing to demo. But I know from experience that this is the kind of invisible foundation that decides whether everything built on top of it later actually holds up.",
            ],
          },
        ],
      },
      {
        id: "journal2",
        title: "The Garbage In, Garbage Out Paradigm",
        eyebrow: "Development Notes",
        summary: "Wrote data cleaning scripts and learned that ML is mostly data wrangling, finishing with a working normalization pipeline.",
        icon: "bi-graph-up-arrow",
        body: [
          {
            heading: "April 4, 2026",
            copy: [
              "Today was a lesson. A tedious one, but an important one. It was a reality that every data scientist eventually has to confront directly. The quality of your output is entirely bound by the quality of your input. Garbage in, garbage out isn't just a saying. It is the organizing principle of the entire day.",
              "I formally began writing the Python scripts responsible for data ingestion. I leaned heavily on the pandas library to do the heavy lifting of loading, inspecting, and manipulating the data. I went in with a certain amount of confidence, honestly. I'd done data work before, and I assumed the ingestion step would be a relatively fast formality on the way to the more interesting modeling work. That confidence didn't survive contact with reality. My initial attempts to feed the raw data into even a basic algorithm failed spectacularly. The reason was clear in retrospect. I had badly underestimated the prevalence of null values and formatting inconsistencies scattered throughout the test data.",
              "So I stopped, backed up, and committed to doing the unglamorous work properly. I spent over eight hours, most of the day, writing transformation functions whose entire purpose was to clean, parse, and interpolate missing data points. It was slow, iterative work. Find a broken assumption. Write a function to handle it. Test it against the dataset. Find the next broken assumption. Repeat. There's not much intellectual glamour in writing an interpolation function to patch a gap in a time series. But there's a real satisfaction in watching a chaotic dataset slowly become something trustworthy.",
              "By the end of it, I'd arrived at a conclusion that I suspect will define my approach to this entire project going forward. Machine learning is perhaps 20 percent algorithm design and 80 percent data wrangling. It's tempting to think of the algorithm as the real work and the data cleaning as a chore to get through on the way there. That framing is backwards. If the ingestion pipeline is flawed, the resulting predictions aren't just weak. They are actively misleading, which is arguably worse than having no model at all. A model trained on bad data doesn't fail loudly. It fails quietly, producing confident looking answers that are wrong in ways that are hard to detect after the fact.",
              "The payoff for today's grind is simple. I finally have a script that reliably takes chaotic, inconsistent raw input and outputs a clean, normalized CSV file. It's not exciting to look at, but it's the foundation everything else depends on.",
            ],
          },
        ],
      },
      {
        id: "journal3",
        title: "Algorithmic Selection and Overfitting",
        eyebrow: "Development Notes",
        summary: "Built a Random Forest model after an SVM proved too slow, then fixed severe overfitting by tuning hyperparameters down to a realistic 87% accuracy.",
        icon: "bi-diagram-3",
        body: [
          {
            heading: "April 28, 2026",
            copy: [
              "I achieved my first successful model compilation today, using scikit learn to bring together everything the data pipeline has been building toward. It felt like a genuine milestone. It was the moment where the project stops being purely about data plumbing and starts being about actual predictive intelligence. But the victory, as these things often go, was short lived.",
              "My first instinct was to experiment with a Support Vector Machine, or SVM, as the core classification algorithm. On paper it seemed like a reasonable starting point. But in practice the computational overhead turned out to be too high for the kind of response times I want this engine to eventually achieve. An algorithm that technically works but is too slow to deploy in a real time context isn't really viable for what KineTrace is meant to be. So I made the call to pivot away from it.",
              "I moved instead to building a Random Forest Classifier. The early results looked almost too good. Accuracy metrics hovered around 99 percent. My first reaction was excitement, but that excitement didn't last long. A number like that should always raise suspicion rather than celebration. A deep dive into cross validation confirmed exactly what I feared. The model wasn't actually learning the underlying patterns in the data at all. It was simply memorizing the training set. It was severely overfitted. It performed beautifully on data it had already seen and collapsed the moment it encountered anything new.",
              "That discovery kicked off the rest of the week. I spent it tuning hyperparameters, limiting the maximum depth of individual trees, and adjusting the minimum number of samples required per leaf node. Each of these adjustments is a small lever. Pulling on them one at a time to see how the model's behavior shifts is a slow, methodical process. Watching the accuracy metric drop from that suspicious 99 percent down to a more realistic 87 percent wasn't a step backward. It was the model finally being honest with me. More importantly, it now generalized beautifully to unseen validation data, which is the actual measure of whether any of this is useful.",
              "Once I was satisfied with the model's behavior, I serialized the trained model using joblib. This froze it into a form that can be loaded and reused without retraining from scratch every time. The brain of the engine is finally built. Everything from here is about giving that brain a body.",
            ],
          },
        ],
      },
      {
        id: "journal4",
        title: "Architecting the Engine and Server Paradigms",
        eyebrow: "Development Notes",
        summary: "Realized the local Python script needs to become a real web backend and started shifting mindset from data science project to software product.",
        icon: "bi-calculator",
        body: [
          {
            heading: "May 14, 2026",
            copy: [
              "The core concept for KineTrace is finally moving from a theoretical, isolated script into something resembling a scalable architecture. I spent the afternoon drafting the overall system design. The process of doing so forced a realization I'd been circling for a while without quite landing on. My local Python environment is a dead end if this tool is ever going to be used by anyone other than me.",
              "That realization reframes almost everything about how I need to think about the project going forward. Because the processing relies on my serialized Random Forest model to analyze complex structures, the backend needs to be capable of receiving web requests, deserializing that model into memory, and returning a prediction within milliseconds. This is not a nice to have. It is a core requirement. A model that only runs when I personally execute a script on my own machine isn't a product. It's a personal tool. Bridging the gap between raw algorithmic processing and genuine web accessibility is going to be the first true test of whether this system's design actually holds up under real conditions.",
              "There's a mental shift happening alongside the technical one. Up to this point, I've been thinking about KineTrace as a data science script. Its success is measured by accuracy metrics and clean CSV outputs. Starting today, I need to start viewing it as a software engineering product instead. Its success is measured by reliability, accessibility, and how it behaves when other people, and other systems, depend on it. That's a different discipline. I can feel myself having to adjust how I approach even basic decisions because of it.",
            ],
          },
        ],
      },
      {
        id: "journal5",
        title: "The API Epiphany",
        eyebrow: "Development Notes",
        summary: "Chose FastAPI over Flask and Django for its async support and pydantic based request validation.",
        icon: "bi-funnel",
        body: [
          {
            heading: "May 26, 2026",
            copy: [
              "After spending real time evaluating several backend web frameworks, mainly Flask and Django, the two names that come up constantly in any discussion of Python web development, I made the definitive choice to build the KineTrace backend using FastAPI instead. It wasn't a decision I made lightly, given how established the alternatives are. But the more I looked into it, the clearer the case became.",
              "The decision ultimately came down to two things. FastAPI's asynchronous capabilities matter enormously for an application that needs to handle requests efficiently under load. Its native integration with Python type hints turned out to be more than just a syntactic nicety. Working with it today felt like something of a revelation. By leveraging pydantic models, I'm able to strictly define the exact shape and data types that the machine learning engine expects to receive on every request. That might sound like a small thing, but the implications are significant. If a malformed request comes in, the framework automatically rejects it before it ever has a chance to reach, and potentially crash, my predictive model.",
              "That distinction feels important enough to sit with for a moment. Up until now, I've mostly been writing code that works under the conditions I expect it to encounter. What I'm writing now is different in kind. It is code that defends itself against the conditions I don't expect. That's a meaningful shift in how I think about the reliability of this system. It's given me a lot more confidence about what happens once this application is no longer just running on my machine, under my control, with only my own well behaved inputs to worry about.",
            ],
          },
        ],
      },
      {
        id: "journal6",
        title: "Building the Bridge with FastAPI",
        eyebrow: "Development Notes",
        summary: "Built the first API endpoints (/api/ingest and /api/status) and tested them locally with Postman.",
        icon: "bi-lightbulb",
        body: [
          {
            heading: "June 3, 2026",
            copy: [
              "I spent today doing the structural work of turning yesterday's decision into something real. I actually structured the backend application and wrapped my machine learning functions into dedicated API endpoints. The two I focused on specifically were data ingestion, at /api/ingest, and a system health check, at /api/status. These two endpoints represent the minimum viable skeleton of the whole backend. One to actually do the work, and one to confirm the server is alive and responding at all.",
              "For now, everything is running strictly in a local development environment, bound to 127.0.0.1:8000. There's something genuinely satisfying about this stage of a project that's easy to forget once things get more complex. It is the simple act of using a client like Postman to send a raw JSON payload to that local address, and then watching, in real time, as the FastAPI server parses the incoming data, executes the Random Forest logic underneath it, and returns a cleanly formatted prediction. It's the first moment where the entire pipeline, from raw request to model inference to structured response, is visible end to end, running as a connected system rather than a set of disconnected scripts.",
              "One thing that's been quietly saving me hours throughout all of this is FastAPI's automatic interactive documentation generation. Rather than manually writing out and maintaining documentation for every endpoint, or manually retesting every route by hand each time something changes, I can visually map out the API contracts as they exist right now, in real time, directly from the code itself. It's a small feature in the grand scheme of the framework, but its cumulative effect on my day to day workflow has been significant.",
            ],
          },
        ],
      },
      {
        id: "journal7",
        title: "Constructing the User Interface",
        eyebrow: "Development Notes",
        summary: "Set up a React frontend with Vite in a separate directory and began tackling async state management (loading, success, error).",
        icon: "bi-rocket-takeoff",
        body: [
          {
            heading: "June 12, 2026",
            copy: [
              "With the backend logic stabilizing, I pivoted entirely to the frontend architecture today. A working backend is only half of a usable product. I need a user interface that can actually and dynamically visualize the data KineTrace is processing. Otherwise all of this backend work stays invisible to anyone who isn't querying it directly through a tool like Postman.",
              "I set up a React development environment using Vite. I made a deliberate choice to nest it inside its own dedicated website directory rather than mixing it in with the backend code. That decision was purely about maintaining a clean separation of concerns within the Git repository. It kept the frontend and backend as distinct, independently manageable pieces of the overall project rather than letting them tangle together. It's a small organizational choice now, but I expect it to pay off as the codebase grows.",
              "Working with Vite for the first time in this project, the speed of its hot module replacement stood out immediately as a massive upgrade to the developer experience compared to more traditional bundlers I've used in the past. Seeing changes reflected almost instantly, without a full page reload breaking my train of thought, makes the iterative process of building out UI components feel far less friction heavy than it otherwise would.",
              "I've begun building out the core UI components today, and I'm focusing heavily on state management as I do. Tracking the asynchronous state of a network request, managing the interface cleanly across the loading, success, and error phases of a single request, is proving to be a genuinely complex puzzle in React. It sounds simple when described in the abstract. In practice it means thinking carefully about every possible state the UI could be in at any given moment, and making sure none of them leave the user staring at something broken or unclear.",
            ],
          },
        ],
      },
      {
        id: "journal8",
        title: "Failsafes and Asynchronous Design",
        eyebrow: "Development Notes",
        summary: "Connected the frontend to the backend with fetch requests and added a local fallback failsafe for dropped connections.",
        icon: "bi-graph-up-arrow",
        body: [
          {
            heading: "June 21, 2026",
            copy: [
              "I spent this week wiring the React frontend components to issue asynchronous fetch requests to the local FastAPI server. This connected the interface I've been building to the backend logic that's been running quietly underneath it. That connection alone took real care, but I also used this stretch of time to implement something I consider a critical failsafe. If the frontend ever drops its connection to the backend API, the application catches that failure and falls back to a limited, local computation performed directly within the browser, rather than simply breaking or leaving the user with nothing.",
              "I'm genuinely proud of engineering that redundancy. It's the kind of feature that a user will hopefully never even notice, precisely because it's doing its job. But actually testing it surfaced a harder truth. It highlighted exactly how fragile client server communication can be over a network, even in a relatively controlled local setup. Connections drop, requests time out, responses arrive malformed or not at all. A resilient application has to plan for all of that rather than assume the happy path is the only path.",
              "Making sure the UI remains responsive, that it doesn't freeze or lock up while waiting on the machine learning engine to finish computing a result, required a genuinely deep dive into JavaScript Promises and the React component lifecycle. It's one thing to understand these concepts in the abstract. It's another to apply them correctly under the specific pressure of a real asynchronous, potentially unreliable network call. This week was as much about internalizing that distinction as it was about writing any particular line of code.",
            ],
          },
        ],
      },
      {
        id: "journal9",
        title: "The Polish and the Preparation",
        eyebrow: "Development Notes",
        summary: "Polished the local app's UX (loading indicators, smooth transitions, graceful errors) while feeling anxious about deploying beyond localhost.",
        icon: "bi-diagram-3",
        body: [
          {
            heading: "July 1, 2026",
            copy: [
              "The local application is functioning beautifully, end to end. There's real satisfaction in seeing it work as a coherent whole rather than as a collection of separate pieces I've been building in isolation for months. The frontend accepts user input, sanitizes it, and sends it off to the local backend. The backend processes that data through the ML model and returns tracing predictions, which the frontend then takes and renders into something genuinely readable and usable.",
              "I spent today on polish. This is the kind of work that doesn't show up in a changelog as a major feature but matters enormously to how the application actually feels to use. That meant adding visual loading indicators so the interface never leaves someone wondering whether anything is happening. It meant smoothing out transitions so state changes don't feel abrupt or jarring. It meant making sure the error handling degrades gracefully rather than exposing something broken or confusing when something inevitably goes wrong.",
              "But underneath the satisfaction of today's progress, a looming anxiety is starting to set in, and I don't think it's unreasonable. Running an application on localhost is, by definition, a controlled and safe environment. I am the only user, the only source of input, and the only variable that can go wrong. Deploying this same architecture out onto the public internet, where it has to survive independently of me and handle conditions I can't fully predict or control in advance, is a daunting next step. It's one thing to build something that works when you're the only one testing it. It's another thing entirely to hand it over to the unpredictability of the open internet.",
            ],
          },
        ],
      },
      {
        id: "journal10",
        title: "The Deployment Crucible and the Sunk Cost Fallacy",
        eyebrow: "Development Notes",
        summary: "Battled a corrupted Windows virtual environment, then let go of it and deployed the backend cleanly to Render from a fresh requirements.txt.",
        icon: "bi-calculator",
        body: [
          {
            heading: "July 8, 2026",
            copy: [
              "Today was a masterclass. Not in a subject I chose to study, but in a lesson I was forced to learn through sheer frustration. It taught me the importance of letting go of a broken configuration rather than continuing to fight it.",
              "I attempted to freeze my Python dependencies today in preparation for a cloud deployment on Render. In the process, my local Windows virtual environment completely corrupted. What followed was hours of cascading tracebacks and bizarre IndentationError messages appearing deep inside the core pip library itself. These are the kind of errors that don't point to an obvious fix, because they're not really about the code I wrote at all. They are about the environment underneath it having quietly broken in some way I couldn't immediately diagnose.",
              "I spent hours trying to salvage that environment, and in doing so, I fell victim to a very familiar trap. It is the sunk cost fallacy. Because I had already invested so much time trying to repair the venv, every additional hour spent on it felt justified by the hours that came before, even as the returns on that effort kept shrinking toward zero. Eventually, it clicked. Render's cloud infrastructure does not care about my local machine's corrupted state. Nothing about the broken environment on my own computer was actually relevant to whether the deployment would succeed.",
              "So I stopped repairing and started rebuilding from a different angle. I manually drafted a clean requirements.txt file, listing only the explicit dependencies the project actually needs. I pushed it to GitHub and let Render provision a completely clean Linux environment from scratch, rather than trying to replicate my broken local setup. It worked flawlessly, on the first real attempt, once I stopped trying to force the old, corrupted environment to cooperate. The backend engine is officially live on the web. This is a genuinely significant milestone, even if the road to it was more about abandoning a bad approach than perfecting a good one.",
            ],
          },
        ],
      },
      {
        id: "journal11",
        title: "Navigating CI/CD and Frontend Build Paths",
        eyebrow: "Development Notes",
        summary: "Fixed Netlify build failures by correcting the base directory and publish directory (website/dist) settings.",
        icon: "bi-funnel",
        body: [
          {
            heading: "July 15, 2026",
            copy: [
              "I hit another significant roadblock today, this time while attempting to deploy the React frontend via Netlify. The automated Continuous Integration builds repeatedly failed. The underlying reason turned out to be structural rather than a bug in my code. Netlify's pipeline was executing from the root directory of the repository, fruitlessly searching there for a package.json file that I had intentionally placed inside the website subdirectory back when I set up the project structure in June.",
              "Diagnosing that took some digging into the platform's deployment settings, since the failure messages didn't immediately point to the mismatch between where Netlify was looking and where the file actually lived. I eventually had to explicitly define the Base directory setting so the build system would know where to actually start looking for the project it was supposed to be building.",
              "Once that was resolved, the build failed again almost immediately. This time it complained about a missing build directory. That sent me further into the underlying compilation behavior of Vite, which, I confirmed, outputs its production files to a folder named dist by default. Aligning the CI/CD pipeline configuration with my actual physical project structure, website/dist specifically, was tedious and required careful attention to detail. But adjusting the publish directory setting finally resolved the chain of errors. The frontend is hosted, at last, after a day that felt disproportionately long relative to what turned out to be, fundamentally, a pathing problem.",
            ],
          },
        ],
      },
      {
        id: "journal12",
        title: "The Integration Nightmare",
        eyebrow: "Development Notes",
        summary: "Diagnosed and fixed frontend-backend connection failures caused by a hardcoded localhost URL and mismatched API routes.",
        icon: "bi-lightbulb",
        body: [
          {
            heading: "July 18, 2026",
            copy: [
              "The frontend is deployed. The backend is hosted. And yet, today, the two systems absolutely refused to communicate with each other. This was a frustrating place to be after so much individual progress on each side independently.",
              "Opening the browser's developer console revealed a sea of red text. There were ERR_CONNECTION_REFUSED errors, 404 Not Found responses, and Cross Origin Resource Sharing blocks stacking up on top of each other. The first major oversight I identified was embarrassingly simple in hindsight. I had hardcoded http://127.0.0.1:8000 directly into my fetch requests months ago, back when everything was running locally, and never updated it. The live, cloud hosted frontend was, quite literally, trying to find the backend inside the user's own computer. This is an address that meant something in a local development environment and meant nothing at all once the frontend was actually deployed to the public internet.",
              "Even after implementing dynamic environment variables to properly point requests at the correct Render URL instead, the requests continued to fail, now with 404 errors rather than connection refusals. That required a more careful investigation. By working through the browser's Network tab, step by step, I eventually realized that my frontend's request paths didn't perfectly match the exact routing paths defined by my backend's decorators. These were small mismatches that were invisible until I lined the two up side by side. Tracing the exact path of the data, starting from a button click in React, traveling across the internet to the FastAPI router, and then returning back again, forced me to map out and carefully sync every single variable in that pipeline, end to end, rather than assuming any one piece of it was already correct just because it had worked in isolation.",
            ],
          },
        ],
      },
       {
        id: "journal13",
        title: "Hardening the Stack and Securing the Engine",
        eyebrow: "Development Notes",
        summary: "Locked down the app for production with strict CORS, an API key system, and rate limiting, officially completing KineTrace.",
        icon: "bi-lightbulb",
        body: [
          {
            heading: "July 20, 2026",
            copy: [
              "With the two previously separate halves of the system finally communicating successfully, my focus today shifted entirely away from connectivity and toward security and optimization. This is the work that doesn't make anything new possible, but makes everything already built actually safe to leave running in public.",
              "The starting point for that shift was a hard look at something I'd left too open out of pure convenience. Leaving an API completely open to the internet with a wildcard CORS policy, allow_origins equal to a wildcard, violates the principle of least privilege and leaves the server genuinely vulnerable to exploitation. It was functional, but functional isn't the same as responsible. Today was about closing that gap.",
              "I spent the day systematically locking down the architecture, piece by piece. First, I configured the FastAPI middleware to strictly accept requests only from the verified Netlify frontend origin. This closed off the wildcard policy that had been sitting there since deployment. Next, to prevent unauthorized abuse of the compute heavy machine learning endpoints, the kind of endpoints that are expensive to run and therefore an attractive target for automated abuse, I engineered an API key validation system. It uses a secret dependency header, X-API-Key, injected securely via server environment variables rather than hardcoded anywhere in the codebase. Finally, I integrated the slowapi library to enforce strict rate limits based on IP address. This added a further layer of protection against automated spam directed at the cloud server.",
              "Looking back at where this project started, the distance traveled is hard to fully take in. What began in March as an isolated, messy data script, something that couldn't even reliably ingest a CSV file without falling over, has officially evolved into KineTrace. It is a secured, cloud hosted, full stack machine learning application. It's been a long road from normalizing multidimensional arrays on a quiet March evening to configuring rate limits on a production server. But every step along that road built directly on the one before it.",
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
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();

  const activePage = useMemo(() => allPages.find(p => p.id === activeId) ?? homePage, [activeId]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.trim().toLowerCase();
    return allPages.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.summary.toLowerCase().includes(q) ||
      p.body.some(s => s.heading.toLowerCase().includes(q) || s.copy.some(c => c.toLowerCase().includes(q)))
    );
  }, [searchQuery]);

  const handleSidebarPageClick = (id: string) => {
    setActiveId(id);
    window.location.hash = id;
    if (isMobile) setSidebarOpen(false);
  };

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.replace('#', '');
        const page = allPages.find(p => p.id === id);
        if (page) setActiveId(id);
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

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
    <nav className="-mx-0.5 px-0.5 py-4 space-y-4">
      <button
        type="button" onClick={() => handleSidebarPageClick(homePage.id)}
        className={`flex w-full items-center gap-3 rounded-md px-3 py-1.5 text-left text-xs transition-colors shadow-none ${
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
      <header className="flex items-center justify-between gap-4 px-6 pt-8 md:px-12 md:pt-10">
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
          {!isMobile && (
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Docs
            </div>
          )}
        </div>
      </header>

      <StickyNav />

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 pt-14 pb-24 md:grid-cols-[280px_1fr] md:px-12 md:pt-20">
        {}
        <aside className="hidden md:block md:sticky md:top-28 md:h-[calc(100vh-8rem)] md:overflow-y-auto md:overflow-visible after:pointer-events-none after:sticky after:bottom-0 after:z-20 after:block after:h-10 after:bg-gradient-to-t after:from-background after:to-transparent before:pointer-events-none before:sticky before:top-0 before:z-20 before:block before:h-16 before:-mb-16 before:bg-gradient-to-b before:from-background before:to-transparent [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-foreground/15 [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-background [&::-webkit-scrollbar-thumb]:hover:bg-foreground/30">
          <div className="p-[5px] pr-2">
          <div className="sticky top-0 z-30 -mx-[5px] -mt-[5px] px-[5px] pt-[5px]">
            <div className="relative p-0.5">
              <input
                type="text"
                placeholder="Search docs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-hairline backdrop-blur-md bg-background/60 px-3 py-1 font-mono text-[10px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20"
              />
              {searchQuery && (
              <div className="absolute top-full mt-2 left-3 w-[calc(100%-22px)] bg-background border border-hairline rounded-xl shadow-2xl max-h-48 overflow-y-auto z-50">
                  {searchResults.length === 0 ? (
                    <div className="p-3 text-[10px] text-muted-foreground font-mono">No results found</div>
                  ) : (
                    <div className="divide-y divide-hairline">
                      {searchResults.slice(0, 8).map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setSearchQuery("");
                            setSidebarOpen(false);
                            handleSidebarPageClick(p.id);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-foreground/5 transition-colors"
                        >
                          <div className="text-[11px] font-medium text-foreground">{p.title}</div>
                          <div className="text-[9px] text-muted-foreground line-clamp-1">{p.summary}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="mt-0">
            {sidebarNav}
          </div>
          </div>
        </aside>

        {}
        <div
          aria-hidden={!sidebarOpen}
          {...(!sidebarOpen ? { inert: true } : {})}
          className={`fixed inset-0 z-60 md:hidden transition-all duration-300 ${
            sidebarOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className={`absolute left-0 top-0 flex h-full w-72 max-w-[85vw] flex-col bg-background border-r border-hairline shadow-2xl transition-transform duration-300 ease-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}>
          <div className="border-b border-hairline px-4 pt-4 pb-3 space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search docs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-hairline bg-background px-3 py-1 font-mono text-[10px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20"
              />
              {searchQuery && (
                <div className="absolute top-full mt-2 left-2 w-[calc(100%-16px)] bg-background border border-hairline rounded-xl shadow-2xl max-h-64 overflow-y-auto z-50">
                  {searchResults.length === 0 ? (
                    <div className="p-3 text-[10px] text-muted-foreground font-mono">No results found</div>
                  ) : (
                    <div className="divide-y divide-hairline">
                      {searchResults.slice(0, 8).map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setSearchQuery("");
                            setSidebarOpen(false);
                            handleSidebarPageClick(p.id);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-foreground/5 transition-colors"
                        >
                          <div className="text-[11px] font-medium text-foreground">{p.title}</div>
                          <div className="text-[9px] text-muted-foreground line-clamp-1">{p.summary}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Documentation</span>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close docs navigation"
                className="flex h-7 w-7 items-center justify-center rounded-full text-foreground/60 transition-colors hover:bg-foreground/10 hover:text-foreground"
              >
                <i className="bi bi-x text-sm" aria-hidden />
              </button>
            </div>
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
                {section.button && (
                  <a
                    href={section.button.href}
                    download
                    className="inline-flex items-center gap-2 rounded-full border border-hairline px-5 py-2.5 text-sm font-medium transition-colors hover:bg-foreground hover:text-background"
                  >
                    <i className={section.button.icon} aria-hidden />
                    {section.button.label}
                  </a>
                )}
              </div>
            ))}
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}