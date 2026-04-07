"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getLocalFoods } from "@/lib/countries";

interface Rec { quickSnacks: { name: string; calories: number; protein: number; description: string; prepTime: string; }[]; nextMeal: { name: string; items: string[]; totalCalories: number; totalProtein: number; } | null; toHitGoal: { summary: string; options: { food: string; amount: string; protein: number; }[]; }; }

export default function RecommendationsClient() {
  const [tab, setTab] = useState<"today"|"local">("today");
  const [rec, setRec] = useState<Rec | null>(null);
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState("United States");

  useEffect(() => { fetch("/api/profile").then(r => r.json()).then(d => { if (d.user?.country) setCountry(d.user.country); }); }, []);

  async function getRecommendations() {
    setLoading(true);
    try {
      const dash = await fetch("/api/dashboard").then(r => r.json());
      const remaining = { remainingCalories: Math.max(0, (dash.targets?.dailyCalorieTarget || 2000) - (dash.totals?.calories || 0)), remainingProtein: Math.max(0, (dash.targets?.dailyProteinTarget || 150) - (dash.totals?.protein || 0)) };
      const res = await fetch("/api/ai/recommend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(remaining) });
      const d = await res.json();
      setRec(d.data);
    } catch { toast.error("Failed to get recommendations"); }
    finally { setLoading(false); }
  }

  const localFoods = getLocalFoods(country);

  return (
    <div style={{ maxWidth: "800px" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>🥗 Recommendations</h1>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>Personalized food suggestions based on your goals</p>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        {[{ k: "today", l: "Today's Suggestions" }, { k: "local", l: `Local Foods (${country})` }].map(t => (
          <button key={t.k} onClick={() => setTab(t.k as "today"|"local")} style={{
            padding: "0.625rem 1.25rem", borderRadius: "8px", cursor: "pointer", fontWeight: 500, fontSize: "0.875rem",
            border: `2px solid ${tab === t.k ? "var(--accent)" : "var(--border)"}`,
            background: tab === t.k ? "rgba(99,102,241,0.15)" : "var(--surface-2)",
            color: tab === t.k ? "var(--accent)" : "var(--text-secondary)",
          }}>{t.l}</button>
        ))}
      </div>
      {tab === "today" && (
        <div>
          {!rec && (
            <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🤖</div>
              <h3 style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Get AI Recommendations</h3>
              <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", fontSize: "0.875rem" }}>AI will analyze what you have eaten today and suggest what to eat next</p>
              <button className="btn-primary" onClick={getRecommendations} disabled={loading}>{loading ? "Analyzing..." : "✨ Generate Recommendations"}</button>
            </div>
          )}
          {rec && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button className="btn-secondary" onClick={getRecommendations} disabled={loading}>{loading ? "..." : "↺ Refresh"}</button>
              </div>
              <div className="card" style={{ borderColor: "rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.05)" }}>
                <h3 style={{ fontWeight: 600, marginBottom: "0.5rem", color: "var(--accent)" }}>To Hit Your Goal Today</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: rec.toHitGoal.options.length > 0 ? "1rem" : 0 }}>{rec.toHitGoal.summary}</p>
                {rec.toHitGoal.options.map((opt, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0.75rem", borderRadius: "6px", background: "var(--surface-2)", marginBottom: "0.375rem", fontSize: "0.875rem" }}>
                    <span>•</span><span style={{ flex: 1 }}><strong>{opt.food}</strong> — {opt.amount}</span>
                    <span style={{ color: "#22c55e" }}>{opt.protein}g protein</span>
                  </div>
                ))}
              </div>
              {rec.nextMeal && (
                <div className="card">
                  <h3 style={{ fontWeight: 600, marginBottom: "0.75rem" }}>Suggested Next Meal: {rec.nextMeal.name}</h3>
                  {rec.nextMeal.items.map((item, i) => <div key={i} style={{ color: "var(--text-secondary)", fontSize: "0.875rem", padding: "0.125rem 0" }}>• {item}</div>)}
                  <div style={{ display: "flex", gap: "1rem", marginTop: "0.75rem" }}>
                    <span style={{ color: "#3b82f6", fontSize: "0.875rem" }}>{rec.nextMeal.totalCalories} kcal</span>
                    <span style={{ color: "#22c55e", fontSize: "0.875rem" }}>{rec.nextMeal.totalProtein}g protein</span>
                  </div>
                </div>
              )}
              {rec.quickSnacks?.length > 0 && (
                <div>
                  <h3 style={{ fontWeight: 600, marginBottom: "0.75rem" }}>Quick Snacks</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
                    {rec.quickSnacks.map((s, i) => (
                      <div key={i} className="card">
                        <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>{s.name}</div>
                        <div style={{ color: "var(--text-secondary)", fontSize: "0.8rem", marginBottom: "0.5rem" }}>{s.description}</div>
                        <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.8rem" }}>
                          <span style={{ color: "#3b82f6" }}>{s.calories} kcal</span>
                          <span style={{ color: "#22c55e" }}>{s.protein}g protein</span>
                          <span style={{ color: "var(--text-secondary)" }}>~{s.prepTime}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {tab === "local" && (
        <div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1rem" }}>High-protein local foods from {country}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
            {localFoods.map((food, i) => (
              <div key={i} className="card">
                <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>{food.name}</div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#22c55e", margin: "0.25rem 0" }}>{food.protein}g</div>
                <div style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>protein per {food.per}</div>
                <div style={{ color: "var(--text-secondary)", fontSize: "0.75rem", marginTop: "0.5rem" }}>{food.notes}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
