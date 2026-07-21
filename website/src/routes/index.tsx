import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Preloader } from "@/components/Preloader";
import { StickyNav } from "@/components/StickyNav";
import { HeroCarousel } from "@/components/HeroCarousel";

export const Route = createFileRoute("/")({
  component: Index,
});

const phases = [
  {
    name: "Load Your Data",
    tag: "Step 01",
    desc: "Upload a CSV, TXT, or JSON file from any device that records movement — like a phone, smartwatch, or motion sensor. The system automatically finds the right columns (ax, ay, az, gx, gy, gz).",
    meta: ["Works with — UCI HAR + MotionSense datasets", "Sample rate — 50 readings per second", "File types — CSV / TXT / JSON"],
  },
  {
    name: "Make It Orientation-Free",
    tag: "Step 02",
    desc: "Phone in your pocket? Watch on your wrist? Sensor on your waist? We combine the X, Y, and Z axes into one single value using a simple math formula. This removes device orientation so the data is comparable no matter how you wear it.",
    meta: ["Formula — √(x² + y² + z²)", "Why — orientation doesn't matter anymore", "Result — one clean signal instead of three"],
  },
  {
    name: "Browse & Filter Your Data",
    tag: "Step 03",
    desc: "Scroll through your data 50 rows at a time. Use the slider to ignore tiny movements below a certain strength — this filters out noise so only meaningful motion is analyzed.",
    meta: ["Default view — 50 rows per page", "Filter slider — set a minimum g-force", "Navigation — jump to first / previous / next / last page"],
  },
  {
    name: "Choose a Processing Filter",
    tag: "Step 04",
    desc: "Pick from 8 different filters that clean up your signal and highlight different types of movement. Each filter changes how we calculate 'jerk' (how suddenly movement changes) and 'variance' (how spread out the movement is).",
    meta: ["Filters available — 8 types", "Jerk scaling — 0.5× to 1.25×", "Variance shift — -0.18 to +0.08"],
  },
  {
    name: "Get Your Stability Score",
    tag: "Step 05",
    desc: "Every 2.56-second chunk of data gets a KSI score from 0 to 100. The formula is: KSI = max(0, 100 - (50 × average jerk + 20 × standard deviation)). A high score means smooth, stable movement. A low score means shaky or chaotic movement.",
    meta: ["Score range — 0 (very unsteady) to 100 (very steady)", "Formula weighs — jerk (suddenness) and std (spread)", "Results labeled — Optimal / Degraded / Critical"],
  },
  {
    name: "Explore & Export Results",
    tag: "Step 06",
    desc: "View your data three ways: (1) the raw numbers table, (2) a breakdown window-by-window with KSI scores, jerk, and variance, and (3) a summary dashboard with overall stats. Export charts as images, data as JSON/CSV, or a full report as a text file.",
    meta: ["Export — PNG / SVG / JSON / CSV / TXT", "Views — Raw log / Per-window analytics / Summary", "Visuals — Waveform graph, 3D orientation cube, histogram, frequency spectrum"],
  },
];

const capabilities = [
  { n: "01", title: "Works with any device orientation", body: "Whether your sensor is in a pocket, on a wrist, or clipped to a belt, the math strips away orientation differences. All movement data becomes comparable." },
  { n: "02", title: "Fast browsing for large datasets", body: "Scroll through 10,000+ rows of data smoothly. The system only loads 50 rows at a time, with easy navigation to jump anywhere." },
  { n: "03", title: "A stability score you can understand", body: "Each chunk of movement gets a single number from 0–100 and a color-coded label: Optimal (green), Degraded (yellow), or Critical (red). No complex charts to decode." },
  { n: "04", title: "8 ways to clean up your signal", body: "Different filters highlight different types of movement. Butterworth smooths noise. Kalman adapts to changing conditions. Wavelet removes multi-layered interference. Pick what works for your data." },
  { n: "05", title: "See your movement from every angle", body: "Watch the live waveform as it plays back. See a 3D cube rotate based on your sensor's pitch and roll. View histograms and frequency spectrums — all toggleable on and off." },
  { n: "06", title: "Save and share your work", body: "Export the waveform as an image (PNG or SVG), download your full dataset as JSON, get a template for collecting new data, or generate a plain-text analytics report." },
];

const demoOutput = {
  label: "Walking",
  ksi: 88,
  jerk: 0.12,
  variance: 0.021,
  state: "Optimal" as const,
  color: "bg-emerald-500/10 text-emerald-500" as const
};

