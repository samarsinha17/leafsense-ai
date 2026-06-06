import { useEffect, useState } from "react";
import { Card } from "../components/ui/Card";
import { getAssistantHistory } from "../services/api";

type ChatItem = Awaited<ReturnType<typeof getAssistantHistory>>[number];

export function AssistantHistory() {
  const [items, setItems] = useState<ChatItem[]>([]);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    getAssistantHistory().then(setItems).catch(() => setItems([]));
  }, []);

  const sessions = items.reduce<ChatItem[][]>((groups, item) => {
    const latest = groups[groups.length - 1];
    const previous = latest?.[latest.length - 1];
    const gap = previous ? Math.abs(new Date(previous.created_at).getTime() - new Date(item.created_at).getTime()) : Infinity;
    if (!latest || gap > 30 * 60 * 1000) groups.push([item]);
    else latest.push(item);
    return groups;
  }, []);
  const active = sessions[selected] ?? [];

  return (
    <section className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
      <h1 className="font-heading text-4xl font-bold">Assistant History</h1>
      {items.length ? <div className="mt-8 grid gap-6 lg:grid-cols-[300px_1fr]">
        <div className="grid content-start gap-3">
          {sessions.map((session, index) => (
            <button key={session[0].id} onClick={() => setSelected(index)} className={`rounded-xl border p-4 text-left transition ${selected === index ? "border-primary bg-primary/10" : "border-border hover:border-primary/60"}`}>
              <p className="font-semibold">Session {sessions.length - index}</p>
              <p className="mt-1 text-xs text-muted">{new Date(session[session.length - 1].created_at).toLocaleString()}</p>
              <p className="mt-2 truncate text-sm text-muted">{session[session.length - 1].message}</p>
              <p className="mt-1 text-xs text-primary">{session.length} messages</p>
            </button>
          ))}
        </div>
        <Card className="max-h-[620px] overflow-y-auto">
          <div className="grid gap-5">
            {[...active].reverse().map((item) => (
              <div className="rounded-xl border border-border bg-background/50 p-4" key={item.id}>
                <p className="text-xs text-muted">{new Date(item.created_at).toLocaleString()}</p>
                <p className="mt-3 font-semibold">You: {item.message}</p>
                <p className="mt-3 whitespace-pre-wrap leading-7 text-muted">Assistant: {item.response}</p>
              </div>
            ))}
          </div>
        </Card>
      </div> : <Card className="mt-8"><p className="text-muted">No assistant conversations yet.</p></Card>}
    </section>
  );
}
