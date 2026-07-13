import { Card } from "../components/ui/Card";
import { researchSections } from "../data/content";
import { useAppStore } from "../store/useAppStore";
import { translate } from "../data/translations";

export function Research() {
  const language = useAppStore((state) => state.language);
  const t = (key: string) => translate(language, key);
  return (
    <section className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
      <h1 className="font-heading text-4xl font-bold">{t("academicResearchShowcase")}</h1>
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
