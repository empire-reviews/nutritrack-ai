"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#a855f7"];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then(r => {
        if (r.status === 401) { router.push("/admin/login"); throw new Error("Unauthorized"); }
        return r.json();
      })
      .then(d => { if (!d.error) setData(d); })
      .catch(() => toast.error("Failed to load admin data"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading || !data) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--background)" }}>
      <div className="animate-spin" style={{ width: "40px", height: "40px", border: "3px solid var(--border)", borderTop: "3px solid var(--accent)", borderRadius: "50%" }} />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)", padding: "2rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "1.5rem", borderBottom: "1px solid var(--border)" }}>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span>🛡️</span> Master Control Panel
            </h1>
            <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem" }}>NutriTrack AI Global Metrics</p>
          </div>
          <button className="btn-secondary" onClick={() => router.push("/login")}>Exit Admin</button>
        </div>

        {/* Top Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
          <div className="card" style={{ borderLeft: "4px solid #3b82f6" }}>
            <h3 style={{ fontSize: "0.875rem", color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase" }}>Total Users</h3>
            <p style={{ fontSize: "2.5rem", fontWeight: 700, color: "var(--text-primary)" }}>{data.totalUsers}</p>
          </div>
          <div className="card" style={{ borderLeft: "4px solid #22c55e" }}>
            <h3 style={{ fontSize: "0.875rem", color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase" }}>Active Today</h3>
            <p style={{ fontSize: "2.5rem", fontWeight: 700, color: "var(--text-primary)" }}>{data.activeToday}</p>
          </div>
          <div className="card" style={{ borderLeft: "4px solid #f59e0b" }}>
            <h3 style={{ fontSize: "0.875rem", color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase" }}>Total Foods Logged</h3>
            <p style={{ fontSize: "2.5rem", fontWeight: 700, color: "var(--text-primary)" }}>{data.totalFoods}</p>
          </div>
        </div>

        {/* Charts & Tables */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          
          {/* AI Providers */}
          <div className="card" style={{ display: "flex", flexDirection: "column" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1.5rem" }}>AI Provider Distribution</h2>
            {data.aiDistribution.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>No AI settings configured by users.</p>
            ) : (
              <div style={{ height: "300px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.aiDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                      {data.aiDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px" }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Recent Users Table */}
          <div className="card" style={{ overflowX: "auto" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1rem" }}>Newest Users</h2>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-secondary)", textAlign: "left" }}>
                  <th style={{ padding: "0.75rem 0.5rem" }}>Name</th>
                  <th style={{ padding: "0.75rem 0.5rem" }}>Email</th>
                  <th style={{ padding: "0.75rem 0.5rem" }}>Country</th>
                  <th style={{ padding: "0.75rem 0.5rem" }}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {data.recentUsers.map((u: any) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid var(--border)", background: "transparent" }}>
                    <td style={{ padding: "0.75rem 0.5rem", fontWeight: 500 }}>{u.name}</td>
                    <td style={{ padding: "0.75rem 0.5rem", color: "var(--text-secondary)" }}>{u.email}</td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>{u.country || "Unknown"}</td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {data.recentUsers.length === 0 && (
                  <tr><td colSpan={4} style={{ padding: "1rem", textAlign: "center", color: "var(--text-secondary)" }}>No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
