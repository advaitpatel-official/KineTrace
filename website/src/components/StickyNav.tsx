import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useIsMobile } from "@/hooks/use-mobile";

const items = [
  { id: "overview", label: "Overview" },
  { id: "about", label: "About" },
  { id: "method", label: "How It Works" },
  { id: "ksi", label: "Try KSI" },
  { id: "contact", label: "Contact" },
];

export function StickyNav() {
  const [active, setActive] = useState("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const lockedActive = useRef<{ id: string; until: number } | null>(null);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const onHome = pathname === "/";
  const isMobile = useIsMobile();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!onHome) return;
    let raf = 0;

    const updateActive = () => {
      if (lockedActive.current && Date.now() < lockedActive.current.until) {
        setActive(lockedActive.current.id);
        return;
      }

      try {
        const id = sessionStorage.getItem("kt-nav-lock-id");
        const until = Number(sessionStorage.getItem("kt-nav-lock-until") || 0);
        if (id && Date.now() < until) {
          lockedActive.current = { id, until };
          setActive(id);
          return;
        }
      } catch {}

      const sections = items
        .map((item) => ({ item, el: document.getElementById(item.id) }))
        .filter(
          (entry): entry is { item: (typeof items)[number]; el: HTMLElement } =>
            Boolean(entry.el),
        );

      const scrollY = window.scrollY;
      let next = sections[0]?.item.id ?? "overview";
      let largestVisible = 0;

      for (const { item, el } of sections) {
        const rect = el.getBoundingClientRect();
        const visible = Math.max(
          0,
          Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 96),
        );

        if (visible > largestVisible) {
          largestVisible = visible;
          next = item.id;
        }
      }

      if (largestVisible < 24) {
        const marker = scrollY + Math.min(window.innerHeight * 0.42, 360);
        for (const { item, el } of sections) {
          if (el.offsetTop <= marker) next = item.id;
        }
      }

      setActive(next);
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateActive);
    };

    updateActive();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [onHome]);

  const handleSectionClick = (id: string) => {
    lockedActive.current = { id, until: Date.now() + 1000 };
    setActive(id);
    setMobileOpen(false);
    if (onHome) {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    try {
      sessionStorage.setItem("kt-scroll-target", id);
      sessionStorage.setItem("kt-nav-lock-id", id);
      sessionStorage.setItem("kt-nav-lock-until", String(Date.now() + 1000));
    } catch {}
    navigate({ to: "/" });
  };

  const handleRouteClick = () => {
    setMobileOpen(false);
  };

  const desktopNav = (
    <nav
      className="glass backdrop-blur-md bg-background/70 pointer-events-auto flex w-full max-w-[min(100%,820px)] items-center gap-0.5 overflow-x-auto rounded-full px-1.5 py-1.5 hide-scrollbar sm:w-auto sm:gap-1"
      aria-label="Section navigation"
    >
      {items.map((it) => {
        const isActive = onHome && active === it.id;
        return (
          <button
            key={it.id}
            type="button"
            onClick={() => handleSectionClick(it.id)}
            className={`shrink-0 rounded-full px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] transition-colors sm:px-3 sm:text-[11px] md:px-4 ${
              isActive
                ? "bg-foreground text-background"
                : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
            }`}
          >
            {it.label}
          </button>
        );
      })}
      <Link
        to="/documentation"
        onClick={handleRouteClick}
        className="shrink-0 rounded-full px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] transition-colors sm:px-3 sm:text-[11px] md:px-4"
        activeProps={{ className: "bg-foreground text-background" }}
        inactiveProps={{
          className:
            "text-foreground/70 hover:bg-foreground/5 hover:text-foreground",
        }}
      >
        Docs
      </Link>
      <Link
        to="/analyzer"
        onClick={handleRouteClick}
        className="shrink-0 rounded-full px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] transition-colors sm:px-3 sm:text-[11px] md:px-4"
        activeProps={{ className: "bg-foreground text-background" }}
        inactiveProps={{
          className:
            "text-foreground/70 hover:bg-foreground/5 hover:text-foreground",
        }}
      >
        Analyzer
      </Link>
      <span aria-hidden className="mx-0.5 h-4 w-px shrink-0 bg-foreground/15" />
      <ThemeToggle className="shrink-0" />
    </nav>
  );

  const mobileToggle = (
    <button
      type="button"
      onClick={() => setMobileOpen((prev) => !prev)}
      aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
      aria-expanded={mobileOpen}
      className="glass backdrop-blur-md bg-background/70 pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-foreground/10"
    >
      <i
        className={`bi ${mobileOpen ? "bi-x" : "bi-list"} text-lg text-foreground/80 transition-transform duration-200 ${
          mobileOpen ? "rotate-90" : ""
        }`}
        aria-hidden
      />
    </button>
  );

  const isRouteActive = (path: string) => pathname === path;

  const navEntries: Array<{
    key: string;
    label: string;
    type: "section" | "route";
    path?: string;
    sectionId?: string;
  }> = [
    ...items.map((it) => ({
      key: it.id,
      label: it.label,
      type: "section" as const,
      sectionId: it.id,
    })),
    {
      key: "docs",
      label: "Docs",
      type: "route" as const,
      path: "/documentation",
    },
    {
      key: "analyzer",
      label: "Analyzer",
      type: "route" as const,
      path: "/analyzer",
    },
  ];

  return (
    <>
      {}
      {!isMobile && (
        <div className="pointer-events-none sticky top-3 z-40 flex justify-center px-3 md:top-6">
          {desktopNav}
        </div>
      )}

      {}
      {isMobile && (
        <div className="pointer-events-none sticky top-3 z-40 flex justify-center px-3 -mt-6 pb-6 md:top-6">
          {mobileToggle}
        </div>
      )}

      {}
      <div
        aria-hidden={!mobileOpen}
        {...(!mobileOpen ? { inert: true } : {})}
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        {}
        <div
          className="absolute inset-0 bg-background"
          onClick={() => setMobileOpen(false)}
        />

        {}
        <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-6 pt-8">
          <span className="font-mono text-xs tracking-tight text-foreground/60">
            kinetrace
          </span>
          <div className="flex items-center gap-2">
            <ThemeToggle className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-foreground/10 hover:text-foreground" />
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation menu"
              className="flex h-10 w-10 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-foreground/10"
            >
              <i className="bi bi-x-lg text-lg" aria-hidden />
            </button>
          </div>
        </div>

        {}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-8 pt-24 pb-20 overflow-y-auto">
          <nav
            className="flex w-full max-w-sm flex-col items-center gap-2"
            aria-label="Mobile navigation"
          >
            {navEntries.map((entry) => {
              let isActive = false;
              if (entry.type === "section") {
                isActive = onHome && active === entry.sectionId;
              } else if (entry.path === "/") {
                isActive = pathname === "/" && false;
              } else {
                isActive = isRouteActive(entry.path!);
              }

              const commonClass = `w-full rounded-2xl px-6 py-5 text-center font-display text-3xl md:text-4xl transition-all duration-200 ${
                isActive
                  ? "text-foreground scale-100"
                  : "text-foreground/30 hover:text-foreground/60 hover:scale-[1.02]"
              }`;

              if (entry.type === "section") {
                return (
                  <button
                    key={entry.key}
                    type="button"
                    onClick={() => handleSectionClick(entry.sectionId!)}
                    className={commonClass}
                  >
                    {entry.label}
                  </button>
                );
              }

              return (
                <Link
                  key={entry.key}
                  to={entry.path!}
                  onClick={handleRouteClick}
                  className={commonClass}
                >
                  {entry.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}