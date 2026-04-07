"use client";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { toast } from "sonner";

interface WeightLog { id: string; weightKg: number; loggedAt: string; }
interface Profile { weightKg: number; targetWeightKg?: number; goal: string; }

export default function WeightClient() {
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [newWeight, setNewWeight] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/weight").then(r => r.json()).then(d => setLogs((d.weightLogs || []).reverse()));
    fetch("/api/profile").then(r => r.json()).then(d => { if (d.profile) { setProfile(d.profile); setNewWeight(d.profile?.weightKg?.toString() || ""); } });
  }, []);

  async function log() {
    const kg = parseFloat(newWeight);
    if (!kg || kg < 20 || kg > 500) { toast.error("Invalid weight"); return; }
    setSaving(true);
    const res = await fetch("/api/weight", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ weightKg: kg }) });
    const d = await res.json();
    if (d.log) { setLogs(prev => [...prev, d.log]); toast.success(`${kg}kg logged!`); }
    setSaving(false);
  }

  const chartData = logs.map(l => ({ date: new Date(l.loggedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }), weight: l.weightKg }));
  const current = logs.length ? logs[logs.length - 1].weightKg : profile?.weightKg || 0;
  const start = logs.length ? logs[0].weightKg : profile?.weightKg || 0;
  const change = current - start;
  const tt = { contentStyle: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px" } };

  return (
    <div style={{ maxWidth: "700px" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" }}>⚖️ Weight Tracking</h1>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {[
          { label: "Starting", value: `${start} kg`, color: "#6366f1" },
          { label: "Current", value: `${current} kg`, color: "#a855f7" },
          { label: "Target", value: profile?.targetWeightKg ? `${profile.targetWeightKg} kg` : "Not set", color: "#22c55e" },
          { label: "Change", value: `${change >= 0 ? "+" : ""}${change.toFixed(1)} kg`, color: change < 0 ? "#22c55e" : "#ef4444" },
        ].map(s => (
          <div key={s.label} className="card" style={{ flex: 1, minWidth: "130px" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{s.label}</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 700, color: s.color, margin: "0.25rem 0" }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ fontWeight: 600, marginBottom: "0.75rem" }}>Log Today&apos;s Weight</h3>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <input className="input" type="number" step={0.1} min={20} max={500} placeholder="e.g. 72.5" value={newWeight} onChange={e => setNewWeight(e.target.value)} style={{ flex: 1 }} />
          <span style={{ display: "flex", alignItems: "center", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>kg</span>
          <button className="btn-primary" onClick={log} disabled={saving}>{saving ? "Saving..." : "Log Weight"}</button>
        </div>
      </div>
      {chartData.length > 1 && (
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>Weight Progress</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--text-secondary)" }} />
              <YAxis domain={["auto","auto"]} tick={{ fontSize: 10, fill: "var(--text-secondary)" }} />
              <Tooltip {...tt} />
              {profile?.targetWeightKg && <ReferenceLine y={profile.targetWeightKg} stroke="#22c55e" strokeDasharray="4 4" label={{ value: "Target", fill: "#22c55e", fontSize: 10 }} />}
              <Line type="monotone" dataKey="weight" stroke="#a855f7" strokeWidth={2} dot={{ fill: "#a855f7", r: 3 }} name="Weight (kg)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="card">
        <h3 style={{ fontWeight: 600, marginBottom: "0.75rem" }}>History</h3>
        {logs.length === 0 ? <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>No weight logs yet.</p> : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            {[...logs].reverse().slice(0, 20).map(l => (
              <div key={l.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0.75rem", borderRadius: "6px", background: "var(--surface-2)", fontSize: "0.875rem" }}>
                <span style={{ fontWeight: 500 }}>{l.weightKg} kg</span>
                <span style={{ color: "var(--text-secondary)" }}>{new Date(l.loggedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
