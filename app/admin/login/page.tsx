"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

import PasswordField from "@/components/ui/PasswordField";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Login failed"); return; }
      toast.success("Welcome, Admin");
      router.push("/admin");
    } catch { toast.error("Network error"); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--background)", padding: "1rem" }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🛡️</div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text-primary)" }}>Admin Panel</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem" }}>Enter master key to continue</p>
        </div>
        <div className="card" style={{ padding: "2rem" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <PasswordField 
              label="Master Password" 
              placeholder="••••••••" 
              value={password}
              onChange={e => setPassword(e.target.value)} 
              required 
            />
            <button className="btn-primary" type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center", padding: "0.75rem", marginTop: "0.5rem", background: "var(--red)" }}>
              {loading ? "Authenticating..." : "Access Dashboard"}
            </button>
          </form>
          <div style={{ marginTop: "1.5rem", borderTop: "1px solid var(--border)", paddingTop: "1rem", textAlign: "center" }}>
            <Link href="/login" style={{ color: "var(--text-secondary)", fontSize: "0.75rem", textDecoration: "none" }}>← Back to Application</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
