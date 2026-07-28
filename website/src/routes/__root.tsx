import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { RouteFade } from "@/components/RouteFade";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "KineTrace" },
      { name: "description", content: "KineTrace uses wearable sensor data and machine learning to quantify human movement stability, producing a clinical KineTrace Stability Index (KSI) score." },
      { name: "author", content: "KineTrace" },
      { property: "og:title", content: "KineTrace" },
      { property: "og:description", content: "KineTrace uses wearable sensor data and machine learning to quantify human movement stability, producing a clinical KineTrace Stability Index (KSI) score." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "google-site-verification", content: "g__gNiqRE1GUOb3QlizlGAih3G3P5sOYo_pRUqp0K3E" },
      { name: "keywords", content: "KineTrace, KSI, stability index, accelerometer analysis, gait tracking, fall risk assessment" },
      { property: "og:url", content: "https://kinetrace.netlify.app/" },
      { property: "og:image", content: "https://kinetrace.netlify.app/og-image.png" },
      { name: "twitter:title", content: "KineTrace — Movement & Stability Analytics" },
      { name: "twitter:description", content: "KineTrace uses wearable sensor data and machine learning to quantify human movement stability, producing a clinical KineTrace Stability Index (KSI) score." },
      { name: "twitter:image", content: "https://kinetrace.netlify.app/og-image.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {rel: "icon", href: "/icon-192x192.png", type: "image/png", sizes: "192x192"},
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "apple-touch-icon", href: "/icon-192x192.png", sizes: "192x192" },
      { rel: "theme-color", content: "#ffffff" },
      { rel: "canonical", href: "https://kinetrace.netlify.app/" },
      { rel: "preload", as: "image", href: "/hero-1.jpg" },
      { rel: "stylesheet", href: "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" },
    ],

  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "name": "KineTrace",
        "url": "https://kinetrace.netlify.app/"
      },
      {
        "@type": "SoftwareApplication",
        "name": "KineTrace",
        "operatingSystem": "Web Browser",
        "applicationCategory": "HealthApplication",
        "description": "Signal-processing and machine learning pipeline quantifying human movement stability and fall risk from tri-axial wearable sensor data.",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "author": {
          "@type": "Organization",
          "name": "KineTrace"
        }
      }
    ]
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ffffff" />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{history.scrollRestoration='manual';var t=localStorage.getItem('kt-theme');if(t!=='dark'&&t!=='light'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.classList.toggle('dark',t==='dark')}catch(e){}",
          }}
        />
        {/* Inject JSON-LD Script for Google Rich Snippets & Site Name */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    (window as Window & { __ktAppMounted?: boolean }).__ktAppMounted = true;
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <RouteFade>
        <Outlet />
      </RouteFade>
    </QueryClientProvider>
  );
}