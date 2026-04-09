"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import AiChatPanel from "@/components/ai/AiChatPanel";
import NotificationBanner from "@/components/NotificationBanner";

interface MacroTotals { calories: number; protein: number; carbs: number; fat: number; }
interface Targets {
  dailyCalorieTarget: number; dailyProteinTarget: number;
  dailyCarbTarget: number; dailyFatTarget: number; dailyWaterTargetMl: number;
}
interface FoodLog {
  id: string; foodName: string; calories: number; protein: number;
  carbs: number; fat: number; mealSession?: { name: string };
}
interface MealSession { id: string; name: string; scheduledTime: string; }

function MacroCard({ label, value, target, unit, color }: { label: string; value: number; target: number; unit: string; color: string; }) {
  const pct = target > 0 ? Math.min((value / target) * 100, 100) : 0;
  return (
    <div className="card" style={{ flex: 1, minWidth: "140px" }}>
      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 500, marginBottom: "0.5rem" }}>{label}</div>
      <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)" }}>{Math.round(value)}<span style={{ fontSize: "0.875rem", color: "var(--text-secondary)", fontWeight: 400 }}>{unit}</span></div>
      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>of {Math.round(target)}{unit}</div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>{Math.round(pct)}%</div>
    </div>
  );
}

function MacroRing({ label, value, target, color, emoji }: { label: string; value: number; target: number; color: string; emoji: string; }) {
  const pct = target > 0 ? Math.min((value / target) * 100, 100) : 0;
  const r = 50; const circ = 2 * Math.PI * r;
  const dash = circ * (pct / 100);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="12" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
          style={{ transform: "rotate(-90deg)", transformOrigin: "center", transition: "stroke-dasharray 0.5s ease" }} />
        <text x="60" y="55" textAnchor="middle" fill="var(--text-primary)" fontSize="14" fontWeight="700">{Math.round(pct)}%</text>
        <text x="60" y="72" textAnchor="middle" fill="var(--text-secondary)" fontSize="10">{emoji}</text>
      </svg>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>{label}</div>
        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{Math.round(value)} / {Math.round(target)}</div>
      </div>
    </div>
  );
}

