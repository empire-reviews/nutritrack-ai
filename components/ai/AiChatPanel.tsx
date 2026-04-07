"use client";
import { useState, useRef, useEffect } from "react";

interface Message { role: "user" | "ai"; text: string; }

const QUICK = [
  "What should I eat for dinner?",
  "Am I on track today?",
  "Suggest a high-protein snack",
  "How can I reach my protein goal?",
];

export default function AiChatPanel() {
  const [open, setOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: "Hi! I am your AI nutritionist. Ask me anything about your nutrition, food, or health goals! 🥗" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    setMessages(m => [...m, { role: "user", text }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const d = await res.json();
      setMessages(m => [...m, { role: "ai", text: d.reply || "Sorry, I could not respond right now." }]);
    } catch {
      setMessages(m => [...m, { role: "ai", text: "Could not connect to AI. Please check your AI settings." }]);
    } finally { setLoading(false); }
  }

  if (!open) return (
    <button onClick={() => setOpen(true)} style={{
      position: "fixed", right: "1.5rem", bottom: "1.5rem",
      width: "52px", height: "52px", borderRadius: "50%",
      background: "var(--accent)", border: "none", cursor: "pointer",
      fontSize: "1.3rem", boxShadow: "0 4px 20px rgba(99,102,241,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>🤖</button>
  );

  return (
    <div style={{
      width: "340px", flexShrink: 0, display: "flex", flexDirection: "column",
      background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px",
      height: "calc(100vh - 60px - 3rem)", position: "sticky", top: 0,
    }}>
      <div style={{ padding: "1rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.1rem" }}>🤖</span>
          <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>AI Nutritionist</span>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e" }} />
        </div>
        <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", fontSize: "1.1rem" }}>✕</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "85%", padding: "0.625rem 0.875rem", borderRadius: msg.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
              background: msg.role === "user" ? "var(--accent)" : "var(--surface-2)",
              color: "var(--text-primary)", fontSize: "0.8125rem", lineHeight: 1.5,
            }}>{msg.text}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ padding: "0.625rem 0.875rem", borderRadius: "12px 12px 12px 2px", background: "var(--surface-2)", color: "var(--text-secondary)", fontSize: "0.8125rem" }}>
              Thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick actions */}
      <div style={{ padding: "0.5rem 1rem", borderTop: "1px solid var(--border)", display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
        {QUICK.map(q => (
          <button key={q} onClick={() => send(q)} style={{
            padding: "0.25rem 0.625rem", borderRadius: "999px",
            background: "var(--surface-2)", border: "1px solid var(--border)",
            color: "var(--text-secondary)", fontSize: "0.7rem", cursor: "pointer",
          }}>{q}</button>
        ))}
      </div>

      <div style={{ padding: "0.75rem 1rem", borderTop: "1px solid var(--border)", display: "flex", gap: "0.5rem" }}>
        <input className="input" placeholder="Ask about your nutrition..." value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send(input)}
          style={{ flex: 1, fontSize: "0.8125rem" }} />
        <button className="btn-primary" onClick={() => send(input)} disabled={loading || !input.trim()} style={{ padding: "0.625rem 0.875rem" }}>→</button>
      </div>
    </div>
  );
}
