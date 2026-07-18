import { useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function RouteFade({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className="animate-fade-in">
      {children}
    </div>
  );
}