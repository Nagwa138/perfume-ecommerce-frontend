import { useState } from "react";
import { API } from "./api";

type Msg = { role: "user" | "assistant"; content: string };

export default function ChatWidget({ onChange }: { onChange: () => void }) {
  const [open, setOpen] = useState(true);
  const [token, setToken] = useState(sessionStorage.getItem("adminToken") ?? "");
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", content: "Hi! Try: \"set stock of product 3 to 50\"" },
  ]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (!text.trim() || busy) return;
    sessionStorage.setItem("adminToken", token);
    const next = [...msgs, { role: "user" as const, content: text }];
    setMsgs(next); setText(""); setBusy(true);
    try {
      const r = await fetch(`${API}/admin/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Token": token },
        body: JSON.stringify({ messages: next.slice(1) }),
      });
      const d = await r.json();
      const reply = r.ok ? d.reply : typeof d.detail === "string" ? d.detail : JSON.stringify(d.detail);
      setMsgs([...next, { role: "assistant", content: reply ?? "(empty reply)" }]);
      onChange();
    } catch (err) {
      setMsgs([...next, { role: "assistant", content: `Error: ${err instanceof Error ? err.message : String(err)}` }]);
    } finally { setBusy(false); }
  };

  if (!open)
    return <button onClick={() => setOpen(true)} className="fixed bottom-6 right-6 z-40 rounded-full bg-violet-600 px-5 py-3 font-semibold">Admin chat</button>;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex h-[480px] w-80 flex-col rounded-2xl bg-zinc-900 text-sm shadow-2xl ring-1 ring-white/10">
      <div className="flex items-center justify-between border-b border-white/10 p-3 font-semibold">
        Store assistant <button onClick={() => setOpen(false)}>✕</button>
      </div>
      <input value={token} onChange={(e) => setToken(e.target.value)} type="password"
             placeholder="Admin token" className="m-2 rounded bg-zinc-800 p-2" />
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {msgs.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : ""}>
            <span className={`inline-block rounded-lg px-3 py-2 ${m.role === "user" ? "bg-violet-600" : "bg-zinc-800"}`}>{m.content}</span>
          </div>
        ))}
        {busy && <div className="text-white/50">thinking…</div>}
      </div>
      <div className="flex gap-2 border-t border-white/10 p-2">
        <input value={text} onChange={(e) => setText(e.target.value)}
               onKeyDown={(e) => e.key === "Enter" && send()}
               className="flex-1 rounded bg-zinc-800 p-2" placeholder="Ask me to change the shop…" />
        <button onClick={send} className="rounded bg-white px-3 font-semibold text-black">Send</button>
      </div>
    </div>
  );
}