function Index() {
  useEffect(() => {
    const cleanUrl = window.location.pathname + window.location.search;
    if (window.location.hash) window.history.replaceState(null, "", cleanUrl);

    let target: string | null = null;
    try {
      target = sessionStorage.getItem("kt-scroll-target");
      if (target) sessionStorage.removeItem("kt-scroll-target");
    } catch {}

    if (target) {
      setTimeout(() => {
        document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  return (
    <>
      <Preloader />
      <div className="relative min-h-screen bg-background text-foreground">

        <header className="px-6 pt-8 md:px-12 md:pt-10">
          <div className="font-mono text-xs tracking-tight">kinetrace</div>
        </header>

        <section id="overview" className="scroll-mt-24 px-6 pt-24 pb-16 md:px-12 md:pt-32 md:pb-24">
          <div className="mx-auto max-w-3xl text-center animate-fade-up">
            <h1 className="font-display text-5xl leading-[1.05] tracking-tight md:text-7xl">
              KineTrace<span className="align-super text-lg not-italic">®</span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-base leading-relaxed text-foreground/70 md:text-lg">
              Turn your phone or wearable into a movement stability tester. Upload sensor data, get a simple score.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/analyzer"
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-transform hover:-translate-y-0.5"
              >
                <i className="bi bi-box-arrow-up-right" aria-hidden />
                Open the app
              </Link>
              <a
                href="#method"
                className="inline-flex items-center gap-2 rounded-full border border-hairline px-5 py-2.5 text-sm font-medium transition-colors hover:bg-foreground hover:text-background"
              >
                How it works
              </a>
            </div>
          </div>
        </section>

        <StickyNav />

        <section className="px-6 pt-4 md:px-12">
          <div className="mx-auto max-w-6xl">
            <HeroCarousel />
          </div>
        </section>

        <section id="about" className="scroll-mt-24 px-6 pt-28 md:px-12">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display text-4xl md:text-5xl">What is KineTrace?</h2>
            <div className="mt-8 max-w-full space-y-4 text-base leading-relaxed text-foreground/80">
              <p>
                KineTrace is a tool that turns movement data from your phone, smartwatch, or wearable sensor into a simple stability score. Think of it like a fitness tracker, but instead of counting steps, it measures <strong>how steady or unsteady your movement is</strong>.
              </p>
              <p>
                You upload a recording of someone walking, standing, or moving — captured by any device with an accelerometer — and KineTrace analyzes the tiny details in their movement that are invisible to the human eye. It measures things like <strong>how suddenly they jerk</strong> (jerk) and <strong>how much their movement varies</strong> (variance).
              </p>
              <p>
                The result is a single score from 0 to 100. A high score means smooth, controlled movement. A low score means shaky or unstable movement that could signal a fall risk. <strong>Researchers and clinicians</strong> use this to detect instability early — before someone actually falls.
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground pt-2">
                Built on UCI HAR + MotionSense datasets · Research prototype
              </p>
            </div>
          </div>
        </section>

        <section id="method" className="scroll-mt-24 pt-28">
          <div className="mx-auto max-w-6xl px-6 md:px-12">
            <h2 className="font-display text-4xl md:text-5xl">How It Works</h2>
          </div>
          <div className="mt-10 hairline-t hairline-b">
            {phases.map((p) => (
              <Link
                key={p.name}
                to="/analyzer"
                className="group block w-full border-b border-hairline last:border-b-0 transition-colors hover:bg-foreground/4"
              >
                <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-6 py-8 md:grid-cols-12 md:gap-6 md:px-12 md:py-10">
                  <div className="md:col-span-4">
                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {p.tag}
                    </div>
                    <div className="mt-2 font-display text-3xl md:text-4xl">{p.name}</div>
                  </div>
                  <div className="md:col-span-6">
                    <p className="text-base leading-relaxed text-foreground/80 md:text-lg">
                      {p.desc}
                    </p>
                    <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs text-muted-foreground">
                      {p.meta.map((m) => (
                        <li key={m}>{m}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex items-start justify-end md:col-span-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-hairline transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                      <i className="bi bi-arrow-up-right text-[13px]" aria-hidden />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="px-6 pt-28 md:px-12">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 md:grid-cols-12">
            <div className="md:col-span-4">
              <h2 className="font-display text-4xl md:text-5xl">What It Can Do</h2>
            </div>
            <div className="md:col-span-8 divide-y divide-hairline hairline-t hairline-b">
              {capabilities.map((c) => (
                <div key={c.n} className="grid grid-cols-12 gap-4 py-6">
                  <div className="col-span-2 font-mono text-xs text-muted-foreground">{c.n}</div>
                  <div className="col-span-4 text-sm font-medium">{c.title}</div>
                  <p className="col-span-6 text-sm leading-relaxed text-foreground/75">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 pt-32 md:px-12">
          <div className="mx-auto max-w-6xl grid grid-cols-1 gap-10 md:grid-cols-12">
            <blockquote className="md:col-span-8 font-display text-3xl leading-[1.15] md:text-4xl">
              “We wanted a way to turn raw phone sensor data into something a doctor could actually use.
              KSI is that number — one score that tells you if movement is steady or not.”
            </blockquote>
            <div className="md:col-span-4 self-end font-mono text-xs text-muted-foreground">
              KineTrace research notes
            </div>
          </div>
        </section>

        <section id="ksi" className="scroll-mt-24 px-6 pt-32 pb-12 md:px-12 md:pb-16">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-display text-4xl md:text-5xl">Try It Now</h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                The Analyzer is Live
              </span>
            </div>
            <p className="mt-4 max-w-2xl text-foreground/75">
              No setup needed. Open the analyzer, upload a short movement recording from your phone or wearable, and get an instant stability score, activity classification, and full breakdown of your data.
            </p>

            <div className="mt-10 glass rounded-3xl p-6 md:p-10">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
                <div className="md:col-span-7">
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    A Live Example
                  </div>
                  <h3 className="mt-3 font-display text-3xl md:text-4xl">
                    Upload movement data, get a stability score back.
                  </h3>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Link
                      to="/analyzer"
                      className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-transform hover:-translate-y-0.5"
                    >
                      <i className="bi bi-box-arrow-up-right" aria-hidden />
                      Open the analyzer
                    </Link>
                  </div>
                </div>
                <div className="md:col-span-5">
                  {}
                  <div className="rounded-2xl border border-hairline bg-background/60 p-5 space-y-4">
                    {}
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium border border-hairline">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {demoOutput.label}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">window · 2.56s</span>
                    </div>

                    {}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg border border-hairline p-3 font-mono bg-background/20">
                        <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Stability Score</div>
                        <div className="mt-1 font-display text-3xl tabular-nums" style={{ color: "var(--color-foreground)" }}>{demoOutput.ksi}</div>
                      </div>
                      <div className="rounded-lg border border-hairline p-3 font-mono bg-background/20">
                        <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Status</div>
                        <div className="mt-1">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-500">{demoOutput.state}</span>
                        </div>
                      </div>
                    </div>

                    {}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
                        <span>Jerk (suddenness)</span>
                        <span className="text-foreground/80 font-medium">{demoOutput.jerk.toFixed(2)} m/s³</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
                        <span>Variance (spread)</span>
                        <span className="text-foreground/80 font-medium">{demoOutput.variance.toFixed(3)}</span>
                      </div>
                    </div>

                    {}
                    <div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-foreground/10">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${demoOutput.ksi}%`,
                            background: "var(--color-foreground)"
                          }}
                        />
                      </div>
                      <div className="mt-1 flex justify-between font-mono text-[9px] text-muted-foreground">
                        <span>very unsteady 0</span>
                        <span className="text-foreground/80">{demoOutput.ksi} KSI</span>
                        <span>100 very steady</span>
                      </div>
                    </div>

                    {}
                    <div className="flex items-center gap-2 text-[9px] font-mono text-muted-foreground pt-1 border-t border-hairline">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>ML Engine Connected</span>
                      <span className="ml-auto">{demoOutput.label} · LP filter</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="scroll-mt-24 px-6 pt-12 pb-16 md:px-12">
          <div className="mx-auto max-w-6xl">
            <p className="max-w-xl text-foreground/75">
              Are you a researcher, clinician, or someone working with movement data? If you'd like early access, have questions, or want to collaborate, reach out.
            </p>

            <div className="mt-16 hairline-t">
              <div className="grid grid-cols-12 gap-4 py-6">
                <div className="col-span-12 md:col-span-4 font-display text-4xl md:text-5xl">Profiles</div>
                <div className="col-span-6 md:col-span-4 self-end text-sm">
                  <a href="https://www.linkedin.com/in/advait-patel-a2a6323aa/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:underline">
                    <i className="bi bi-linkedin" aria-hidden /> LinkedIn
                  </a>
                </div>
                <div className="col-span-6 md:col-span-4 self-end text-sm">
                  <a href="https://github.com/advaitpatel-official/KineTrace" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:underline">
                    <i className="bi bi-github" aria-hidden /> GitHub
                  </a>
                </div>
              </div>
              <div className="hairline-t grid grid-cols-12 gap-4 py-6">
                <div className="col-span-12 md:col-span-4 font-display text-4xl md:text-5xl">Contact</div>
                <div className="col-span-6 md:col-span-4 self-end text-sm">
                  <a href="mailto:advait.patel@outlook.com" className="inline-flex items-center gap-2 hover:underline">
                    <i className="bi bi-envelope" aria-hidden /> advait.patel@outlook.com
                  </a>
                </div>
                <div className="col-span-6 md:col-span-4 self-end text-sm">
                  <a href="https://advaitpatel.netlify.app/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:underline">
                    <i className="bi bi-box-arrow-up-right" aria-hidden /> Developer Website
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="px-6 pb-6 md:px-12">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-md text-xs text-muted-foreground">
                © KineTrace {new Date().getFullYear()}. Research prototype.
                <br />
                Built on blended UCI HAR + MotionSense corpora.
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground md:text-right">
                v0.1 · experimental
              </div>
            </div>
            <svg
              aria-hidden
              viewBox="0 0 1000 220"
              preserveAspectRatio="xMidYMid meet"
              className="mt-8 block w-full select-none"
            >
              <text
                x="500"
                y="180"
                textAnchor="middle"
                textLength="1000"
                lengthAdjust="spacingAndGlyphs"
                fontFamily="Inter, sans-serif"
                fontWeight={600}
                fontSize={220}
                letterSpacing="-8"
                fill="currentColor"
              >
                kinetrace
              </text>
            </svg>
          </div>
        </footer>
      </div>
    </>
  );
}