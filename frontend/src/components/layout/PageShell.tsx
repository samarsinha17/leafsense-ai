import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
