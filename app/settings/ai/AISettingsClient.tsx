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
  const [settings, setSettings] = useState({ provider: "groq", model: "llama3-70b-8192", apiKey: "", baseUrl: "", fallbackProvider: "gemini", fallbackModel: "gemini-1.5-flash" });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetch("/api/ai-settings").then(r => r.json()).then(d => {
      if (d.settings) setSettings(s => ({ ...s, ...d.settings, apiKey: d.settings.apiKeyEncrypted || "" }));
    });
  }, []);

  async function save() {
    setSaving(true);
    const res = await fetch("/api/ai-settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
    if (res.ok) toast.success("AI settings saved!"); else toast.error("Failed to save");
    setSaving(false);
  }

  async function test() {
    setTesting(true);
    try {
      const res = await fetch("/api/ai/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: "Reply with just: OK" }) });
      const d = await res.json();
      if (d.reply) toast.success(`Connected! Using ${d.provider}`); else toast.error("Connection failed");
    } catch { toast.error("Connection test failed"); }
    finally { setTesting(false); }
  }

  const currentProvider = PROVIDERS.find(p => p.value === settings.provider);

  return (
    <div style={{ maxWidth: "700px" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>🤖 AI Provider Settings</h1>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>Choose which AI powers your nutrition analysis</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div className="card">
          <label className="label">Primary AI Provider</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "1rem" }}>
            {PROVIDERS.map(p => (
              <button key={p.value} onClick={() => setSettings(s => ({ ...s, provider: p.value, model: p.models[0] }))} style={{
                padding: "0.625rem 0.875rem", borderRadius: "8px", cursor: "pointer", textAlign: "left",
                border: `2px solid ${settings.provider === p.value ? "var(--accent)" : "var(--border)"}`,
                background: settings.provider === p.value ? "rgba(99,102,241,0.1)" : "var(--surface-2)",
                color: "var(--text-primary)",
              }}>
                <div style={{ fontWeight: 500, fontSize: "0.8rem" }}>{p.label}</div>
                <span style={{ fontSize: "0.65rem", padding: "0.1rem 0.375rem", borderRadius: "999px", background: p.free ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)", color: p.free ? "#22c55e" : "#f59e0b" }}>{p.free ? "Free" : "Paid"}</span>
              </button>
            ))}
          </div>
          {currentProvider && (
            <>
              <label className="label">Model Name</label>
              <input 
                className="input" 
                list="model-options"
                placeholder="Select or type your model (e.g. gemma:2b)"
                value={settings.model} 
                onChange={e => setSettings(s => ({ ...s, model: e.target.value }))} 
                style={{ marginBottom: "1rem" }} 
              />
              <datalist id="model-options">
                {currentProvider.models.map(m => <option key={m} value={m} />)}
              </datalist>
              {!["ollama","lmstudio","localai"].includes(settings.provider) && (
                <>
                  <label className="label">API Key</label>
                  <input className="input" type="password" placeholder="Paste your API key here" value={settings.apiKey} onChange={e => setSettings(s => ({ ...s, apiKey: e.target.value }))} style={{ marginBottom: "1rem" }} />
                </>
              )}
              {["ollama","lmstudio","localai"].includes(settings.provider) && (
                <>
                  <label className="label">Base URL</label>
                  <input className="input" placeholder="e.g. http://localhost:11434" value={settings.baseUrl} onChange={e => setSettings(s => ({ ...s, baseUrl: e.target.value }))} style={{ marginBottom: "1rem" }} />
                </>
              )}
            </>
          )}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button className="btn-primary" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Settings"}</button>
            <button className="btn-secondary" onClick={test} disabled={testing}>{testing ? "Testing..." : "🔌 Test Connection"}</button>
          </div>
        </div>
        <div className="card">
          <h3 style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Quick Guide: Get a Free Groq API Key</h3>
          <ol style={{ paddingLeft: "1.25rem", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            <li style={{ padding: "0.25rem 0" }}>Go to <a href="https://console.groq.com" target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>console.groq.com</a></li>
            <li style={{ padding: "0.25rem 0" }}>Sign up free (no credit card required)</li>
            <li style={{ padding: "0.25rem 0" }}>Go to API Keys → Create Key</li>
            <li style={{ padding: "0.25rem 0" }}>Paste it above and click Save</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
