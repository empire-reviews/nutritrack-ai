"use client";
import { useState, useEffect } from "react";

interface Notification {
  id: string;
  type: string;
  message: string;
  createdAt: string;
}

export default function NotificationBanner() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    // Poll every 2 minutes for new broadcasts
    const interval = setInterval(fetchNotifications, 120000);
    return () => clearInterval(interval);
  }, []);

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }

  async function dismiss(id: string) {
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id })
      });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch (error) {
      console.error("Failed to dismiss notification:", error);
    }
  }

  if (loading || notifications.length === 0) return null;

  return (
    <div style={{ padding: "0 1.5rem", marginTop: "1rem" }}>
      {notifications.map((note) => (
        <div 
          key={note.id}
          className="card"
          style={{ 
            background: "linear-gradient(45deg, var(--surface-2), var(--background))",
            border: "1px solid var(--accent)",
            marginBottom: "1rem",
            padding: "1rem 1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 4px 20px rgba(59, 130, 246, 0.15)",
            animation: "slideDown 0.4s ease-out"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ fontSize: "1.25rem" }}>
              {note.type === "alert" ? "🚨" : note.type === "tip" ? "💡" : "📣"}
            </span>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--accent)", textTransform: "uppercase", marginBottom: "0.2rem" }}>
                Admin {note.type || "Update"}
              </div>
              <p style={{ fontSize: "0.95rem", color: "var(--text-primary)", margin: 0 }}>{note.message}</p>
            </div>
          </div>
          <button 
            onClick={() => dismiss(note.id)}
            style={{ 
              background: "rgba(255,255,255,0.05)", 
              border: "1px solid var(--border)", 
              color: "var(--text-secondary)",
              padding: "0.4rem 0.8rem",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.75rem",
              fontWeight: 600,
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
            onMouseOut={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
          >
            Dismiss
          </button>
        </div>
      ))}
      <style jsx>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
