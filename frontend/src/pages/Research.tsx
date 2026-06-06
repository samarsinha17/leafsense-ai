import { Card } from "../components/ui/Card";
import { researchSections } from "../data/content";

export function Research() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
      <h1 className="font-heading text-4xl font-bold">Academic Research Showcase</h1>
      <div className="mt-8 grid gap-5">
        {researchSections.map((section) => (
          <Card key={section.title}>
            <h2 className="font-heading text-2xl font-bold">{section.title}</h2>
            <p className="mt-3 leading-7 text-muted">{section.body}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