export default function DashboardClient() {
  const [data, setData] = useState<{ totals: MacroTotals; targets: Targets; foodLogs: FoodLog[]; mealSessions: MealSession[]; totalWater: number; streak: number; aiQueryCount: number; } | null>(null);
  const [aiTip, setAiTip] = useState("");
  const [loadingTip, setLoadingTip] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(d => { if (!d.error) setData(d); }).catch(() => toast.error("Failed to load dashboard"));
  }, []);

  async function getAiTip() {
    if (!data) return;
    setLoadingTip(true);
    try {
      const res = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          consumedCalories: data.totals.calories, 
          targetCalories: data.targets?.dailyCalorieTarget || 2000,
          consumedProtein: data.totals.protein,
          targetProtein: data.targets?.dailyProteinTarget || 150
        }),
      });
      const d = await res.json();
      if (d.data?.toHitGoal?.summary) setAiTip(d.data.toHitGoal.summary);
      else setAiTip("Keep up the great work tracking your nutrition today!");
    } catch { setAiTip("Configure an AI provider in Settings to get personalized tips."); }
    finally { setLoadingTip(false); }
  }

  useEffect(() => {
    if (!data) return;
    const currentHour = new Date().getHours();
    const t = data.targets || {};
    const waterTarget = t.dailyWaterTargetMl || 2500;
    const expectedWater = waterTarget * (currentHour / 24);

    // Hydration Alert Logic
    const lastAlertedWaterHour = sessionStorage.getItem(`alert_water_hour_${new Date().toDateString()}`);
    if ((!lastAlertedWaterHour || parseInt(lastAlertedWaterHour) < currentHour) && data.totalWater < expectedWater * 0.75 && currentHour >= 8) {
      toast("Stay hydrated! 💧", {
        description: "You're falling behind on your water goal today. A quick glass of water would be great!",
        duration: 5000,
        action: { label: "Logged!", onClick: () => {} }
      });
      sessionStorage.setItem(`alert_water_hour_${new Date().toDateString()}`, currentHour.toString());
    }

    // Protein/Fueling Alert Logic
    const hasAlertedFuel = sessionStorage.getItem(`alert_fuel_${new Date().toDateString()}`);
    if (!hasAlertedFuel && currentHour >= 16 && data.totals.calories < (t.dailyCalorieTarget || 2000) * 0.4) {
      toast("Time to fuel up? 🥗", {
        description: "It's late afternoon and you're well below your energy target. Don't forget to eat!",
        duration: 5000,
        action: { label: "Logged!", onClick: () => {} }
      });
      sessionStorage.setItem(`alert_fuel_${new Date().toDateString()}`, "true");
    }
  }, [data]);

  if (!data) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "50vh" }}>
      <div style={{ textAlign: "center" }}>
        <div className="animate-spin" style={{ width: "40px", height: "40px", border: "3px solid var(--border)", borderTop: "3px solid var(--accent)", borderRadius: "50%", margin: "0 auto 1rem" }} />
        <p style={{ color: "var(--text-secondary)" }}>Loading your dashboard...</p>
      </div>
    </div>
  );

  const { totals, targets, foodLogs, mealSessions, totalWater, streak } = data;
  const t = targets || {};

  // Group food logs by meal
  const byMeal: Record<string, FoodLog[]> = {};
  foodLogs.forEach(log => {
    const meal = log.mealSession?.name || "Other";
    if (!byMeal[meal]) byMeal[meal] = [];
    byMeal[meal].push(log);
  });

  async function deleteLog(id: string) {
    await fetch(`/api/food/log?id=${id}`, { method: "DELETE" });
    setData(prev => prev ? { ...prev, foodLogs: prev.foodLogs.filter(l => l.id !== id) } : prev);
    toast.success("Removed");
  }

  // Dynamic Water Icon Calculation
  const currentHour = new Date().getHours();
  let waterEmoji = "💧";
  const waterTarget = t.dailyWaterTargetMl || 2500;
  const expectedWater = waterTarget * (currentHour / 24);
  
  if (totalWater < expectedWater * 0.4) {
    waterEmoji = "🥵"; // very behind schedule
  } else if (totalWater < expectedWater * 0.75) {
    waterEmoji = "🏜️"; // slightly behind schedule
  }

  return (
    <div className="mobile-stack" style={{ display: "flex", gap: "1.5rem" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1.5rem", minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Today&apos;s Dashboard</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Track your daily progress</p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            {data.aiQueryCount > 0 && (
              <div className="badge" style={{ background: "rgba(99,102,241,0.1)", color: "var(--accent)", border: "1px solid rgba(99,102,241,0.2)" }}>
                🤖 {data.aiQueryCount} AI Inquiries
              </div>
            )}
            {streak > 0 && <div className="badge badge-amber">🔥 {streak} day streak</div>}
            <a href="/log" className="btn-primary">+ Log Food</a>
          </div>
        </div>

        {/* Macro Cards */}
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <MacroCard label="Calories" value={totals.calories} target={t.dailyCalorieTarget || 2000} unit=" kcal" color="#3b82f6" />
          <MacroCard label="Protein" value={totals.protein} target={t.dailyProteinTarget || 150} unit="g" color="#22c55e" />
          <MacroCard label="Carbs" value={totals.carbs} target={t.dailyCarbTarget || 250} unit="g" color="#f59e0b" />
          <MacroCard label="Fat" value={totals.fat} target={t.dailyFatTarget || 65} unit="g" color="#ef4444" />
          <MacroCard label="Water" value={totalWater} target={waterTarget} unit=" ml" color="#06b6d4" />
        </div>

        {/* Macro Rings */}
        <div className="card">
          <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1.25rem" }}>Daily Goal Progress</h2>
          <div className="mobile-grid-1" style={{ display: "flex", gap: "1.5rem", justifyContent: "center", flexWrap: "wrap" }}>
            <MacroRing label="Calories" value={totals.calories} target={t.dailyCalorieTarget || 2000} color="#3b82f6" emoji="🔥" />
            <MacroRing label="Protein" value={totals.protein} target={t.dailyProteinTarget || 150} color="#22c55e" emoji="💪" />
            <MacroRing label="Carbs" value={totals.carbs} target={t.dailyCarbTarget || 250} color="#f59e0b" emoji="🌾" />
            <MacroRing label="Fat" value={totals.fat} target={t.dailyFatTarget || 65} color="#ef4444" emoji="🥑" />
            <MacroRing label="Water" value={totalWater} target={waterTarget} color="#06b6d4" emoji={waterEmoji} />
          </div>
        </div>

        {/* Today Meals */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 600 }}>Today&apos;s Meals</h2>
            <a href="/log" style={{ fontSize: "0.875rem", color: "var(--accent)", textDecoration: "none" }}>+ Add food</a>
          </div>
          {mealSessions.length === 0 && foodLogs.length === 0 && (
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🍽️</div>
              <p>No meals logged yet today.</p>
              <a href="/log" className="btn-primary" style={{ marginTop: "1rem", display: "inline-flex" }}>Log your first meal</a>
            </div>
          )}
          {mealSessions.map(ms => {
            const logs = byMeal[ms.name] || [];
            const mealCal = logs.reduce((a,l) => a + l.calories, 0);
            const mealPro = logs.reduce((a,l) => a + l.protein, 0);
            return (
              <details key={ms.id} style={{ marginBottom: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", overflow: "hidden" }} open>
                <summary style={{ padding: "0.75rem 1rem", cursor: "pointer", background: "var(--surface-2)", display: "flex", justifyContent: "space-between", alignItems: "center", userSelect: "none", listStyle: "none" }}>
                  <span style={{ fontWeight: 500 }}>{ms.name} <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>{ms.scheduledTime}</span></span>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>{Math.round(mealCal)} kcal · {Math.round(mealPro)}g protein</span>
                </summary>
                <div style={{ padding: "0.5rem" }}>
                  {logs.map(log => (
                    <div key={log.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0.75rem", borderRadius: "6px" }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--surface-2)"}
                      onMouseLeave={e => e.currentTarget.style.background = ""}>
                      <span style={{ fontSize: "0.875rem" }}>{log.foodName}</span>
                      <div style={{ display: "flex", gap: "1rem", alignItems: "center", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                        <span>{Math.round(log.calories)} kcal</span>
                        <span style={{ color: "#22c55e" }}>{Math.round(log.protein)}g P</span>
                        <button onClick={() => deleteLog(log.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--red)", fontSize: "0.8rem" }}>✕</button>
                      </div>
                    </div>
                  ))}
                  {logs.length === 0 && <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", padding: "0.5rem 0.75rem" }}>Nothing logged yet</p>}
                  <a href="/log" style={{ display: "block", padding: "0.5rem 0.75rem", color: "var(--accent)", fontSize: "0.8rem", textDecoration: "none" }}>+ Add food to {ms.name}</a>
                </div>
              </details>
            );
          })}
          
          {/* Render 'Other' foods that have no specific meal session */}
          {byMeal["Other"] && byMeal["Other"].length > 0 && (
            <details style={{ marginBottom: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", overflow: "hidden" }} open>
              <summary style={{ padding: "0.75rem 1rem", cursor: "pointer", background: "var(--surface-2)", display: "flex", justifyContent: "space-between", alignItems: "center", userSelect: "none", listStyle: "none" }}>
                <span style={{ fontWeight: 500 }}>Other / Snacks</span>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                  {Math.round(byMeal["Other"].reduce((a,l) => a + l.calories, 0))} kcal · {Math.round(byMeal["Other"].reduce((a,l) => a + l.protein, 0))}g protein
                </span>
              </summary>
              <div style={{ padding: "0.5rem" }}>
                {byMeal["Other"].map(log => (
                  <div key={log.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0.75rem", borderRadius: "6px" }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--surface-2)"}
                    onMouseLeave={e => e.currentTarget.style.background = ""}>
                    <span style={{ fontSize: "0.875rem" }}>{log.foodName}</span>
                    <div style={{ display: "flex", gap: "1rem", alignItems: "center", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      <span>{Math.round(log.calories)} kcal</span>
                      <span style={{ color: "#22c55e" }}>{Math.round(log.protein)}g P</span>
                      <button onClick={() => deleteLog(log.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--red)", fontSize: "0.8rem" }}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>

        {/* AI Tip */}
        <div className="card" style={{ borderColor: "rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "1.1rem" }}>🤖</span>
                <h3 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--accent)" }}>AI Nutrition Tip</h3>
              </div>
              {aiTip ? (
                <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.6 }}>{aiTip}</p>
              ) : (
                <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Get a personalized AI tip based on today&apos;s intake.</p>
              )}
            </div>
            <button className="btn-secondary" onClick={getAiTip} disabled={loadingTip} style={{ flexShrink: 0, marginLeft: "1rem" }}>
              {loadingTip ? "Analyzing..." : "Get Tip"}
            </button>
          </div>
        </div>
      </div>

      {/* AI Chat Panel */}
      <AiChatPanel />
    </div>
  );
}
