"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface FoodItem { fdcId: number; name: string; brand?: string; caloriesPer100g: number; proteinPer100g: number; carbsPer100g: number; fatPer100g: number; }
interface ParsedItem { name: string; quantity: number; unit: string; calories: number; protein: number; carbs: number; fat: number; }
interface MealSession { id: string; name: string; }

export default function LogClient() {
  const [mode, setMode] = useState<"search" | "ai">("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [meals, setMeals] = useState<MealSession[]>([]);
  const [selectedMeal, setSelectedMeal] = useState("");
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [qty, setQty] = useState(100);
  const [aiText, setAiText] = useState("");
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/meals").then(r => r.json()).then(d => {
      if (d.meals?.length) { setMeals(d.meals); setSelectedMeal(d.meals[0]?.id || ""); }
    });
  }, []);

  async function doSearch() {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/food/search?q=${encodeURIComponent(query)}`);
      const d = await res.json();
      setResults(d.foods || []);
    } catch { toast.error("Search failed"); }
    finally { setSearching(false); }
  }

  async function addFood() {
    if (!selected) return;
    setSaving(true);
    const ratio = qty / 100;
    try {
      await fetch("/api/food/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealSessionId: selectedMeal || null,
          foodName: selected.name, brand: selected.brand,
          quantity: qty, unit: "g",
          calories: Math.round(selected.caloriesPer100g * ratio * 10) / 10,
          protein: Math.round(selected.proteinPer100g * ratio * 10) / 10,
          carbs: Math.round(selected.carbsPer100g * ratio * 10) / 10,
          fat: Math.round(selected.fatPer100g * ratio * 10) / 10,
        }),
      });
      toast.success(`${selected.name} added!`);
      setSelected(null); setQuery(""); setResults([]);
    } catch { toast.error("Failed to add food"); }
    finally { setSaving(false); }
  }

  async function parseWithAI() {
    if (!aiText.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/parse-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: aiText }),
      });
      const d = await res.json();
      if (d.error) { toast.error(d.error); return; }
      setParsedItems(d.parsed?.items || []);
    } catch { toast.error("AI parsing failed"); }
    finally { setAiLoading(false); }
  }

  async function confirmAIItems() {
    setSaving(true);
    try {
      for (const item of parsedItems) {
        await fetch("/api/food/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mealSessionId: selectedMeal || null,
            foodName: item.name, quantity: item.quantity, unit: item.unit,
            calories: item.calories, protein: item.protein, carbs: item.carbs, fat: item.fat,
            aiParsed: true,
          }),
        });
      }
      toast.success(`${parsedItems.length} items logged!`);
      setParsedItems([]); setAiText("");
    } catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  }

  const ratio = qty / 100;
  const calc = selected ? {
    cal: Math.round(selected.caloriesPer100g * ratio),
    pro: Math.round(selected.proteinPer100g * ratio * 10) / 10,
    carb: Math.round(selected.carbsPer100g * ratio * 10) / 10,
    fat: Math.round(selected.fatPer100g * ratio * 10) / 10,
  } : null;

  return (
    <div style={{ maxWidth: "800px" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" }}>Log Food</h1>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        {[{ key: "search", label: "🔍 Search Food" }, { key: "ai", label: "🤖 AI Natural Language" }].map(m => (
          <button key={m.key} onClick={() => setMode(m.key as "search"|"ai")} style={{
            padding: "0.625rem 1.25rem", borderRadius: "8px", cursor: "pointer", fontWeight: 500,
            border: `2px solid ${mode === m.key ? "var(--accent)" : "var(--border)"}`,
            background: mode === m.key ? "rgba(99,102,241,0.15)" : "var(--surface-2)",
            color: mode === m.key ? "var(--accent)" : "var(--text-secondary)",
          }}>{m.label}</button>
        ))}
      </div>
      <div className="card" style={{ marginBottom: "1rem" }}>
        <label className="label">Add to meal</label>
        <select className="input" value={selectedMeal} onChange={e => setSelectedMeal(e.target.value)}>
          <option value="">No specific meal</option>
          {meals.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>
      {mode === "search" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="card">
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input className="input" placeholder="Search food (e.g. chicken breast, apple, rice...)" value={query}
                onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && doSearch()} />
              <button className="btn-primary" onClick={doSearch} disabled={searching} style={{ flexShrink: 0 }}>
                {searching ? "..." : "Search"}
              </button>
            </div>
          </div>
          {results.length > 0 && (
            <div className="card">
              <h3 style={{ fontWeight: 600, marginBottom: "0.75rem", fontSize: "0.9rem" }}>Results</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", maxHeight: "300px", overflowY: "auto" }}>
                {results.map(food => (
                  <button key={food.fdcId} onClick={() => setSelected(food)} style={{
                    padding: "0.625rem 0.75rem", borderRadius: "8px", textAlign: "left", cursor: "pointer",
                    border: `1px solid ${selected?.fdcId === food.fdcId ? "var(--accent)" : "transparent"}`,
                    background: selected?.fdcId === food.fdcId ? "rgba(99,102,241,0.1)" : "transparent",
                    color: "var(--text-primary)",
                  }}>
                    <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>{food.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                      {food.brand && <span>{food.brand} · </span>}
                      {food.caloriesPer100g} kcal · {food.proteinPer100g}g protein per 100g
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {selected && calc && (
            <div className="card" style={{ borderColor: "rgba(99,102,241,0.3)" }}>
              <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>Add: {selected.name}</h3>
              <div style={{ marginBottom: "1rem" }}>
                <label className="label">Quantity (grams)</label>
                <input className="input" type="number" min={1} value={qty} onChange={e => setQty(parseInt(e.target.value) || 100)} />
              </div>
              <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                {[{ l: "Calories", v: calc.cal, u: "kcal", c: "#3b82f6" }, { l: "Protein", v: calc.pro, u: "g", c: "#22c55e" }, { l: "Carbs", v: calc.carb, u: "g", c: "#f59e0b" }, { l: "Fat", v: calc.fat, u: "g", c: "#ef4444" }].map(n => (
                  <div key={n.l} style={{ flex: 1, minWidth: "80px", textAlign: "center" }}>
                    <div style={{ fontSize: "1.2rem", fontWeight: 700, color: n.c }}>{n.v}{n.u}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{n.l}</div>
                  </div>
                ))}
              </div>
              <button className="btn-primary" onClick={addFood} disabled={saving} style={{ width: "100%", justifyContent: "center" }}>
                {saving ? "Adding..." : "✓ Add to Log"}
              </button>
            </div>
          )}
        </div>
      )}
      {mode === "ai" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="card">
            <label className="label">Describe what you ate in plain text</label>
            <textarea className="input" rows={4} placeholder='e.g. "I had 2 roti with chicken curry and a glass of lassi"'
              value={aiText} onChange={e => setAiText(e.target.value)} style={{ resize: "vertical", lineHeight: 1.5 }} />
            <button className="btn-primary" onClick={parseWithAI} disabled={aiLoading || !aiText.trim()} style={{ marginTop: "0.75rem" }}>
              {aiLoading ? "Analyzing with AI..." : "🤖 Analyze with AI"}
            </button>
          </div>
          {parsedItems.length > 0 && (
            <div className="card">
              <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>AI Parsed Items — Review & Confirm</h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      {["Food","Qty","Unit","Cal","Protein","Carbs","Fat",""].map(h => (
                        <th key={h} style={{ padding: "0.5rem", textAlign: "left", color: "var(--text-secondary)", fontWeight: 500 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedItems.map((item, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "0.5rem" }}>{item.name}</td>
                        <td style={{ padding: "0.5rem" }}>
                          <input type="number" value={item.quantity} onChange={e => setParsedItems(ps => ps.map((p,pi) => pi===i ? {...p, quantity: parseFloat(e.target.value)} : p))}
                            style={{ width: "60px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "4px", padding: "0.25rem 0.5rem", color: "var(--text-primary)" }} />
                        </td>
                        <td style={{ padding: "0.5rem", color: "var(--text-secondary)" }}>{item.unit}</td>
                        <td style={{ padding: "0.5rem", color: "#3b82f6" }}>{item.calories}</td>
                        <td style={{ padding: "0.5rem", color: "#22c55e" }}>{item.protein}g</td>
                        <td style={{ padding: "0.5rem", color: "#f59e0b" }}>{item.carbs}g</td>
                        <td style={{ padding: "0.5rem", color: "#ef4444" }}>{item.fat}g</td>
                        <td style={{ padding: "0.5rem" }}>
                          <button onClick={() => setParsedItems(ps => ps.filter((_,pi) => pi !== i))} style={{ color: "var(--red)", background: "none", border: "none", cursor: "pointer" }}>✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: "2px solid var(--border)", fontWeight: 600 }}>
                      <td style={{ padding: "0.5rem" }}>TOTAL</td>
                      <td /><td />
                      <td style={{ padding: "0.5rem", color: "#3b82f6" }}>{parsedItems.reduce((a,i) => a + i.calories, 0)}</td>
                      <td style={{ padding: "0.5rem", color: "#22c55e" }}>{parsedItems.reduce((a,i) => a + i.protein, 0).toFixed(1)}g</td>
                      <td style={{ padding: "0.5rem", color: "#f59e0b" }}>{parsedItems.reduce((a,i) => a + i.carbs, 0).toFixed(1)}g</td>
                      <td style={{ padding: "0.5rem", color: "#ef4444" }}>{parsedItems.reduce((a,i) => a + i.fat, 0).toFixed(1)}g</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
              <button className="btn-primary" onClick={confirmAIItems} disabled={saving} style={{ marginTop: "1rem", width: "100%", justifyContent: "center" }}>
                {saving ? "Saving..." : "✓ Confirm & Save All"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
