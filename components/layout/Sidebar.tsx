"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/dashboard", icon: "🏠", label: "Dashboard" },
  { href: "/log", icon: "🍽️", label: "Log Food" },
  { href: "/analytics", icon: "📊", label: "Analytics" },
  { href: "/water", icon: "💧", label: "Water" },
  { href: "/weight", icon: "⚖️", label: "Weight" },
  { href: "/recommendations", icon: "🥗", label: "Recommendations" },
  { href: "/settings", icon: "⚙️", label: "Settings" },
  { href: "/settings/ai", icon: "🤖", label: "AI Settings" },
  { href: "/profile", icon: "👤", label: "Profile" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside style={{
      width: collapsed ? "64px" : "220px",
      minHeight: "100vh",
      background: "var(--surface)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      transition: "width 0.2s ease",
      flexShrink: 0,
      position: "sticky",
      top: 0,
    }}>
      <div style={{ padding: "1rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "0.75rem", justifyContent: collapsed ? "center" : "space-between" }}>
        {!collapsed && <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.25rem" }}>🥗</span>
          <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)" }}>NutriTrack</span>
        </div>}
        {collapsed && <span style={{ fontSize: "1.5rem" }}>🥗</span>}
        <button onClick={() => setCollapsed(c => !c)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", fontSize: "1rem", padding: "0.25rem" }}>
          {collapsed ? "→" : "←"}
        </button>
      </div>
      <nav style={{ flex: 1, padding: "0.75rem 0.5rem", display: "flex", flexDirection: "column", gap: "2px" }}>
        {NAV.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: collapsed ? "0.625rem" : "0.625rem 0.875rem",
              borderRadius: "8px",
              textDecoration: "none",
              background: active ? "rgba(99,102,241,0.15)" : "transparent",
              color: active ? "var(--accent)" : "var(--text-secondary)",
              fontWeight: active ? 600 : 400,
              fontSize: "0.875rem",
              transition: "background 0.15s, color 0.15s",
              justifyContent: collapsed ? "center" : "flex-start",
            }} title={collapsed ? item.label : undefined}>
              <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
