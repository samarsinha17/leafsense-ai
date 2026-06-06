import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Leaf } from "lucide-react";
import { featureCards, howItWorks, stats } from "../data/content";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Logo } from "../components/Logo";
import { useAppStore } from "../store/useAppStore";

export function Home() {
  const user = useAppStore((state) => state.user);
  return (
    <>
      <section className="relative isolate overflow-hidden px-6 py-24 text-center lg:px-8 lg:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(34,197,94,0.22),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(132,204,22,0.16),transparent_28%)]" />
        <div className="pointer-events-none absolute inset-0 -z-10">
          {Array.from({ length: 18 }).map((_, index) => (
            <Leaf
              key={index}
              className="absolute animate-float text-primary/20"
              style={{ left: `${(index * 17) % 100}%`, top: `${(index * 29) % 80}%`, animationDelay: `${index * 0.35}s` }}
              size={18 + (index % 4) * 8}
            />
          ))}
        </div>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-5xl">
          <Logo className="mx-auto justify-center" imageClassName="h-16 w-16 rounded-3xl" />
          <h1 className="mt-8 font-heading text-5xl font-extrabold tracking-tight sm:text-7xl">
            LeafSense AI
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-muted">
            AI-Powered Plant Disease Detection and Agricultural Intelligence System
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/detect"><Button>Start Detection <ArrowRight size={18} /></Button></Link>
            <Link to="/research"><Button variant="secondary">Learn More</Button></Link>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-6 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {stats.map(([label, value]) => (
          <Card key={label}>
            <p className="text-3xl font-bold text-primary">{value}</p>
            <p className="mt-2 text-sm text-muted">{label}</p>
          </Card>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <h2 className="font-heading text-4xl font-bold">Agricultural Intelligence Features</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {featureCards.map((feature) => (
            <Card key={feature.title}>
              <feature.icon className="text-primary" size={28} />
              <h3 className="mt-5 font-heading text-lg font-bold">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-card/50 py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <h2 className="font-heading text-4xl font-bold">How It Works</h2>
          <div className="mt-10 grid gap-5 lg:grid-cols-5">
            {howItWorks.map((step, index) => (
              <Card key={step.title} className="relative">
                <span className="text-xs font-bold text-primary">Step {index + 1}</span>
                <step.icon className="mt-5 text-primary" />
                <h3 className="mt-4 font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm text-muted">{step.detail}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {["Academic reviewers praised the platform-quality analytics.", "The CV pipeline makes diagnosis explainable for demonstrations.", "A scalable foundation for real-world agriculture deployment."].map((quote) => (
            <Card key={quote}>
              <p className="text-lg leading-8">"{quote}"</p>
              <p className="mt-5 text-sm font-semibold text-primary">Academic Style Testimonial</p>
            </Card>
          ))}
        </div>
        <div className="mt-16 rounded-3xl border border-primary/40 bg-primary/10 p-10 text-center">
          <h2 className="font-heading text-4xl font-bold">Start Detecting Plant Diseases Today</h2>
          <div className="mt-8 flex justify-center gap-4">
            <Link to="/detect"><Button>Upload Image</Button></Link>
            {user ? null : <Link to="/signup"><Button variant="secondary">Create Account</Button></Link>}
          </div>
        </div>
      </section>
    </>
  );
}
