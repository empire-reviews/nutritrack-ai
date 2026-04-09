"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function TopBar({ user }: { user?: { name: string; email: string } | null }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Signed out");
    router.push("/login");
  }

  return (
    <header style={{
      height: "60px",
      background: "var(--surface)",
      borderBottom: "1px solid var(--border)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 1.5rem",
      position: "sticky",
      top: 0,
      zIndex: 10,
    }}>
      <div className="hidden-mobile" style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>{today}</div>
      <div className="hidden-desktop" style={{ color: "var(--accent)", fontWeight: 700, fontSize: "1rem" }}>NutriTrack</div>
      <div style={{ position: "relative" }}>
        <button onClick={() => setMenuOpen(o => !o)} style={{
          display: "flex", alignItems: "center", gap: "0.5rem",
          background: "var(--surface-2)", border: "1px solid var(--border)",
          borderRadius: "8px", padding: "0.45rem 0.75rem",
          cursor: "pointer", color: "var(--text-primary)", fontSize: "0.875rem",
        }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "0.75rem", fontWeight: 600 }}>
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <span style={{ fontWeight: 500 }}>{user?.name || "User"}</span>
          <span style={{ color: "var(--text-secondary)" }}>▾</span>
        </button>
        {menuOpen && (
          <div style={{
            position: "absolute", right: 0, top: "calc(100% + 8px)",
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "10px", minWidth: "180px", overflow: "hidden",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)", zIndex: 100,
          }}>
            {[
              { label: "View Profile", href: "/profile" },
              { label: "Settings", href: "/settings" },
              { label: "AI Settings", href: "/settings/ai" },
            ].map(item => (
              <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)} style={{
                display: "block", padding: "0.625rem 1rem",
                color: "var(--text-primary)", textDecoration: "none",
                fontSize: "0.875rem", transition: "background 0.1s",
              }} onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-2)")}
                 onMouseLeave={e => (e.currentTarget.style.background = "")}>
                {item.label}
              </a>
            ))}
            <div style={{ borderTop: "1px solid var(--border)" }} />
            <button onClick={handleLogout} style={{
              display: "block", width: "100%", padding: "0.625rem 1rem",
              color: "var(--red)", textAlign: "left", background: "none",
              border: "none", cursor: "pointer", fontSize: "0.875rem",
            }}>Sign Out</button>
          </div>
        )}
      </div>
    </header>
  );
}
