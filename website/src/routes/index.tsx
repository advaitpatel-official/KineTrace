import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Preloader } from "@/components/Preloader";
import { StickyNav } from "@/components/StickyNav";
import { HeroCarousel } from "@/components/HeroCarousel";
import { Footer } from "@/components/Footer";
import { ContactSection } from "@/components/ContactSection";

export const Route = createFileRoute("/")({
  component: Index,
});

const phases = [
  {
    name: "Take a Walk",
    tag: "Step 01",
    desc: "Put your phone in your pocket or strap on your smartwatch. Go for a walk, climb some stairs, or just stand still. KineTrace works with any device you already own — no special equipment needed.",
    meta: ["Works with any phone or smartwatch", "No setup required", "Just move naturally"],
  },
  {
    name: "We Analyze Your Movement",
    tag: "Step 02",
    desc: "Behind the scenes, KineTrace looks at the tiny details in your movement that are invisible to the human eye. It measures how smooth or shaky your steps are, how balanced you are, and how your body responds to different surfaces and activities.",
    meta: ["Advanced analysis in seconds", "No technical knowledge needed", "Fully automatic"],
  },
  {
    name: "Get Your Stability Score",
    tag: "Step 03",
    desc: "You get one simple number from 0 to 100. A high score means steady, confident movement. A low score means your movement might be shaky or unsteady. It's like a fitness score, but for how well you move and balance.",
    meta: ["Score range — 0 (unsteady) to 100 (very steady)", "Color-coded results — green / yellow / red", "Easy to understand at a glance"],
  },
  {
    name: "See What Your Body Is Telling You",
    tag: "Step 04",
    desc: "KineTrace shows you your movement in beautiful, simple visuals. Watch your steps in real-time, see how your balance changes throughout the day, and spot trends you never noticed before. All of it designed to be clear and easy to understand.",
    meta: ["Simple visual charts", "Real-time feedback", "Spot trends over time"],
  },
  {
    name: "Share With Confidence",
    tag: "Step 05",
    desc: "Want to show your doctor, your physical therapist, or a family member? Export a simple report they can understand. No confusing data — just clear information about your movement health that anyone can read.",
    meta: ["Export reports as PDF or images", "Share with your healthcare provider", "Track your progress over time"],
  },
  {
    name: "Stay Proactive",
    tag: "Step 06",
    desc: "Your body changes over time. KineTrace helps you stay on top of your movement health so you can catch changes early. Whether you're recovering from an injury, managing a condition, or just want to stay active as you age, KineTrace gives you the insight you need.",
    meta: ["Track changes over weeks and months", "Catch issues early", "Stay confident and independent"],
  },
];

const capabilities = [
  { n: "01", title: "Works with what you already have", body: "Any phone, smartwatch, or wearable will do. No special equipment, no expensive sensors, no complicated setup. Just put it in your pocket and go." },
  { n: "02", title: "Results you can actually understand", body: "Forget confusing charts and technical jargon. You get a simple score from 0 to 100 with a clear color — green means steady, yellow means caution, red means it's time to talk to someone." },
  { n: "03", title: "Peace of mind for you and your family", body: "If you're worried about a loved one's balance, KineTrace gives you honest, objective feedback. No guesswork, no gut feelings — just real data about how they're moving." },
  { n: "04", title: "Your privacy matters", body: "Your movement data stays on your device. You choose what to share and with whom. No accounts, no sign-ups, no data collection — just you and your results." },
  { n: "05", title: "See your progress over time", body: "Take a walk today, another one next week, and another one next month. KineTrace shows you how your movement is changing, so you can celebrate improvements or take action early." },
  { n: "06", title: "Free and open for everyone", body: "KineTrace is completely free to use. No subscriptions, no hidden fees, no premium features locked behind a paywall. Movement health should be accessible to everyone." },
];

