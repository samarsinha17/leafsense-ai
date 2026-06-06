import { FormEvent, useState } from "react";
import { Github, Linkedin, Mail, Send } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { teamMembers } from "../data/content";
import { sendGmailContact } from "../services/api";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function gmailCompose(email: string) {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;
}

export function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function loadGoogleScript() {
    return new Promise<void>((resolve, reject) => {
      if (window.google?.accounts.oauth2) {
        resolve();
        return;
      }
      const existing = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("Google script failed")), { once: true });
        return;
      }
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Google script failed"));
      document.head.appendChild(script);
    });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setStatus("");
    setSending(true);
    try {
      if (!GOOGLE_CLIENT_ID) {
        throw new Error("Google Client ID is not configured");
      }
      await loadGoogleScript();
      const tokenClient = window.google?.accounts.oauth2?.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: "https://www.googleapis.com/auth/gmail.send",
        callback: async (response) => {
          if (!response.access_token) {
            setStatus("Google permission was not granted.");
            setSending(false);
            return;
          }
          try {
            await sendGmailContact({ accessToken: response.access_token, ...form });
            setStatus("Message sent successfully.");
            setForm({ name: "", email: "", subject: "", message: "" });
          } catch {
            setStatus("Unable to send message. Please try again after checking Gmail permission.");
          } finally {
            setSending(false);
          }
        },
      });
      tokenClient?.requestAccessToken();
    } catch {
      setStatus("Google sign-in script could not be loaded.");
      setSending(false);
    }
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
      <h1 className="font-heading text-4xl font-bold">Contact</h1>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Card>
          <form className="grid gap-4" onSubmit={submit}>
            <input value={form.name} onChange={(event) => update("name", event.target.value)} className="rounded-2xl border border-border bg-transparent px-4 py-3 outline-none focus:border-primary" placeholder="Name" required />
            <input value={form.email} onChange={(event) => update("email", event.target.value)} className="rounded-2xl border border-border bg-transparent px-4 py-3 outline-none focus:border-primary" placeholder="Email" type="email" required />
            <input value={form.subject} onChange={(event) => update("subject", event.target.value)} className="rounded-2xl border border-border bg-transparent px-4 py-3 outline-none focus:border-primary" placeholder="Subject" required />
            <textarea value={form.message} onChange={(event) => update("message", event.target.value)} className="min-h-36 rounded-2xl border border-border bg-transparent px-4 py-3 outline-none focus:border-primary" placeholder="Message" required />
            {status ? <p className="rounded-2xl bg-primary/10 px-4 py-3 text-sm text-primary">{status}</p> : null}
            <Button disabled={sending} type="submit"><Send size={17} /> {sending ? "Sending..." : "Send Message"}</Button>
          </form>
        </Card>
        <Card>
          <h2 className="font-heading text-2xl font-bold">Project Contacts</h2>
          <div className="mt-5 grid gap-4">
            {teamMembers.map((member) => (
              <div className="rounded-2xl border border-border p-4" key={member.name}>
                <p className="font-semibold">{member.name}</p>
                <p className="text-sm text-muted">{member.role}</p>
                <div className="mt-4 flex gap-3">
                  <a className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white" href={member.github} target="_blank" rel="noreferrer" aria-label={`${member.name} GitHub`}><Github size={18} /></a>
                  <a className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white" href={member.linkedin} target="_blank" rel="noreferrer" aria-label={`${member.name} LinkedIn`}><Linkedin size={18} /></a>
                  <a className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white" href={gmailCompose(member.email)} target="_blank" rel="noreferrer" aria-label={`${member.name} email`}><Mail size={18} /></a>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}
