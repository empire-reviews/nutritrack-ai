"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const PROVIDERS = [
  { value: "groq", label: "Groq", free: true, models: ["llama-3.3-70b-versatile","llama-3.1-8b-instant","mixtral-8x7b-32768"] },
  { value: "gemini", label: "Google Gemini", free: true, models: ["gemini-1.5-flash","gemini-pro"] },
  { value: "openai", label: "OpenAI", free: false, models: ["gpt-3.5-turbo","gpt-4o"] },
  { value: "anthropic", label: "Claude", free: false, models: ["claude-3-haiku-20240307","claude-3-sonnet-20240229"] },
  { value: "mistral", label: "Mistral AI", free: true, models: ["mistral-small-latest","mistral-medium-latest"] },
  { value: "together", label: "Together AI", free: true, models: ["meta-llama/Llama-3-8b-chat-hf"] },
  { value: "cohere", label: "Cohere", free: true, models: ["command-r"] },
  { value: "deepseek", label: "DeepSeek", free: true, models: ["deepseek-chat"] },
  { value: "ollama", label: "Ollama (Local)", free: true, models: ["llama3","mistral","phi3"] },
  { value: "lmstudio", label: "LM Studio (Local)", free: true, models: ["local-model"] },
  { value: "localai", label: "LocalAI", free: true, models: ["gpt-3.5-turbo"] },
];

export default function AISettingsClient() {
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  async function test() {
    setTesting(true);
    setStatus("idle");
    try {
      const res = await fetch("/api/ai/chat", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ message: "Reply with just: OK" }) 
      });
      const d = await res.json();
      if (d.reply) {
        toast.success("AI is active and responding!");
        setStatus("success");
      } else {
        toast.error("AI is currently unavailable");
        setStatus("error");
      }
    } catch { 
      toast.error("Connection test failed"); 
      setStatus("error");
    } finally { 
      setTesting(false); 
    }
  }

  return (
    <div style={{ maxWidth: "700px" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>🤖 Managed AI Service</h1>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
        NutriTrack AI handles all AI configurations centrally for the best performance and reliability.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div className="card" style={{ borderLeft: "4px solid var(--accent)" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ fontWeight: 600, marginBottom: "0.5rem" }}>System-Wide AI Configuration</h3>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
              All nutrition parsing, recommendations, and chat features are powered by a redundant 3-layer AI fallback chain managed by the administrator. 
              No personal API keys are required.
            </p>
          </div>

          <div style={{ padding: "1rem", borderRadius: "8px", background: "var(--surface-2)", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ 
              width: "12px", height: "12px", borderRadius: "50%", 
              background: status === "success" ? "#22c55e" : status === "error" ? "#ef4444" : "#94a3b8" 
            }} />
            <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>
              {status === "success" ? "AI System: Fully Operational" : status === "error" ? "AI System: Currently Down" : "AI System: Ready to Test"}
            </span>
          </div>

          <button 
            className="btn-secondary" 
            onClick={test} 
            disabled={testing}
            style={{ width: "fit-content" }}
          >
            {testing ? "Checking AI Status..." : "🔌 Verify Connectivity"}
          </button>
        </div>

        <div className="card">
          <h3 style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Privacy & Reliability</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            By centralizing AI keys, we ensure that your nutrition logs stay private while benefiting from high-capacity, professional-grade AI models that are monitored for speed and uptime.
          </p>
        </div>
      </div>
    </div>
  );
}