const demoOutput = {
  label: "Walking",
  ksi: 88,
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
              Your phone already knows how you move. KineTrace helps you understand what it means — so you can stay steady, confident, and in control.
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
            <h2 className="font-display text-4xl md:text-5xl">Why KineTrace?</h2>
            <div className="mt-8 max-w-full space-y-4 text-base leading-relaxed text-foreground/80">
              <p>
                Every day, your body tells a story. The way you walk, the way you stand, the way you climb a flight of stairs — it all says something about your health. But most of us never get to hear that story. We only notice when something goes wrong.
              </p>
              <p>
                KineTrace changes that. Using the sensors already built into your phone or smartwatch, KineTrace gives you a simple, honest look at how you move. No complicated charts. No confusing medical terms. Just a clear score that tells you if your movement is steady, shaky, or somewhere in between.
              </p>
              <p>
                Think of it like a check engine light for your body. It doesn't diagnose problems — it lets you know when something might need attention. <strong>Whether you're staying active, recovering from an injury, or just want peace of mind for yourself or a loved one, KineTrace puts the power of movement insight in your pocket.</strong>
              </p>
              <p>
                <strong>Important note:</strong> KineTrace is a research tool, not a medical device. It cannot diagnose conditions or replace a doctor's evaluation. Think of it as a friendly heads-up — a way to start a conversation with a healthcare professional if something seems off.
              </p>
            </div>

            {}
            <div className="w-full grid grid-cols-1 gap-10 md:grid-cols-2">
              <div className="mt-16 md:mt-0 hairline-t md:border-t-0 pt-10 flex flex-col">
                <h3 className="font-display text-2xl md:text-3xl">Built for Everyone</h3>
                <div className="mt-6 space-y-4 text-base leading-relaxed text-foreground/80 flex-1">
                  <p>
                    KineTrace is an open-source project made for anyone who wants to understand their movement health. Whether you're a fitness enthusiast tracking your recovery, someone caring for an aging parent, or just curious about what your phone can tell you — KineTrace is for you.
                  </p>
                  <p>
                    The project is completely free and open-source for non commercial use. No subscriptions, no data collection, no hidden agenda. We believe movement health information should be accessible to everyone, not just people with expensive equipment or medical training. The full license is available on GitHub and at the bottom of this website. 
                  </p>
                
                </div>
                <div className="mt-auto pt-4">
                  <div className="flex flex-wrap gap-4">
                    <a
                      href="https://github.com/advaitpatel-official/KineTrace"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-transform hover:-translate-y-0.5"
                    >
                      <i className="bi bi-github" aria-hidden />
                      View on GitHub
                    </a>
                    <a
                      href="/files/KineTrace_Project_Outline.pdf"
                      download
                      className="inline-flex items-center gap-2 rounded-full border border-hairline px-6 py-3 text-sm font-medium transition-colors hover:bg-foreground hover:text-background"
                    >
                      <i className="bi bi-file-earmark-pdf" aria-hidden />
                      Download Project Outline
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-16 md:mt-0 hairline-t md:border-t-0 pt-10 flex flex-col">
                <h3 className="font-display text-2xl md:text-3xl">Contribute</h3>
                <div className="mt-6 space-y-4 text-base leading-relaxed text-foreground/80 flex-1">
                  <p>
                    Interested in running KineTrace as part of a research trial or clinical study? We welcome collaboration from researchers, clinicians, and institutions.
                  </p>
                  <p>
                    If you want to conduct a formal trial using KineTrace, please review the guidelines below and reach out to advait.patel@outlook.com to discuss trial setup, access to additional documentation, and any custom requirements for your study. We'll help you get everything you need to run a safe, compliant data collection. We are always glad to collaborate with anyone so please do not hesitate to reach out.
                  </p>
                </div>
                <div className="mt-auto pt-4">
                  <a
                    href="/documentation"
                    className="inline-flex items-center gap-2 rounded-full border border-hairline px-5 py-2.5 text-sm font-medium transition-colors hover:bg-foreground hover:text-background"
                  >
                    <i className="bi bi-clipboard-check" aria-hidden />
                    Learn More
                  </a>
                </div>
              </div>
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
              <h2 className="font-display text-4xl md:text-5xl">Why People Love It</h2>
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
              "Movement is one of the most powerful signals our bodies give us. KineTrace makes that signal clear — so anyone can listen."
            </blockquote>
            <div className="md:col-span-4 self-end font-mono text-xs text-muted-foreground md:text-right">
             - KineTrace
            </div>
          </div>
        </section>

        <section id="ksi" className="scroll-mt-24 px-6 pt-32 pb-12 md:px-12 md:pb-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display text-4xl md:text-5xl">Try It Now</h2>
            <p className="mt-4 max-w-2xl text-foreground/75">
              No sign-up, no setup, no cost. Just grab your phone, take a short walk, and see your movement stability score in seconds. It's that simple.
            </p>

            <div className="mt-10 glass rounded-3xl p-6 md:p-10">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
                <div className="md:col-span-7">
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Ready When You Are
                  </div>
                  <h3 className="mt-3 font-display text-3xl md:text-4xl">
                    Upload a recording and see your score.
                  </h3>
                  <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
                    <Link
                      to="/analyzer"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-transform hover:-translate-y-0.5"
                    >
                      <i className="bi bi-box-arrow-up-right" aria-hidden />
                      Get your stability score
                    </Link>
                  </div>
                </div>
                <div className="md:col-span-5">
                  <div className="rounded-2xl border border-hairline bg-background/60 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium border border-hairline">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {demoOutput.label}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">sample result</span>
                    </div>

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
                        <span>unsteady 0</span>
                        <span className="text-foreground/80">{demoOutput.ksi}</span>
                        <span>100 steady</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[9px] font-mono text-muted-foreground pt-1 border-t border-hairline">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>Ready to analyze</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ContactSection />
        <Footer />
      </div>
    </>
  );
}