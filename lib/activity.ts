import { prisma } from "@/lib/db";

export async function heartbeat(userId: string) {
  const today = new Date().toISOString().split("T")[0];
  const now = new Date();

  try {
    // Upsert the activity record for today
    await prisma.userActivity.upsert({
      where: { userId_date: { userId, date: today } },
      create: {
        userId,
        date: today,
        secondsActive: 30, // Initial burst
        sessionCount: 1,   // First time today = new session
        lastHeartbeat: now
      },
      update: {
        // Increment active time
        secondsActive: { increment: 30 },
        lastHeartbeat: now,
        // sessionCount is handled by the initial login or first heartbeat of the day
      }
    });
  } catch (err) {
    console.error("[Activity Logger] Heartbeat failed:", err);
  }
}

export async function recordSession(userId: string) {
  const today = new Date().toISOString().split("T")[0];
  
  try {
    await prisma.userActivity.upsert({
      where: { userId_date: { userId, date: today } },
      create: {
        userId,
        date: today,
        sessionCount: 1,
        secondsActive: 0,
        lastHeartbeat: new Date()
      },
      update: {
        sessionCount: { increment: 1 }
      }
    });
  } catch (err) {
    console.error("[Activity Logger] Session record failed:", err);
  }
}
