"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard", icon: "🏠", label: "Home" },
  { href: "/log", icon: "🍽️", label: "Log" },
  { href: "/analytics", icon: "📊", label: "Stats" },
  { href: "/water", icon: "💧", label: "Water" },
  { href: "/weight", icon: "⚖️", label: "Weight" },
  { href: "/profile", icon: "👤", label: "Me" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden-desktop" style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      background: "var(--surface)",
      borderTop: "1px solid var(--border)",
      display: "flex",
      justifyContent: "space-around",
      alignItems: "center",
      padding: "0.5rem 0",
      paddingBottom: "env(safe-area-inset-bottom, 0.5rem)",
      zIndex: 100,
      backdropFilter: "blur(12px)",
    }}>
      {NAV.map(item => {
        const active = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.25rem",
            textDecoration: "none",
            color: active ? "var(--accent)" : "var(--text-secondary)",
            transition: "color 0.15s",
          }}>
            <span style={{ fontSize: "1.25rem" }}>{item.icon}</span>
            <span style={{ fontSize: "0.7rem", fontWeight: active ? 600 : 400 }}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
