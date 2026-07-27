import { useCallback, useEffect, useRef, useState } from "react";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";
import hero4 from "@/assets/hero-4.jpg";

const slides = [
  { src: hero1, caption: "Corridor" },
  { src: hero2, caption: "Wearables" },
  { src: hero3, caption: "Waveform" },
  { src: hero4, caption: "Walking" },
];

const AUTO_MS = 4200;
const MANUAL_TIMEOUT_MS = 20000;

export function HeroCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const manualTimerRef = useRef<number | null>(null);

  const scrollTo = useCallback((i: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const child = el.children[i] as HTMLElement | undefined;
    if (child) el.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (mode !== "auto") return;
    const id = window.setInterval(() => {
      setIndex((i) => {
        const next = (i + 1) % slides.length;
        scrollTo(next);
        return next;
      });
    }, AUTO_MS);
    return () => clearInterval(id);
  }, [mode, scrollTo]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const center = el.scrollLeft + el.clientWidth / 2;
        let best = 0;
        let bestDist = Infinity;
        Array.from(el.children).forEach((c, i) => {
          const node = c as HTMLElement;
          const mid = node.offsetLeft + node.offsetWidth / 2;
          const d = Math.abs(mid - center);
          if (d < bestDist) {
            bestDist = d;
            best = i;
          }
        });
        setIndex(best);
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const enterManual = useCallback(() => {
    setMode("manual");
    if (manualTimerRef.current) window.clearTimeout(manualTimerRef.current);
    manualTimerRef.current = window.setTimeout(() => {
      setMode("auto");
    }, MANUAL_TIMEOUT_MS);
  }, []);

  useEffect(() => () => {
    if (manualTimerRef.current) window.clearTimeout(manualTimerRef.current);
  }, []);

  const go = (dir: -1 | 1) => {
    const next = (index + dir + slides.length) % slides.length;
    scrollTo(next);
    setIndex(next);
    enterManual();
  };

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="hide-scrollbar flex snap-x snap-mandatory overflow-x-auto scroll-smooth rounded-2xl border border-hairline"
      >
        {slides.map((s, i) => (
          <div
            key={i}
            className="relative aspect-[16/9] w-full flex-shrink-0 snap-start overflow-hidden bg-secondary/60"
          >
            <img
              src={s.src}
              alt={s.caption}
              width={1600}
              height={1000}
              loading={i === 0 ? "eager" : "lazy"}
              className="h-full w-full object-cover"
              draggable={false}
            />
            <div className="absolute bottom-4 left-4 glass rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em]">
              {String(i + 1).padStart(2, "0")} — {s.caption}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-end gap-4">
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => {
                scrollTo(i);
                setIndex(i);
                enterManual();
              }}
              className={`h-1 rounded-full transition-all ${
                i === index ? "w-8 bg-foreground" : "w-4 bg-foreground/25 hover:bg-foreground/50"
              }`}
            />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground tabular-nums">
            {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => go(-1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-hairline text-foreground/80 transition-colors hover:bg-foreground hover:text-background"
            >
              <i className="bi bi-arrow-left text-[13px]" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => go(1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-hairline text-foreground/80 transition-colors hover:bg-foreground hover:text-background"
            >
              <i className="bi bi-arrow-right text-[13px]" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}