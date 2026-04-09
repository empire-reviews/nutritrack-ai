"use client";
import Link from "next/link";

export default function SettingsClient() {
  return (
    <div style={{ maxWidth: "600px" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" }}>⚙️ Settings</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {[
          { href: "/profile", icon: "👤", label: "Profile", desc: "Update your personal info and nutrition targets" },
          { href: "/onboarding", icon: "🔄", label: "Redo Onboarding", desc: "Update your goals and recalculate targets" },
        ].map(item => (
          <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
            <div className="card" style={{ display: "flex", alignItems: "center", gap: "1rem", cursor: "pointer" }}>
              <div style={{ fontSize: "1.75rem" }}>{item.icon}</div>
              <div>
                <div style={{ fontWeight: 600 }}>{item.label}</div>
                <div style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>{item.desc}</div>
              </div>
              <div style={{ marginLeft: "auto", color: "var(--text-secondary)" }}>→</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
