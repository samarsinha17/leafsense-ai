import { Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "../Logo";

export function Footer() {
  const product = [
    ["Disease Detection", "/detect"],
    ["Supported Crops", "/dataset"],
    ["Model Analytics", "/analytics"],
  ];
  const resources = [
    ["Model Details", "/analytics"],
    ["Research", "/research"],
    ["Architecture", "/dashboard"],
  ];

  return (
    <footer className="border-t border-border/70 bg-card/70">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-[1.5fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted">
            AI-powered plant disease detection that transforms leaf images into accurate predictions, actionable insights, and smart crop care recommendations.
          </p>
          <p className="mt-6 text-xs text-muted">Copyright 2026 LeafSense AI. Terms. Privacy Policy.</p>
        </div>
        <div>
          <h3 className="font-heading text-sm font-bold">Product</h3>
          <div className="mt-4 grid gap-2 text-sm text-muted">
            {product.map(([label, path]) => (
              <Link className="hover:text-primary" to={path} key={path}>{label}</Link>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-heading text-sm font-bold">Resources</h3>
          <div className="mt-4 grid gap-2 text-sm text-muted">
            {resources.map(([label, path]) => (
              <Link className="hover:text-primary" to={path} key={path}>{label}</Link>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-heading text-sm font-bold">Contact</h3>
          <div className="mt-4 grid gap-3 text-sm text-muted">
            <Link className="inline-flex items-center gap-2 hover:text-primary" to="/team"><Users size={18} /> Our Team</Link>
            <Link className="hover:text-primary" to="/contact">Get in touch</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
