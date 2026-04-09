"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, 
  LineChart, Line, XAxis, YAxis, CartesianGrid 
} from "recharts";
import PasswordField from "@/components/ui/PasswordField";

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#a855f7", "#06b6d4"];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"stats" | "users" | "ai">("stats");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // User Management State
  const [userList, setUserList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(false);

  // AI Config State
  const [aiConfig, setAiConfig] = useState<any>(null);
  const [savingAi, setSavingAi] = useState(false);
  const [masterPassword, setMasterPassword] = useState("");

  // Notification State
  const [noteMessage, setNoteMessage] = useState("");
  const [sendingNote, setSendingNote] = useState(false);

  useEffect(() => {
    loadStats();
    loadAiConfig();
    loadUsers();
  }, []);

  async function loadStats() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/dashboard", { credentials: "include" });
      if (res.status === 401) return router.push("/admin/login");
      const d = await res.json();
      setData(d);
    } catch { toast.error("Failed to load platform stats"); }
    finally { setLoading(false); }
  }

  async function loadUsers(q = "") {
    try {
      const res = await fetch(`/api/admin/users?query=${q}`, { credentials: "include" });
      const d = await res.json();
      if (d.users) setUserList(d.users);
    } catch { toast.error("Failed to load user list"); }
  }

  async function loadAiConfig() {
    try {
      const res = await fetch("/api/admin/settings", { credentials: "include" });
      const d = await res.json();
      if (d.settings) setAiConfig(d.settings);
    } catch { }
  }

  async function viewUser(userId: string) {
    setLoadingUser(true);
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, { credentials: "include" });
      const d = await res.json();
      setSelectedUser(d);
    } catch { toast.error("Could not load user details"); }
    finally { setLoadingUser(false); }
  }

  async function sendNotification(targetUserId?: string) {
    if (!noteMessage) return toast.error("Enter a message");
    setSendingNote(true);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetUserId, message: noteMessage }),
        credentials: "include"
      });
      if (res.ok) {
        toast.success(targetUserId ? "Notification sent to user!" : "Broadcast sent to all users!");
        setNoteMessage("");
      } else toast.error("Failed to send notification");
    } catch { toast.error("Error sending notification"); }
    finally { setSendingNote(false); }
  }

  async function saveAiConfig() {
    if (!masterPassword) return toast.error("Master Password required");
    setSavingAi(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: aiConfig, password: masterPassword }),
        credentials: "include"
      });
      if (res.ok) {
        toast.success("AI Vault updated!");
        setMasterPassword("");
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed to save AI settings");
      }
    } catch { toast.error("Network error"); }
    finally { setSavingAi(false); }
  }

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--background)" }}>
      <div className="animate-spin" style={{ width: "40px", height: "40px", border: "3px solid var(--border)", borderTop: "3px solid var(--accent)", borderRadius: "50%" }} />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)", padding: "2rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: "1.5rem", borderBottom: "1px solid var(--border)" }}>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span>🛡️</span> Master Command Center
            </h1>
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              {[
                { id: "stats", label: "📊 Global Insights" },
                { id: "users", label: "👥 User Management" },
                { id: "ai", label: "🤖 AI Control Vault" }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{ 
                    padding: "0.6rem 1.25rem", borderRadius: "8px", cursor: "pointer", border: "none",
                    background: activeTab === tab.id ? "var(--accent)" : "var(--surface-2)",
                    color: activeTab === tab.id ? "#fff" : "var(--text-secondary)",
                    fontWeight: 600, transition: "all 0.2s"
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <button className="btn-secondary" onClick={() => router.push("/dashboard")}>Return to App</button>
        </div>

        {/* --- STATS TAB --- */}
        {activeTab === "stats" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
              <div className="card" style={{ borderLeft: "5px solid #3b82f6" }}>
                <h3 style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase" }}>Total Users</h3>
                <p style={{ fontSize: "2.5rem", fontWeight: 800 }}>{data?.totalUsers ?? 0}</p>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>↑ 12% from last week</div>
              </div>
              <div className="card" style={{ borderLeft: "5px solid #22c55e" }}>
                <h3 style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase" }}>Active Interactions Today</h3>
                <p style={{ fontSize: "2.5rem", fontWeight: 800 }}>{data?.activeToday ?? 0}</p>
                <div style={{ fontSize: "0.75rem", color: "#22c55e", fontWeight: 600, marginTop: "0.5rem" }}>Online Users: {userList.filter(u => u.isOnline).length}</div>
              </div>
              <div className="card" style={{ borderLeft: "5px solid #8b5cf6" }}>
                <h3 style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase" }}>Total Platform AI Queries</h3>
                <p style={{ fontSize: "2.5rem", fontWeight: 800 }}>{data?.totalAIQueries ?? 0}</p>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>Requests processed successfully</div>
              </div>
              <div className="card" style={{ borderLeft: "5px solid #f59e0b" }}>
                <h3 style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase" }}>Avg Daily Protein</h3>
                <p style={{ fontSize: "2.5rem", fontWeight: 800 }}>{Math.round(data?.avgMacros?.totalProtein || 0)}g</p>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>Across all active customers</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              <div className="card">
                <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1.5rem" }}>User Goal Distribution</h2>
                <div style={{ height: "300px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data?.goalDistribution || []} dataKey="value" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} label>
                        {data?.goalDistribution?.map((_: any, index: number) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="card">
                <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1.5rem" }}>Platform AI Load (Intensity)</h2>
                <div style={{ height: "300px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data?.aiUsageTrend || []}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={11} />
                      <YAxis stroke="var(--text-secondary)" fontSize={11} />
                      <RechartsTooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)" }} />
                      <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="card" style={{ border: "1px solid var(--accent)", background: "rgba(99,102,241,0.05)", marginTop: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                <span style={{ fontSize: "1.5rem" }}>📣</span>
                <div>
                  <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Global Platform Broadcast</h2>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Send a message to every registered user dashboard across the platform.</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <input 
                  className="input-field" 
                  placeholder="Type a global announcement..." 
                  style={{ flex: 1 }}
                  value={noteMessage}
                  onChange={e => setNoteMessage(e.target.value)}
                  onKeyPress={e => e.key === "Enter" && sendNotification()}
                />
                <button className="btn-primary" onClick={() => sendNotification()} disabled={sendingNote || !noteMessage}>
                  {sendingNote ? "Broadcasting..." : "🚀 Launch Broadcast"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- USERS TAB --- */}
        {activeTab === "users" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.5rem" }}>
              <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
                <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }}>🔍</span>
                <input 
                  type="text" 
                  placeholder="Search by name or email..." 
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); loadUsers(e.target.value); }}
                  className="input-field"
                  style={{ width: "100%", paddingLeft: "2.5rem" }}
                />
              </div>
              <button className="btn-primary" onClick={() => loadUsers()}>Refresh List</button>
            </div>

            <div className="card" style={{ overflowX: "auto", padding: 0 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-secondary)", fontSize: "0.8rem", textTransform: "uppercase", textAlign: "left" }}>
                    <th style={{ padding: "1.25rem 1.5rem" }}>User</th>
                    <th style={{ padding: "1.25rem 1.5rem" }}>Goal</th>
                    <th style={{ padding: "1.25rem 1.5rem" }}>Location</th>
                    <th style={{ padding: "1.25rem 1.5rem" }}>Joined</th>
                    <th style={{ padding: "1.25rem 1.5rem" }}>Status</th>
                    <th style={{ padding: "1.25rem 1.5rem" }}>AI Queries</th>
                    <th style={{ padding: "1.25rem 1.5rem", textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {userList.map(u => (
                    <tr key={u.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.2s" }} onClick={() => viewUser(u.id)}>
                      <td style={{ padding: "1.25rem 1.5rem" }}>
                        <div style={{ fontWeight: 600 }}>{u.name}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{u.email}</div>
                      </td>
                      <td style={{ padding: "1.25rem 1.5rem" }}>
                        <span className="badge" style={{ background: "rgba(99,102,241,0.1)", color: "var(--accent)" }}>{u.goal}</span>
                      </td>
                      <td style={{ padding: "1.25rem 1.5rem", color: "var(--text-secondary)" }}>{u.country}</td>
                      <td style={{ padding: "1.25rem 1.5rem", color: "var(--text-secondary)" }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: "1.25rem 1.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: u.isOnline ? "#22c55e" : "#4b5563", boxShadow: u.isOnline ? "0 0 10px #22c55e" : "none" }} />
                          <span style={{ fontSize: "0.8rem", color: u.isOnline ? "#22c55e" : "var(--text-secondary)", fontWeight: 600 }}>{u.isOnline ? "ONLINE" : "OFFLINE"}</span>
                        </div>
                      </td>
                      <td style={{ padding: "1.25rem 1.5rem", fontWeight: 700, color: "var(--accent)" }}>{u.aiQueries ?? 0}</td>
                      <td style={{ padding: "1.25rem 1.5rem", textAlign: "right" }}>
                        <button className="btn-secondary" style={{ fontSize: "0.75rem", padding: "0.4rem 0.8rem" }}>Audit Profile</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="card">
              <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1rem" }}>📢 Broadcast System</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>Send a global notification to all registered customers.</p>
              <textarea 
                className="input-field" 
                rows={3} 
                placeholder="Alert all users about maintenance, tips, or updates..." 
                value={noteMessage}
                onChange={e => setNoteMessage(e.target.value)}
                style={{ width: "100%", marginBottom: "1rem", resize: "none" }}
              />
              <button className="btn-primary" onClick={() => sendNotification()} disabled={sendingNote || !noteMessage}>
                {sendingNote ? "Blasting..." : "🚀 Push Global Broadcast"}
              </button>
            </div>
          </div>
        )}

        {/* --- AI VAULT TAB --- */}
        {activeTab === "ai" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
             <div className="card">
               <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--accent)", marginBottom: "1rem" }}>🛡️ Master AI Provider Vault</h2>
               <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>Centralized AI keys for the entire platform. This powers all user's food logging and recommendations.</p>
               {aiConfig ? (
                 <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
                      {["primary", "fallback1", "fallback2"].map((slot, idx) => (
                        <div key={slot} className="card" style={{ background: "var(--surface-2)", border: idx === 0 ? "2px solid var(--accent)" : "1px solid var(--border)" }}>
                          <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ width: "22px", height: "22px", background: idx === 0 ? "var(--accent)" : "var(--text-secondary)", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem" }}>{idx+1}</span>
                            {slot === "primary" ? "Main Provider" : `Backup Layer ${idx}`}
                          </h3>
                          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                             <div>
                               <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.4rem" }}>Provider</label>
                               <select className="input-field" style={{ width: "100%" }} value={aiConfig[slot].provider} onChange={e => setAiConfig({...aiConfig, [slot]: {...aiConfig[slot], provider: e.target.value}})}>
                                 {["groq", "gemini", "openai", "anthropic", "mistral"].map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                               </select>
                             </div>
                             <div>
                               <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.4rem" }}>Model</label>
                               <input className="input-field" style={{ width: "100%" }} value={aiConfig[slot].model} onChange={e => setAiConfig({...aiConfig, [slot]: {...aiConfig[slot], model: e.target.value}})} />
                             </div>
                             <div>
                               <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.4rem" }}>API Key</label>
                               <PasswordField value={aiConfig[slot].apiKey} onChange={v => setAiConfig({...aiConfig, [slot]: {...aiConfig[slot], apiKey: v}})} placeholder="••••••••••••" />
                             </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div style={{ paddingTop: "2rem", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                       <div style={{ maxWidth: "400px" }}>
                         <h4 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.5rem" }}>Final Authorization</h4>
                         <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>Enter Master Password to encrypt and store these global credentials.</p>
                         <PasswordField value={masterPassword} onChange={(e) => setMasterPassword(e.target.value)} placeholder="Master Password" />
                       </div>
                       <button className="btn-primary" onClick={saveAiConfig} disabled={savingAi} style={{ padding: "0.8rem 2.5rem" }}>
                         {savingAi ? "Syncing Keys..." : "💾 Update Global AI Infrastructure"}
                       </button>
                    </div>
                 </div>
               ) : <p>Loading vault settings...</p>}
             </div>
          </div>
        )}

        {/* --- USER DETAIL MODAL --- */}
        {selectedUser && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "2rem" }}>
            <div className="card" style={{ maxWidth: "900px", width: "100%", maxHeight: "90vh", overflowY: "auto", border: "1px solid var(--accent)", position: "relative" }}>
              <button onClick={() => setSelectedUser(null)} style={{ position: "absolute", right: "1.5rem", top: "1.5rem", background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: "1.5rem" }}>✕</button>
              
              <div style={{ display: "flex", gap: "2rem", marginBottom: "2.5rem" }}>
                <div style={{ width: "80px", height: "80px", background: "var(--accent)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", color: "#fff" }}>
                  {selectedUser.user.name[0]}
                </div>
                <div>
                  <h2 style={{ fontSize: "1.75rem", fontWeight: 800 }}>{selectedUser.user.name}</h2>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginTop: "0.5rem" }}>
                    <span style={{ color: "var(--text-secondary)" }}>{selectedUser.user.email}</span>
                    <span style={{ width: "1px", height: "14px", background: "var(--border)" }} />
                    <span style={{ fontSize: "0.875rem", color: selectedUser.isOnline ? "#22c55e" : "#6b7280", fontWeight: 700 }}>
                      {selectedUser.isOnline ? "● ONLINE NOW" : `LAST SEEN: ${new Date(selectedUser.activity[0]?.lastHeartbeat || selectedUser.user.createdAt).toLocaleDateString()}`}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
                <div className="card" style={{ background: "var(--surface-2)" }}>
                  <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "1rem" }}>📊 Usage & Engagement</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.875rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-secondary)" }}>Time Spent (Today)</span>
                      <span style={{ fontWeight: 600 }}>{Math.round((selectedUser.activity[0]?.secondsActive || 0) / 60)} mins</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-secondary)" }}>Login Sessions (Today)</span>
                      <span style={{ fontWeight: 600 }}>{selectedUser.activity[0]?.sessionCount || 0}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-secondary)" }}>Total AI Queries</span>
                      <span style={{ fontWeight: 600 }}>{selectedUser.user._count?.aiTokenUsage || 0}</span>
                    </div>
                  </div>
                </div>
                
                <div className="card" style={{ background: "var(--surface-2)" }}>
                  <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "1rem" }}>⚖️ Physical Profile</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.875rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-secondary)" }}>Goal</span>
                      <span className="badge" style={{ padding: "0.2rem 0.5rem" }}>{selectedUser.profile?.goal || "maintain"}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-secondary)" }}>Current Weight</span>
                      <span style={{ fontWeight: 600 }}>{selectedUser.profile?.weightKg || "N/A"} kg</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-secondary)" }}>Targets</span>
                      <span style={{ fontWeight: 600 }}>{selectedUser.profile?.dailyCalorieTarget} kcal | {selectedUser.profile?.dailyProteinTarget}g P</span>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ background: "var(--surface-2)" }}>
                   <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "1rem" }}>🔐 Security Audit</h3>
                   <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Encrypted Password Hash</label>
                   <div style={{ fontSize: "0.65rem", padding: "0.5rem", background: "var(--background)", borderRadius: "4px", wordBreak: "break-all", marginTop: "0.5rem", opacity: 0.8, fontFamily: "monospace" }}>
                      {selectedUser.user.passwordHash}
                   </div>
                   <button className="btn-secondary" style={{ width: "100%", fontSize: "0.75rem", marginTop: "1rem" }}>Reset Customer Password</button>
                </div>
              </div>

              <div className="card" style={{ marginTop: "1.5rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>💬 Direct Command Notification</h3>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <input 
                    className="input-field" 
                    placeholder="Send a private tip or alert to this user's dashboard..." 
                    style={{ flex: 1 }}
                    value={noteMessage}
                    onChange={e => setNoteMessage(e.target.value)}
                  />
                  <button className="btn-primary" onClick={() => sendNotification(selectedUser.user.id)} disabled={sendingNote || !noteMessage}>
                    {sendingNote ? "Sending..." : "Send Flash Alert"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
