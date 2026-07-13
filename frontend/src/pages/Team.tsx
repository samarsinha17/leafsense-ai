import { Github, Linkedin, Mail } from "lucide-react";
import { Card } from "../components/ui/Card";
import { projectGuide, teamMembers, universityInfo } from "../data/content";
import { useAppStore } from "../store/useAppStore";
import { translate } from "../data/translations";

function gmailCompose(email: string) {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;
}

export function Team() {
  const language = useAppStore((state) => state.language);
  const t = (key: string) => translate(language, key);
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <h1 className="font-heading text-4xl font-bold">{t("teamLabel")}</h1>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {teamMembers.map((member) => (
          <Card key={member.name} className="text-center">
            <div className="mx-auto grid h-28 w-28 place-items-center overflow-hidden rounded-full bg-primary/15 text-4xl font-bold text-primary">
              {member.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
            </div>
            <h2 className="mt-6 font-heading text-2xl font-bold">{member.name}</h2>
            <p className="text-primary">{member.role}</p>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-muted">{member.bio}</p>
            <div className="mt-5 flex justify-center gap-3">
              <a className="grid h-10 w-10 place-items-center rounded-full border border-border hover:border-primary hover:text-primary" href={member.github} target="_blank" rel="noreferrer" aria-label={`${member.name} GitHub`}><Github size={18} /></a>
              <a className="grid h-10 w-10 place-items-center rounded-full border border-border hover:border-primary hover:text-primary" href={member.linkedin} target="_blank" rel="noreferrer" aria-label={`${member.name} LinkedIn`}><Linkedin size={18} /></a>
              <a className="grid h-10 w-10 place-items-center rounded-full border border-border hover:border-primary hover:text-primary" href={gmailCompose(member.email)} target="_blank" rel="noreferrer" aria-label={`${member.name} email`}><Mail size={18} /></a>
            </div>
          </Card>
        ))}
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {[projectGuide, universityInfo].map((item) => (
          <Card key={item.name}>
            <h2 className="font-heading text-2xl font-bold">{item.name}</h2>
            <p className="mt-3 whitespace-pre-line leading-7 text-muted">{item.body}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
