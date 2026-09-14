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
  summary: "KineTrace helps you understand how steady or unsteady your movement is — using nothing more than your phone.",
  icon: "bi-shield-check",
  body: [
    {
      heading: "What is KineTrace?",
      copy: [
        "KineTrace is a tool that turns your phone or smartwatch into a movement health tracker. It analyzes how you walk, stand, and move, then gives you a simple score from 0 to 100 that tells you how steady or unsteady your movement is. Think of it like a check engine light for your body — it doesn't tell you what's wrong, but it lets you know when something might need attention.",
        "There are two ways to use KineTrace, depending on your comfort level:",
        "1. The KineTrace Mobile App (iOS & Android) — This is the easiest way. Download the app, put your phone in your pocket, take a short walk, and you'll get your stability score instantly. The app handles everything — collecting your movement data, analyzing it, and showing you easy-to-understand results. No technical knowledge needed. It's designed for anyone who wants to check in on their movement health.",
        "2. The Web Analyzer (this website) — This is a more advanced tool designed for clinicians, researchers, fitness professionals, and anyone who already understands movement data. It gives you detailed charts, filters, and raw data views. You'll need to record your movement separately (using a sensor app) and upload the file. If you're a healthcare professional running assessments or a researcher analyzing movement patterns, this is the tool for you.",
        "Both tools use the same core analysis engine. The difference is simply how you interact with them — the mobile app is designed for simplicity, the web analyzer is designed for depth.",
      ],
    },
    {
      heading: "CSI vs. KSI — Two Scores, One Purpose",
      copy: [
        "KineTrace shows you two related scores, and understanding the difference is simpler than it sounds:",
        "CSI (Current Stability Index) — This is how you're moving right now. It measures your current movement and gives you a score based on what's happening in this moment. A high score means smooth, steady movement right now.",
        "KSI (KineTrace Stability Index) — This is where you're heading. It looks at your current movement but also checks for subtle signs that things might be getting worse. If your movement shows early warning signs of instability, KSI will be lower than CSI — giving you an early heads up before a problem becomes obvious.",
        "Think of it like this: CSI is how you're moving today. KSI is where you're heading tomorrow.",
        "Both scores go from 0 to 100. Higher is better. The mobile app and web analyzer both show you these scores clearly.",
      ],
    },
    {
      heading: "The Main Number: The Stability Score",
      copy: [
        "The stability score (KSI) is the most important number you'll see. It's a score from 0 to 100, color-coded so you can understand it at a glance:",
        "• 75–100 = Green (Optimal) — Smooth, controlled movement. Low risk.",
        "• 40–75 = Yellow (Degraded) — Some irregularity detected. Moderate risk.",
        "• 0–40 = Red (Critical) — Significant instability. High risk.",
        "The score is calculated by looking at two things: how suddenly your movement changes (jerk) and how much your movement varies from moment to moment (variance). Steady walking has low jerk and low variance. Shaky movement has high jerk and high variance.",
        "The mobile app shows you this score in a simple, friendly interface. The web analyzer shows you the same score but also gives you deeper insights and controls if you want them.",
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
        summary: "If you're using the web analyzer, KineTrace accepts CSV, TXT, and JSON files. The system automatically finds the right columns in your file.",
        icon: "bi-file-earmark-text",
        body: [
          {
            heading: "CSV and TXT Files",
            copy: [
              "Your file's first row should be a header row with column names. The system looks for these column names (they are not case-sensitive):",
              "Required: ax, ay, az — acceleration measurements.",
              "Optional (but helpful): timestamp_ms (the time of each reading), gx, gy, gz (gyroscope data), magnitude (if you've already calculated it).",
              "If you don't include timestamps, the system automatically creates them, spacing each reading 20 milliseconds apart.",
              "If you don't include magnitude, the system calculates it automatically.",
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
              "On the web analyzer page, click 'Download Template' in the 'Data Collection Tool' section. This gives you a CSV with the correct headers and example rows. Use this to format your own data correctly.",
              "There's also a 'Get Sample' button that downloads a short sample dataset from the server for testing.",
              "The web analyzer also comes with built-in example data — you can start exploring immediately without uploading anything.",
            ],
          },
        ],
      },
      {
        id: "pagination",
        title: "Browsing Your Data",
        eyebrow: "Loading Data",
        summary: "The web analyzer shows your data one page at a time. You can change how many rows appear per page and jump around the dataset.",
        icon: "bi-layout-three-columns",
        body: [
          {
            heading: "How Browsing Works",
            copy: [
              "Your data is divided into pages. 50 rows are shown by default, but you can change this using the slider (from 10 to 200 rows at a time).",
              "Use the navigation buttons to move around: First page, Previous page, Next page, Last page. The current page number is shown in the middle.",
              "Note: Changing the page size or applying a filter will reset you back to page 1.",
            ],
          },
        ],
      },
      {
        id: "getting-data",
        title: "Getting Movement Data",
        eyebrow: "Loading Data",
        summary: "The easiest way to get movement data is with the KineTrace mobile app. For the web analyzer, you'll need to record your movement using a sensor app.",
        icon: "bi-phone",
        body: [
          {
            heading: "The Easiest Way: Use the KineTrace Mobile App",
            copy: [
              "The KineTrace mobile app for iOS and Android is the simplest way to use this tool. Just download the app, put your phone in your pocket, and take a short walk. The app records your movement, analyzes it, and shows you your stability score — all in one place. No files to upload, no settings to configure. It's designed for anyone who wants to understand their movement health without any technical hassle.",
              "The mobile app is perfect for: checking your own stability at home, tracking changes over time, sharing results with your doctor, and getting peace of mind for yourself or a loved one.",
            ],
          },
          {
            heading: "For the Web Analyzer: Recording Movement Data",
            copy: [
              "If you're using the web analyzer (designed for clinicians, researchers, and experienced users), you'll need to record your movement data separately and upload it. Any smartphone, smartwatch, or fitness tracker with an accelerometer can record the data KineTrace needs.",
              "The easiest way to record is by downloading a sensor recording app like 'Physics Toolbox Sensor Suite' (Android and iOS) or 'Sensor Logger'. These apps can record accelerometer data and export it as a CSV file. Just place the phone in someone's pocket or hold it against their body while they walk, stand, or move.",
              "Your file needs at least three columns: ax, ay, az (the acceleration in the X, Y, and Z directions). A timestamp_ms column is optional but helpful. Most sensor apps can export this format directly.",
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
        summary: "Practical ways to use KineTrace — whether you're checking your own stability, tracking recovery, or helping someone you care about.",
        icon: "bi-globe",
        body: [
          {
            heading: "Checking Your Own Movement Health",
            copy: [
              "The simplest use: download the KineTrace mobile app, put your phone in your pocket, and take a walk. You'll get your stability score immediately. Do this once a week to track how your movement changes over time. If your score starts dropping, it might be a sign to talk to your doctor. It's like checking your blood pressure — but for how you move.",
            ],
          },
          {
            heading: "Keeping an Eye on a Loved One",
            copy: [
              "Worried about an aging parent or relative? Have them take a short walk with the KineTrace app once a week. The app gives you an objective, repeatable measurement that's much more sensitive than just watching someone move. If you see their score trending down over several weeks, it might be time to have a conversation with their healthcare provider.",
            ],
          },
          {
            heading: "Tracking Recovery After an Injury or Surgery",
            copy: [
              "After a leg injury, hip replacement, or stroke, recovery can be hard to measure. KineTrace lets you track your progress objectively. Record a walk each week and watch your score improve over time. A rising score means your rehabilitation is working. You can share these results with your physical therapist or doctor.",
            ],
          },
          {
            heading: "Monitoring Medication Effects",
            copy: [
              "For conditions that affect movement — like Parkinson's disease, multiple sclerosis, or vertigo — KineTrace can help you and your doctor understand whether treatment is working. Record your movement before and after medication. If your score improves, the treatment is helping. This gives you objective data to share with your healthcare team.",
            ],
          },
          {
            heading: "For Researchers and Clinicians",
            copy: [
              "The web analyzer provides deeper tools for running formal assessments: comparing different conditions, surfaces, or shoes; monitoring patients remotely; conducting research trials; and generating detailed reports. The KineTrace mobile app is also being used in research studies as a simple, standardized way to collect movement data from participants.",
            ],
          },
        ],
      },
      {
        id: "for-trial-holders",
        title: "For Trial Holders",
        eyebrow: "Use Cases",
        summary: "Guidelines for researchers and clinicians running formal studies with KineTrace — consent, safety, and data sharing.",
        icon: "bi-clipboard-check",
        body: [
          {
            heading: "Running a Study Safely",
            copy: [
              "If you're conducting a research trial or clinical study using KineTrace, participant safety and proper consent are essential. Before collecting any data, make sure every participant has signed the KineTrace Trial Collection Waiver. Keep a signed copy on file for your records.",
              "All participants should be informed that KineTrace is a research prototype and not a medical device. They should understand that the tool does not provide medical diagnoses and that they should consult a healthcare professional for any medical concerns.",
              "Data collection should take place in a safe environment. Participants should be supervised during physical activities. Make sure first aid is available and that participants are physically able to perform the requested movements without risk of injury.",
            ],
          },
          {
            heading: "When Your Study Is Complete",
            copy: [
              "When your trial is complete, email your anonymized dataset and a brief summary to advait.patel@outlook.com. Please include:",
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
              "If you're interested in running your own trial or collaborating on a research study, reach out directly at advait.patel@outlook.com to discuss trial setup, access to additional documentation, and any custom requirements for your study.",
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
              "The noise floor filter removes tiny movements that are too small to be meaningful. This gets rid of minor vibrations and sensor noise that can interfere with your analysis.",
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
        summary: "Choose from 8 filters that change how your movement data is processed. Each filter highlights different aspects of movement.",
        icon: "bi-gear",
        body: [
          {
            heading: "Understanding Filters (Simplified)",
            copy: [
              "Think of filters like different lenses on a camera. Each lens shows you a different view of the same movement. The web analyzer lets you choose from 8 filters, each designed to highlight different aspects of movement:",
              "• Lowpass (LP) — The default. Smooths out noise for general-purpose analysis.",
              "• Highpass (HP) — Emphasizes sudden, jerky movements. Good for detecting tremors.",
              "• Bandpass (BP) — Focuses on the typical frequency of walking and running. Good for gait analysis.",
              "• Median (MED) — Removes sudden spikes while keeping the overall signal shape intact.",
              "• Gaussian (GAUSS) — The most aggressive smoothing. Produces the cleanest signal.",
              "• Kalman (KALM) — Adapts to changing conditions. Great for real-time applications.",
              "• Savitzky-Golay (S-G) — Preserves the natural shape of peaks and valleys while smoothing noise.",
              "• Wavelet (WAV) — Breaks the signal into different frequency bands and removes noise from each one separately.",
            ],
          },
          {
            heading: "How Filters Affect Your Score",
            copy: [
              "Different filters can produce different stability scores. Filters that emphasize sudden movements (like HP) will typically produce lower scores. Filters that smooth the data (like GAUSS) will typically produce higher scores. The default filter (LP) works well for most situations.",
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
        summary: "The waveform shows your movement data as colored lines. Each color represents a different direction of movement.",
        icon: "bi-activity",
        body: [
          {
            heading: "What You're Seeing",
            copy: [
              "The waveform shows how your acceleration changes over time. Each colored line represents a different direction of movement. The purple line is the total combined strength of all directions.",
              "A white dashed vertical line marks the frame you currently have selected. You can click any row in the data table below to jump to that frame.",
            ],
          },
          {
            heading: "Controlling the View",
            copy: [
              "You can zoom into a specific range of frames by typing start and end frame numbers in the boxes above the graph. Click 'Reset' to go back to the default view.",
              "Use the playback controls to animate through frames: Play/Pause, Skip-to-Start, speed selector, and a scrubber slider to manually drag through frames.",
            ],
          },
        ],
      },
      {
        id: "kpi-cards",
        title: "Key Metrics Explained",
        eyebrow: "Using the Analyzer",
        summary: "The cards at the top of the web analyzer show important numbers. Here's what each one means.",
        icon: "bi-speedometer2",
        body: [
          {
            heading: "Understanding the Metrics",
            copy: [
              "The web analyzer shows several key numbers at a glance. Here's what they mean:",
              "Stability Score (CSI) — The average current stability score across all your data. 0–100. Higher is better.",
              "Predictive Risk (KSI) — The KineTrace Stability Index. This is the number that tells you about future risk. The mobile app uses this same score.",
              "Risk Level — A colored badge: Low (green), Moderate (yellow), Elevated (orange), or High (red).",
              "Peak Jerk — How abruptly movement changes. Higher values mean more sudden movements.",
              "Peak Acceleration — The strongest acceleration detected in your data.",
              "Filter Label — Shows which signal processing filter is currently active.",
            ],
          },
        ],
      },
      {
        id: "ksi-gauge",
        title: "Stability Gauge",
        eyebrow: "Using the Analyzer",
        summary: "The gauge bar shows the stability score visually, with color coding for quick interpretation.",
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
              "Green dot = The analysis engine is connected and working. Yellow pulsing dot = The engine is starting up. Red dot = The engine is offline.",
              "If the engine is offline, don't worry — KineTrace still works. It falls back to local calculations in your browser, so you'll still get accurate stability scores.",
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
              "The cube rotates based on the sensor's tilt in different directions. It shows you how the device was oriented when the movement was recorded. This is useful for understanding how the device's position affects the data.",
              "The colored indicators help you visualize: pitch (forward/backward tilt), roll (side-to-side tilt), and overall acceleration strength.",
            ],
          },
        ],
      },
      {
        id: "window-selection",
        title: "Window Selection & Filtering",
        eyebrow: "Using the Analyzer",
        summary: "Select individual time windows in the Analytics tab to focus your analysis on specific periods of movement.",
        icon: "bi-check2-square",
        body: [
          {
            heading: "How Window Selection Works",
            copy: [
              "In the Analytics tab, each window row has a small circular selection control on the left. Click any window row to select it. You can select multiple windows.",
              "Once you select one or more windows, the rest of the analyzer updates to show only the data from those windows — the log table, the waveform, the summary statistics, and the visualizations all update automatically.",
              "Click the Reset button to clear your selection and return to viewing all data.",
              "This is useful for isolating a specific movement pattern — for example, selecting only the windows where the person was walking.",
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
            heading: "Histogram",
            copy: [
              "Shows how your acceleration values are spread out. Taller bars show values that appear more often. A narrow peak means consistent, steady movement. A wide spread means varied, changing movement.",
            ],
          },
          {
            heading: "Frequency Spectrum",
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
              "Click 'Export Report' to generate a plain text summary of all your analytics: frame count, stability score, jerk, variance, stability assessment, and more.",
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
              "Each row is one sensor reading. Columns show: a selection dot (click to select a frame), Time (ms), the three acceleration axes, and total magnitude.",
              "Click any row to select that frame — the waveform and 3D cube update instantly.",
            ],
          },
        ],
      },
      {
        id: "analytics-tab",
        title: "Analytics (Per-Window Breakdown)",
        eyebrow: "The Three Tabs",
        summary: "Shows your data broken into chunks, each with its own stability score and classification.",
        icon: "bi-window-stack",
        body: [
          {
            heading: "Window-by-Window Analysis",
            copy: [
              "Your data is divided into short windows. Each window gets its own analysis with these details:",
              "Window ID — Unique label for each window.",
              "Time — The end timestamp of this window.",
              "Activity — What the system predicts is happening (Walking, Sitting, Standing, Stairs).",
              "KSI — The stability score for this window (0–100).",
              "Jerk — How abruptly movement changes.",
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
        summary: "Shows overall statistics: average stability score, counts of each state, and the most common activity.",
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
        summary: "KineTrace has a server that provides enhanced analysis. The web analyzer works fine with or without it.",
        icon: "bi-cloud",
        body: [
          {
            heading: "Do You Need the Server?",
            copy: [
              "No. The web analyzer works entirely in your browser using local calculations. The server provides additional features like activity classification and more detailed predictions.",
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
              "Data analysis: /api/ingest — Upload a CSV file and get activity predictions, stability scores, and more.",
              "Sample data: /api/export/csv — Download a sample CSV.",
              "Real-time: /api/ws — WebSocket connection for streaming analysis.",
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
    importing: true, usecases: true, processing: true, analyzer: true, exporting: true, tabs: true, backend: true
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
        <aside className="hidden md:block md:sticky md:top-28 md:h-[calc(100vh-8rem)] md:overflow-y-auto md:overflow-visible after:pointer-events-none after:sticky after:bottom-0 after:z-20 after:block after:h-10 after:bg-linear-to-t after:from-background after:to-transparent before:pointer-events-none before:sticky before:top-0 before:z-20 before:block before:h-16 before:-mb-16 before:bg-linear-to-b before:from-background before:to-transparent [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-foreground/15 [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-background [&::-webkit-scrollbar-thumb]:hover:bg-foreground/30">
          <div className="p-1.25 pr-2">
          <div className="sticky top-0 z-30 -mx-1.25 -mt-1.25 px-1.25 pt-1.25">
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