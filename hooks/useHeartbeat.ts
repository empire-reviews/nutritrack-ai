import { useEffect } from "react";

export function useHeartbeat() {
  useEffect(() => {
    // Only run if we are in the browser
    if (typeof window === "undefined") return;

    const interval = 30000; // 30 seconds

    const ping = async () => {
      try {
        await fetch("/api/activity/heartbeat", { method: "POST" });
      } catch (err) {
        console.warn("[Heartbeat] Ping failed");
      }
    };

    // Initial ping
    ping();

    // Set up recurring ping
    const timer = setInterval(ping, interval);

    // Clean up
    return () => clearInterval(timer);
  }, []);
}
