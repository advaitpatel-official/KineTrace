import { useEffect, useMemo, useState } from "react";

const PHRASES = [
  "Calibrating sensors",
  "Aligning gyroscopes",
  "Sampling at 50 Hz",
  "Windowing 2.56 s frames",
  "Estimating stability",
  "Warming the classifier",
  "Denoising magnitude",
  "Fitting jerk envelope",
];

export function Preloader({ subtext }: { subtext?: string }) {
  const [isFirstLoad] = useState(() => {
    if (typeof window === "undefined") return false;
    return !(window as any).__ktHasLoaded;
  });

  const [shouldHide, setShouldHide] = useState(false);
  const [shouldRemove, setShouldRemove] = useState(!isFirstLoad);

  const phrase = useMemo(
    () => PHRASES[Math.floor(Math.random() * PHRASES.length)],
    [],
  );

  useEffect(() => {
    if (!isFirstLoad) return;

    (window as any).__ktHasLoaded = true;

    const t1 = setTimeout(() => setShouldHide(true), 1500);
    const t2 = setTimeout(() => setShouldRemove(true), 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isFirstLoad]);

  if (shouldRemove) return null;

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-700"
      style={{ opacity: shouldHide ? 0 : 1, pointerEvents: shouldHide ? "none" : "auto" }}
    >
      <div className="relative flex flex-col items-center gap-4">
        <div className="font-display text-4xl md:text-5xl tracking-tight">
          kinetrace<span className="align-super text-sm">®</span>
        </div>

        {subtext && (
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            {subtext}
          </div>
        )}

        <div className="mt-2 h-[2px] w-56 overflow-hidden bg-foreground/10">
          <div
            className="h-full origin-left bg-foreground"
            style={{ animation: "preloaderBar 1.3s cubic-bezier(0.65,0,0.35,1) forwards" }}
          />
        </div>

        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          {phrase}
        </div>
      </div>
    </div>
  );
}