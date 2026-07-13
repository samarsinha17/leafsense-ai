import { FormEvent, useState } from "react";
import { Bot, Send, Sparkles } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { sendChatMessage } from "../services/api";
import { useAppStore } from "../store/useAppStore";
import { translate } from "../data/translations";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function Assistant() {
  const explicitAssistantContext = useAppStore((state) => state.assistantContext);
  const lastPrediction = useAppStore((state) => state.lastPrediction);
  const setAssistantContext = useAppStore((state) => state.setAssistantContext);
  const language = useAppStore((state) => state.language);
  const t = (key: string) => translate(language, key);
  const [contextCleared, setContextCleared] = useState(false);
  const assistantContext = contextCleared ? null : explicitAssistantContext ?? lastPrediction;
  const [messages, setMessages] = useState<Message[]>([
      {
        role: "assistant",
        content: assistantContext
        ? (language === "hi"
          ? `Mere paas aapka latest ${assistantContext.cropName} analysis loaded hai: ${assistantContext.diseaseName}, ${assistantContext.confidenceScore}% confidence, ${assistantContext.severity} severity. Iska matlab ya next steps pooch sakte ho.`
          : language === "hinglish"
            ? `Mere paas aapka latest ${assistantContext.cropName} analysis loaded hai: ${assistantContext.diseaseName}, ${assistantContext.confidenceScore}% confidence, ${assistantContext.severity} severity. Iska matlab ya next steps pooch sakte ho.`
            : `I have your latest ${assistantContext.cropName} analysis loaded: ${assistantContext.diseaseName}, ${assistantContext.confidenceScore}% confidence, ${assistantContext.severity} severity. Ask me what it means or what to do next.`)
        : (language === "hi"
          ? "Rog ke lakshan, watering, fertilizer, crop care, ya kisi previous LeafSense report ke baare me poochho."
          : language === "hinglish"
            ? "Disease symptoms, watering, fertilizer, crop care, ya previous LeafSense report ke baare me poochho."
            : "Ask about disease symptoms, watering, fertilizer, crop care, or a previous LeafSense report."),
      },
    ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const starters = [
    language === "hi" ? "Mera result samjhao" : language === "hinglish" ? "Explain my result" : "Explain my result",
    language === "hi" ? "Ab mujhe kya karna chahiye?" : language === "hinglish" ? "What should I do next?" : "What should I do next?",
    language === "hi" ? "Ye disease kitni serious hai?" : language === "hinglish" ? "How serious is this disease?" : "How serious is this disease?",
    language === "hi" ? "Treatment recommend karo" : language === "hinglish" ? "Give treatment recommendations" : "Give treatment recommendations",
  ];

  async function submit(event: FormEvent) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setMessages((current) => [...current, { role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);
    try {
      const response = await sendChatMessage(trimmed, assistantContext);
      setMessages((current) => [...current, { role: "assistant", content: response.response }]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: language === "hi"
            ? "Main local help de sakta hoon: affected plants ko alag karo, airflow improve karo, overhead watering avoid karo, aur diagnosis ke liye leaf image upload karo."
            : language === "hinglish"
              ? "Main local help de sakta hoon: affected plants ko isolate karo, airflow improve karo, overhead watering avoid karo, aur diagnosis ke liye leaf image upload karo."
              : "I can still help locally: isolate affected plants, improve airflow, avoid overhead watering, and upload a leaf image for diagnosis.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
      <div className="flex items-center gap-4">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 text-primary">
          <Bot />
        </div>
        <div>
          <h1 className="font-heading text-4xl font-bold">Plant Assistant AI</h1>
          <p className="mt-2 text-muted">{language === "hi" ? "रोग चर्चा, पौधों की देखभाल, उर्वरक, पानी, फसल मार्गदर्शन, और रिपोर्ट-aware agriculture support." : language === "hinglish" ? "Disease discussion, plant care, fertilizer, watering, crop guidance, aur report-aware agriculture support." : "Disease discussion, plant care, fertilizer, watering, crop guidance, and report-aware agriculture support."}</p>
        </div>
      </div>

      <Card className="mt-8">
        <div className="flex h-[520px] flex-col">
          {assistantContext ? (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm">
              <span>
                {language === "hi" ? "रिपोर्ट context उपयोग हो रहा है:" : language === "hinglish" ? "Using report context:" : "Using report context:"} <strong>{assistantContext.cropName}</strong> - {assistantContext.diseaseName}, {assistantContext.confidenceScore}% confidence, {assistantContext.severity} severity.
              </span>
              <button className="font-semibold text-primary" onClick={() => { setAssistantContext(null); setContextCleared(true); }} type="button">{language === "hi" ? "Context clear करें" : language === "hinglish" ? "Clear context" : "Clear context"}</button>
            </div>
          ) : null}
          {assistantContext ? (
            <div className="mb-4 flex flex-wrap gap-2">
              {starters.map((starter) => (
                <button
                  className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted transition hover:border-primary hover:text-primary"
                  key={starter}
                  onClick={() => setInput(starter)}
                  type="button"
                >
                  {starter}
                </button>
              ))}
            </div>
          ) : null}
          <div className="flex-1 space-y-4 overflow-y-auto pr-2">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[82%] rounded-2xl px-5 py-4 text-sm leading-6 ${
                  message.role === "user" ? "ml-auto bg-primary text-white" : "bg-primary/10 text-foreground"
                }`}
              >
                {message.role === "assistant" ? <Sparkles className="mb-2 text-primary" size={16} /> : null}
                {message.content}
              </div>
            ))}
            {loading ? <p className="text-sm text-muted">{t("generatingGuidance")}</p> : null}
          </div>
          <form onSubmit={submit} className="mt-6 flex gap-3">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className="min-w-0 flex-1 rounded-full border border-border bg-transparent px-5 py-3 outline-none focus:border-primary"
              placeholder={language === "hi" ? "Plant Assistant AI से पूछें..." : language === "hinglish" ? "Ask the Plant Assistant AI..." : "Ask the Plant Assistant AI..."}
            />
            <Button disabled={loading} type="submit">
              <Send size={17} /> {language === "hi" ? "भेजें" : language === "hinglish" ? "Send" : "Send"}
            </Button>
          </form>
        </div>
      </Card>
    </section>
  );
}
