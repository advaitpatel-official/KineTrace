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
    name: "Signal Ingest",
    tag: "Phase 01",
    desc: "Import raw tri-axial accelerometer + gyroscope data via CSV, TXT, or JSON files. The parser auto-detects column headers (ax, ay, az, gx, gy, gz) and timestamps.",
    meta: ["Source — UCI HAR + MotionSense", "Rate — 50 Hz", "Format — CSV / TXT / JSON"],
  },
  {
    name: "Magnitude Vectorization",
    tag: "Phase 02",
    desc: "Collapse 3D axes into a single orientation-invariant Euclidean norm. This strips device orientation dependencies, making sensor data comparable regardless of how the device is worn.",
    meta: ["Formula — √(x² + y² + z²)", "Invariance — Device pose independent", "Output — 1D magnitude signal"],
  },
  {
    name: "Pagination & Filtering",
    tag: "Phase 03",
    desc: "Browse the dataset in pages of configurable size (10–200 rows). Apply an acceleration magnitude threshold to filter out noise below a specified g-force floor.",
    meta: ["Default — 50 rows/page", "Filter — Cutoff threshold slider", "Navigation — First / Prev / Next / Last"],
  },
  {
    name: "Signal Processing",
    tag: "Phase 04",
    desc: "Choose from 8 signal processors (Butterworth, Chebyshev, Bessel, Median, Gaussian, Kalman, Savitzky-Golay, Wavelet) that modify how jerk and variance metrics are computed per window.",
    meta: ["Processors — 8 types", "Jerk scaling — 0.5× to 1.25×", "Variance shift — -0.18 to +0.08"],
  },
  {
    name: "KSI Scoring Engine",
    tag: "Phase 05",
    desc: "The KineTrace Stability Index (KSI) is computed deterministically per 2.56-second window: KSI = max(0, 100 - (50 × mean_abs_jerk + 20 × std_dev)). Higher scores indicate more stable, fluid movement.",
    meta: ["Range — 0 (chaotic) to 100 (fluid)", "Weights — 50·Jerk + 20·Std", "States — Optimal / Degraded / Critical"],
  },
  {
    name: "Analytics & Export",
    tag: "Phase 06",
    desc: "The analyzer provides three views: the raw telemetry log table, windowed analytics with per-window KSI/jerk/variance breakdown, and a summary dashboard with aggregate stats. Export waveforms as PNG/SVG, data as JSON/CSV, or reports as plain text.",
    meta: ["Export — PNG / SVG / JSON / CSV / TXT", "Views — Log / Analytics / Summary", "Visualizations — Waveform, 3D Mesh, Histogram, FFT"],
  },
];

const capabilities = [
  { n: "01", title: "Orientation invariance", body: "The Euclidean magnitude transform strips device orientation dependencies. A phone in your pocket, a watch on your wrist, or a sensor on your waist all produce comparable signals." },
  { n: "02", title: "Real-time pagination", body: "Browse datasets of 10,000+ rows without performance degradation. The pagination system loads 50 rows at a time with configurable page size and first/prev/next/last navigation." },
  { n: "03", title: "Clinical KSI with 3-state classification", body: "Each analysis window receives a KSI score (0–100) and a stability classification: Optimal (>75), Degraded (40–75), or Critical (<40). Color-coded badges make interpretation instant." },
  { n: "04", title: "8 signal processors", body: "Choose from Butterworth lowpass, Chebyshev highpass, Bessel bandpass, Median filter, Gaussian smooth, Kalman filter, Savitzky-Golay, and Wavelet denoise — each with a unique effect on jerk/variance computations." },
  { n: "05", title: "Interactive visualizations", body: "Explore your data through a live waveform canvas with scrubber, a 3D orientation mesh cube driven by pitch/roll/yaw, a magnitude histogram, and an FFT frequency spectrum — all toggleable." },
  { n: "06", title: "Multi-format export", body: "Export the waveform graph as PNG or SVG, download the raw dataset as JSON, generate a data collection template CSV, or output a full analytics report as plain text." },
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
              Quantifying human movement stability from ordinary wearable sensors
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
              <h2 className="font-display text-4xl md:text-5xl">Capabilities</h2>
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
              “Stripping the axes and scoring the jerk turned messy phone data
              into a single number a clinician can actually reason about.”
            </blockquote>
            <div className="md:col-span-4 self-end font-mono text-xs text-muted-foreground">
              Design note — KineTrace research log
            </div>
          </div>
        </section>

        <section id="ksi" className="scroll-mt-24 px-6 pt-32 pb-12 md:px-12 md:pb-16">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-display text-4xl md:text-5xl">Try the KSI</h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Live Prototype Available
              </span>
            </div>
            <p className="mt-4 max-w-2xl text-foreground/75">
              The public analyzer workspace is live. Upload a short accelerometer + gyroscope
              capture log to receive instant activity classifications, telemetry breakdowns,
              and full KineTrace Stability Index metrics.
            </p>

            <div className="mt-10 glass rounded-3xl p-6 md:p-10">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
                <div className="md:col-span-7">
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Interactive Workspace Node
                  </div>
                  <h3 className="mt-3 font-display text-3xl md:text-4xl">
                    Drop a sensor capture, receive a score.
                  </h3>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Link
                      to="/analyzer"
                      className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-transform hover:-translate-y-0.5"
                    >
                      <i className="bi bi-box-arrow-up-right" aria-hidden />
                      Launch the analyzer
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
                        <div className="text-[9px] text-muted-foreground uppercase tracking-wider">KSI Score</div>
                        <div className="mt-1 font-display text-3xl tabular-nums" style={{ color: "var(--color-foreground)" }}>{demoOutput.ksi}</div>
                      </div>
                      <div className="rounded-lg border border-hairline p-3 font-mono bg-background/20">
                        <div className="text-[9px] text-muted-foreground uppercase tracking-wider">State</div>
                        <div className="mt-1">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-500">{demoOutput.state}</span>
                        </div>
                      </div>
                    </div>

                    {}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
                        <span>Jerk</span>
                        <span className="text-foreground/80 font-medium">{demoOutput.jerk.toFixed(2)} m/s³</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
                        <span>Variance</span>
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
                        <span>chaotic 0</span>
                        <span className="text-foreground/80">{demoOutput.ksi} KSI</span>
                        <span>100 fluid</span>
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
              If you're a clinical researcher, biomechanics lab, or wearable
              team who wants early access to the KSI analyzer, drop a line.
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