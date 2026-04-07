"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { COUNTRIES } from "@/lib/countries";

const GOALS = [
  { value: "gain", icon: "💪", label: "Gain Weight & Muscle" },
  { value: "lose", icon: "🔥", label: "Lose Weight" },
  { value: "maintain", icon: "⚖️", label: "Maintain Weight" },
  { value: "muscle", icon: "🏋️", label: "Build Muscle" },
  { value: "health", icon: "❤️", label: "General Health" },
];

const ACTIVITY = [
  { value: "sedentary", icon: "🪑", label: "Sedentary", desc: "Desk job, little movement" },
  { value: "light", icon: "🚶", label: "Lightly Active", desc: "Walk daily, 1-2x/week exercise" },
  { value: "moderate", icon: "🏃", label: "Moderately Active", desc: "Exercise 3-4x/week" },
  { value: "active", icon: "💪", label: "Very Active", desc: "Intense exercise 5-6x/week" },
  { value: "athlete", icon: "🏆", label: "Athlete", desc: "2x daily training" },
];

const AI_PROVIDERS = [
  { value: "groq", label: "⭐ Groq (Free — Recommended)", hint: "Get free key at console.groq.com" },
  { value: "gemini", label: "🌟 Google Gemini (Free tier)", hint: "Get key at aistudio.google.com" },
  { value: "ollama", label: "🏠 Ollama (Free local)", hint: "No API key needed, runs locally" },
  { value: "openai", label: "🔑 OpenAI GPT", hint: "Requires paid API key" },
  { value: "anthropic", label: "🔑 Anthropic Claude", hint: "Requires paid API key" },
  { value: "mistral", label: "🔑 Mistral AI (Free tier)", hint: "Get key at console.mistral.ai" },
  { value: "skip", label: "⏭️ Skip — Use built-in AI", hint: "Uses Groq free tier by default" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<Record<string, number>>({});
  const [form, setForm] = useState({
    age: 25, gender: "male", heightCm: 170, weightKg: 70,
    bodyFatPercent: null as number | null, waistCm: null as number | null,
    goal: "maintain", targetWeightKg: null as number | null, targetWeeks: 12,
    activityLevel: "moderate",
    exerciseTypes: [] as string[], exerciseDaysPerWeek: 3,
    dietaryRestrictions: [] as string[], medicalConditions: [] as string[],
    mealCount: 3, cuisine: "General",
    aiProvider: "groq", aiModel: "llama3-70b-8192", aiApiKey: "",
  });

  function update(k: string, v: unknown) { setForm(f => ({ ...f, [k]: v })); }
  function toggleArr(k: string, v: string) {
    setForm(f => {
      const arr = f[k as keyof typeof f] as string[];
      return { ...f, [k]: arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v] };
    });
  }

  async function finish() {
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); setLoading(false); return; }
      setResults(data.targets);
      setShowResults(true);
    } catch { toast.error("Error saving onboarding data"); }
    finally { setLoading(false); }
  }

  if (showResults) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--background)", padding: "1rem" }}>
      <div style={{ maxWidth: "520px", width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>Your Targets Are Ready!</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>Based on your profile, here are your personalized daily goals:</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { label: "Daily Calories", value: `${results.dailyCalorieTarget} kcal`, color: "#3b82f6" },
            { label: "Protein", value: `${results.dailyProteinTarget}g`, color: "#22c55e" },
            { label: "Carbs", value: `${results.dailyCarbTarget}g`, color: "#f59e0b" },
            { label: "Fat", value: `${results.dailyFatTarget}g`, color: "#ef4444" },
            { label: "Water", value: `${results.dailyWaterTargetMl}ml`, color: "#06b6d4" },
            { label: "BMI", value: `${results.bmi} (${results.bmiCategory})`, color: "#a855f7" },
          ].map(item => (
            <div key={item.label} className="card" style={{ borderColor: item.color + "40" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>{item.label}</div>
              <div style={{ fontSize: "1.25rem", fontWeight: 700, color: item.color }}>{item.value}</div>
            </div>
          ))}
        </div>
        <button className="btn-primary" onClick={() => router.push("/dashboard")} style={{ width: "100%", justifyContent: "center", padding: "0.875rem", fontSize: "1rem" }}>
          🚀 Go to Dashboard
        </button>
      </div>
    </div>
  );

  const steps = ["Personal Info", "Health Goals", "Activity Level", "Meal Prefs", "AI Setup"];

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)", padding: "1.5rem" }}>
      <div style={{ maxWidth: "640px", margin: "0 auto" }}>
        {/* Progress */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: i < steps.length - 1 ? 1 : undefined }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: i + 1 <= step ? "var(--accent)" : "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 600, flexShrink: 0 }}>
                  {i + 1 < step ? "✓" : i + 1}
                </div>
                {i < steps.length - 1 && <div style={{ flex: 1, height: "2px", background: i + 1 < step ? "var(--accent)" : "var(--border)" }} />}
              </div>
            ))}
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Step {step} of {steps.length}: <strong>{steps[step-1]}</strong></div>
        </div>

        <div className="card" style={{ padding: "2rem" }}>
          {/* STEP 1 */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Tell us about yourself</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label className="label">Age</label>
                  <input className="input" type="number" min={10} max={100} value={form.age} onChange={e => update("age", parseInt(e.target.value))} />
                </div>
                <div>
                  <label className="label">Gender</label>
                  <select className="input" value={form.gender} onChange={e => update("gender", e.target.value)}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="label">Height (cm)</label>
                  <input className="input" type="number" min={100} max={250} value={form.heightCm} onChange={e => update("heightCm", parseFloat(e.target.value))} />
                </div>
                <div>
                  <label className="label">Weight (kg)</label>
                  <input className="input" type="number" min={30} max={300} value={form.weightKg} onChange={e => update("weightKg", parseFloat(e.target.value))} />
                </div>
              </div>
              <div>
                <label className="label">Country</label>
                <select className="input" value={form.cuisine} onChange={e => update("cuisine", e.target.value)}>
                  {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label className="label">Body Fat % (optional)</label>
                  <input className="input" type="number" min={3} max={60} placeholder="e.g. 20" value={form.bodyFatPercent ?? ""} onChange={e => update("bodyFatPercent", e.target.value ? parseFloat(e.target.value) : null)} />
                </div>
                <div>
                  <label className="label">Waist cm (optional)</label>
                  <input className="input" type="number" min={40} max={200} placeholder="e.g. 85" value={form.waistCm ?? ""} onChange={e => update("waistCm", e.target.value ? parseFloat(e.target.value) : null)} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>What is your primary goal?</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {GOALS.map(g => (
                  <button key={g.value} onClick={() => update("goal", g.value)} style={{
                    padding: "0.875rem 1rem", borderRadius: "8px", border: `2px solid ${form.goal === g.value ? "var(--accent)" : "var(--border)"}`,
                    background: form.goal === g.value ? "rgba(99,102,241,0.1)" : "var(--surface-2)",
                    color: "var(--text-primary)", cursor: "pointer", textAlign: "left", fontSize: "0.9rem", fontWeight: 500,
                    display: "flex", alignItems: "center", gap: "0.75rem",
                  }}>
                    <span style={{ fontSize: "1.3rem" }}>{g.icon}</span> {g.label}
                  </button>
                ))}
              </div>
              {["gain", "lose"].includes(form.goal) && (
                <div>
                  <label className="label">Target Weight (kg)</label>
                  <input className="input" type="number" value={form.targetWeightKg ?? ""} onChange={e => update("targetWeightKg", parseFloat(e.target.value))} placeholder="e.g. 75" />
                </div>
              )}
              <div>
                <label className="label">Dietary Restrictions</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {["Vegan","Vegetarian","Pescatarian","Keto","Paleo","Halal","Kosher","Gluten-Free","Lactose-Free","Nut Allergy","Shellfish Allergy","Dairy Allergy","Egg Allergy","Soy Allergy","None"].map(r => (
                    <button key={r} onClick={() => toggleArr("dietaryRestrictions", r)} style={{
                      padding: "0.375rem 0.75rem", borderRadius: "999px", fontSize: "0.8rem", cursor: "pointer",
                      border: `1px solid ${form.dietaryRestrictions.includes(r) ? "var(--accent)" : "var(--border)"}`,
                      background: form.dietaryRestrictions.includes(r) ? "rgba(99,102,241,0.15)" : "var(--surface-2)",
                      color: form.dietaryRestrictions.includes(r) ? "var(--accent)" : "var(--text-secondary)",
                    }}>{r}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>How active are you?</h2>
              {ACTIVITY.map(a => (
                <button key={a.value} onClick={() => update("activityLevel", a.value)} style={{
                  padding: "0.875rem 1rem", borderRadius: "8px", border: `2px solid ${form.activityLevel === a.value ? "var(--accent)" : "var(--border)"}`,
                  background: form.activityLevel === a.value ? "rgba(99,102,241,0.1)" : "var(--surface-2)",
                  color: "var(--text-primary)", cursor: "pointer", textAlign: "left",
                }}>
                  <div style={{ fontSize: "0.9rem", fontWeight: 500 }}>{a.icon} {a.label}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{a.desc}</div>
                </button>
              ))}
              <div>
                <label className="label">Exercise days per week: {form.exerciseDaysPerWeek}</label>
                <input type="range" min={0} max={7} value={form.exerciseDaysPerWeek} onChange={e => update("exerciseDaysPerWeek", parseInt(e.target.value))} style={{ width: "100%" }} />
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Meal Preferences</h2>
              <div>
                <label className="label">Meals per day</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {[3,4,5,6,7].map(n => (
                    <button key={n} onClick={() => update("mealCount", n)} style={{
                      flex: 1, padding: "0.75rem", borderRadius: "8px", cursor: "pointer",
                      border: `2px solid ${form.mealCount === n ? "var(--accent)" : "var(--border)"}`,
                      background: form.mealCount === n ? "rgba(99,102,241,0.1)" : "var(--surface-2)",
                      color: form.mealCount === n ? "var(--accent)" : "var(--text-primary)",
                      fontWeight: 600, fontSize: "1.1rem",
                    }}>{n}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Preferred Cuisine</label>
                <select className="input" value={form.cuisine} onChange={e => update("cuisine", e.target.value)}>
                  {["General","Pakistani","Indian","Arab","Nigerian","Ghanaian","Ethiopian","Brazilian","Mexican","Italian","Chinese","Japanese","Korean","Turkish","Persian","French","Greek","Thai","Vietnamese"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Medical Conditions (optional)</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {["Diabetes Type 1","Diabetes Type 2","Hypertension","High Cholesterol","Heart Disease","Thyroid Issues","IBS","PCOS","Acid Reflux (GERD)","Celiac Disease","None"].map(c => (
                    <button key={c} onClick={() => toggleArr("medicalConditions", c)} style={{
                      padding: "0.375rem 0.75rem", borderRadius: "999px", fontSize: "0.75rem", cursor: "pointer",
                      border: `1px solid ${form.medicalConditions.includes(c) ? "var(--amber)" : "var(--border)"}`,
                      background: form.medicalConditions.includes(c) ? "rgba(245,158,11,0.1)" : "var(--surface-2)",
                      color: form.medicalConditions.includes(c) ? "var(--amber)" : "var(--text-secondary)",
                    }}>{c}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>AI Setup (Optional)</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                Choose which AI powers your nutrition analysis. Groq is free with no credit card required.
              </p>
              <div>
                <label className="label">AI Provider</label>
                {AI_PROVIDERS.map(p => (
                  <button key={p.value} onClick={() => update("aiProvider", p.value)} style={{
                    display: "block", width: "100%", padding: "0.75rem 1rem", marginBottom: "0.5rem", borderRadius: "8px",
                    border: `2px solid ${form.aiProvider === p.value ? "var(--accent)" : "var(--border)"}`,
                    background: form.aiProvider === p.value ? "rgba(99,102,241,0.1)" : "var(--surface-2)",
                    color: "var(--text-primary)", cursor: "pointer", textAlign: "left",
                  }}>
                    <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>{p.label}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{p.hint}</div>
                  </button>
                ))}
              </div>
              {!["ollama","skip","localai","lmstudio"].includes(form.aiProvider) && (
                <div>
                  <label className="label">API Key</label>
                  <input className="input" type="password" placeholder="Paste your API key here" value={form.aiApiKey}
                    onChange={e => update("aiApiKey", e.target.value)} />
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem" }}>
            <button className="btn-secondary" onClick={() => step > 1 && setStep(s => s - 1)} disabled={step === 1}>
              ← Back
            </button>
            {step < 5 ? (
              <button className="btn-primary" onClick={() => setStep(s => s + 1)}>Next →</button>
            ) : (
              <button className="btn-primary" onClick={finish} disabled={loading}>
                {loading ? "Setting up..." : "🚀 Finish Setup"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
