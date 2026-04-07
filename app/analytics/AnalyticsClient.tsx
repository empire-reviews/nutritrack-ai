"use client";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend, ReferenceLine } from "recharts";

interface Summary { date: string; totalCalories: number; totalProtein: number; totalCarbs: number; totalFat: number; totalWaterMl: number; }
interface WeightLog { loggedAt: string; weightKg: number; }
interface Profile { dailyCalorieTarget: number; dailyProteinTarget: number; dailyWaterTargetMl: number; }
const DAYS = [7, 30, 90, 180];

export default function AnalyticsClient() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<{ summaries: Summary[]; weightLogs: WeightLog[]; profile: Profile | null }>({ summaries: [], weightLogs: [], profile: null });
  useEffect(() => { fetch(`/api/analytics?days=${days}`).then(r => r.json()).then(d => setData(d)); }, [days]);

  const { summaries, weightLogs, profile } = data;
  const calTarget = profile?.dailyCalorieTarget || 2000;
  const proTarget = profile?.dailyProteinTarget || 150;
  const calData = summaries.map(s => ({ date: s.date.slice(5), calories: Math.round(s.totalCalories), target: calTarget }));
  const proData = summaries.map(s => ({ date: s.date.slice(5), protein: Math.round(s.totalProtein), target: proTarget }));
  const wData = summaries.map(s => ({ date: s.date.slice(5), water: s.totalWaterMl, target: profile?.dailyWaterTargetMl || 2500 }));
  const wgData = weightLogs.map(w => ({ date: new Date(w.loggedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }), weight: w.weightKg }));
  const avgCals = summaries.length ? Math.round(summaries.reduce((a, s) => a + s.totalCalories, 0) / summaries.length) : 0;
  const avgPro = summaries.length ? Math.round(summaries.reduce((a, s) => a + s.totalProtein, 0) / summaries.length) : 0;
  const macroTotal = summaries.reduce((a, s) => ({ p: a.p + s.totalProtein, c: a.c + s.totalCarbs, f: a.f + s.totalFat }), { p: 0, c: 0, f: 0 });
  const pieData = [
    { name: "Protein", value: Math.round(macroTotal.p * 4), color: "#22c55e" },
    { name: "Carbs", value: Math.round(macroTotal.c * 4), color: "#f59e0b" },
    { name: "Fat", value: Math.round(macroTotal.f * 9), color: "#ef4444" },
  ];
  const tt = { contentStyle: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px" } };
  const tick = { fontSize: 10, fill: "var(--text-secondary)" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Analytics</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Track your nutrition trends</p>
        </div>
        <div style={{ display: "flex", gap: "0.375rem" }}>
          {DAYS.map(d => (
            <button key={d} onClick={() => setDays(d)} style={{
              padding: "0.375rem 0.75rem", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer",
              border: `1px solid ${days === d ? "var(--accent)" : "var(--border)"}`,
              background: days === d ? "rgba(99,102,241,0.15)" : "var(--surface-2)",
              color: days === d ? "var(--accent)" : "var(--text-secondary)",
            }}>{d}D</button>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {[
          { label: `${days}d Avg Calories`, value: `${avgCals} kcal`, color: "#3b82f6" },
          { label: `${days}d Avg Protein`, value: `${avgPro}g`, color: "#22c55e" },
          { label: "Days Logged", value: summaries.filter(s => s.totalCalories > 0).length, color: "#a855f7" },
        ].map(s => (
          <div key={s.label} className="card" style={{ flex: 1, minWidth: "160px" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{s.label}</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: s.color, margin: "0.25rem 0" }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <div className="card">
          <h3 style={{ fontWeight: 600, marginBottom: "1rem", fontSize: "0.9rem" }}>Calorie Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={calData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={tick} /><YAxis tick={tick} />
              <Tooltip {...tt} /><Line type="monotone" dataKey="calories" stroke="#3b82f6" strokeWidth={2} dot={false} name="Calories" />
              <Line type="monotone" dataKey="target" stroke="#6366f1" strokeWidth={1} strokeDasharray="4 4" dot={false} name="Target" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 style={{ fontWeight: 600, marginBottom: "1rem", fontSize: "0.9rem" }}>Protein Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={proData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={tick} /><YAxis tick={tick} />
              <Tooltip {...tt} /><ReferenceLine y={proTarget} stroke="#6366f1" strokeDasharray="4 4" />
              <Line type="monotone" dataKey="protein" stroke="#22c55e" strokeWidth={2} dot={false} name="Protein (g)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 style={{ fontWeight: 600, marginBottom: "1rem", fontSize: "0.9rem" }}>Macro Split</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name">
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip {...tt} formatter={(v: number) => [`${v} kcal`]} /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 style={{ fontWeight: 600, marginBottom: "1rem", fontSize: "0.9rem" }}>Water Intake</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={wData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={tick} /><YAxis tick={tick} />
              <Tooltip {...tt} /><ReferenceLine y={profile?.dailyWaterTargetMl || 2500} stroke="#06b6d4" strokeDasharray="4 4" />
              <Bar dataKey="water" fill="#06b6d4" radius={[4,4,0,0]} name="Water (ml)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {wgData.length > 1 && (
          <div className="card" style={{ gridColumn: "1 / -1" }}>
            <h3 style={{ fontWeight: 600, marginBottom: "1rem", fontSize: "0.9rem" }}>Weight Progress</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={wgData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={tick} /><YAxis domain={["auto","auto"]} tick={tick} />
                <Tooltip {...tt} /><Line type="monotone" dataKey="weight" stroke="#a855f7" strokeWidth={2} dot={{ fill: "#a855f7", r: 3 }} name="Weight (kg)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
