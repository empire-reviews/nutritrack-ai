"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ProfileClient() {
  const [user, setUser] = useState<{ name: string; email: string; country: string } | null>(null);
  const [profile, setProfile] = useState<{ age: number; gender: string; heightCm: number; weightKg: number; goal: string; activityLevel: string; dailyCalorieTarget: number; dailyProteinTarget: number; dailyCarbTarget: number; dailyFatTarget: number; } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetch("/api/profile").then(r => r.json()).then(d => { if (d.user) setUser(d.user); if (d.profile) setProfile(d.profile); }); }, []);

  async function save() {
    setSaving(true);
    await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: user?.name, country: user?.country }) });
    toast.success("Profile updated!");
    setSaving(false);
  }

  if (!user) return <div style={{ color: "var(--text-secondary)" }}>Loading...</div>;

  return (
    <div style={{ maxWidth: "600px" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" }}>👤 Profile</h1>
      <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "2rem" }}>
        <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem", fontWeight: 700, color: "white" }}>
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>{user.name}</div>
          <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>{user.email}</div>
        </div>
      </div>
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>Personal Information</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          <div><label className="label">Display Name</label><input className="input" value={user.name} onChange={e => setUser(u => u ? { ...u, name: e.target.value } : u)} /></div>
          <div><label className="label">Email</label><input className="input" value={user.email} disabled style={{ opacity: 0.6 }} /></div>
          <div><label className="label">Country</label><input className="input" value={user.country} onChange={e => setUser(u => u ? { ...u, country: e.target.value } : u)} /></div>
        </div>
        <button className="btn-primary" onClick={save} disabled={saving} style={{ marginTop: "1rem" }}>{saving ? "Saving..." : "Save Changes"}</button>
      </div>
      {profile && (
        <div className="card">
          <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>Daily Nutrition Targets</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            {[
              { label: "Calories", value: `${profile.dailyCalorieTarget} kcal`, color: "#3b82f6" },
              { label: "Protein", value: `${profile.dailyProteinTarget}g`, color: "#22c55e" },
              { label: "Carbs", value: `${profile.dailyCarbTarget}g`, color: "#f59e0b" },
              { label: "Fat", value: `${profile.dailyFatTarget}g`, color: "#ef4444" },
              { label: "Goal", value: profile.goal, color: "#a855f7" },
              { label: "Activity", value: profile.activityLevel, color: "#06b6d4" },
            ].map(s => (
              <div key={s.label} style={{ padding: "0.75rem", borderRadius: "8px", background: "var(--surface-2)" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{s.label}</div>
                <div style={{ fontWeight: 600, color: s.color, textTransform: "capitalize" }}>{s.value}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.75rem" }}>
            To update targets, <a href="/onboarding" style={{ color: "var(--accent)" }}>redo onboarding</a>
          </p>
        </div>
      )}
    </div>
  );
}
