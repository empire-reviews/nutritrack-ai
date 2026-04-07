"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface WaterLog { id: string; amountMl: number; loggedAt: string; }

export default function WaterClient() {
  const [logs, setLogs] = useState<WaterLog[]>([]);
  const [target, setTarget] = useState(2500);
  const [custom, setCustom] = useState(250);
  const QUICK = [150, 250, 350, 500];

  useEffect(() => {
    fetch("/api/water").then(r => r.json()).then(d => setLogs(d.waterLogs || []));
    fetch("/api/profile").then(r => r.json()).then(d => { if (d.profile?.dailyWaterTargetMl) setTarget(d.profile.dailyWaterTargetMl); });
  }, []);

  async function add(ml: number) {
    const res = await fetch("/api/water", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amountMl: ml }) });
    const d = await res.json();
    if (d.log) { setLogs(prev => [d.log, ...prev]); toast.success(`+${ml}ml logged!`); }
  }

  const total = logs.reduce((a, l) => a + l.amountMl, 0);
  const pct = Math.min((total / target) * 100, 100);

  return (
    <div style={{ maxWidth: "600px" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" }}>💧 Water Tracking</h1>
      <div className="card" style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <div style={{ position: "relative", width: "160px", height: "200px", margin: "0 auto 1rem", border: "2px solid #06b6d4", borderRadius: "0 0 20px 20px", overflow: "hidden", background: "var(--surface-2)" }}>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "#06b6d4", height: `${pct}%`, transition: "height 0.5s ease", opacity: 0.7 }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)" }}>{Math.round(pct)}%</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{total}ml</div>
          </div>
        </div>
        <div style={{ fontSize: "1rem", fontWeight: 600 }}>{total} / {target} ml</div>
        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
          {total >= target ? "🎉 Daily goal reached!" : `${target - total}ml remaining`}
        </div>
      </div>
      <div className="card" style={{ marginBottom: "1rem" }}>
        <h3 style={{ fontWeight: 600, marginBottom: "0.75rem" }}>Quick Add</h3>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          {QUICK.map(ml => (
            <button key={ml} onClick={() => add(ml)} className="btn-secondary" style={{ flex: 1, justifyContent: "center" }}>+{ml}ml</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input className="input" type="number" min={50} max={2000} value={custom} onChange={e => setCustom(parseInt(e.target.value))} style={{ flex: 1 }} />
          <button className="btn-primary" onClick={() => add(custom)}>Add {custom}ml</button>
        </div>
      </div>
      <div className="card">
        <h3 style={{ fontWeight: 600, marginBottom: "0.75rem" }}>Today&apos;s Log</h3>
        {logs.length === 0 ? (
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>No water logged yet today.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {logs.map(l => (
              <div key={l.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", padding: "0.5rem", borderRadius: "6px", background: "var(--surface-2)" }}>
                <span style={{ color: "#06b6d4" }}>💧 {l.amountMl}ml</span>
                <span style={{ color: "var(--text-secondary)" }}>{new Date(l.loggedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
