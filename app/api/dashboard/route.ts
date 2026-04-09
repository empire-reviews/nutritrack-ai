import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const today = new Date().toISOString().split("T")[0];
    const start = new Date(today + "T00:00:00.000Z");
    const end = new Date(today + "T23:59:59.999Z");

    const [profile, foodLogs, waterLogs, mealSessions, aiCount] = await Promise.all([
      prisma.userProfile.findUnique({ where: { userId: session.userId } }).catch(e => { console.error("[dashboard] profile failed:", e); return null; }),
      prisma.foodLog.findMany({
        where: { userId: session.userId, loggedAt: { gte: start, lte: end } },
        include: { mealSession: true },
        orderBy: { loggedAt: "asc" },
      }).catch(e => { console.error("[dashboard] foodLogs failed:", e); return []; }),
      prisma.waterLog.findMany({
        where: { userId: session.userId, loggedAt: { gte: start, lte: end } },
      }).catch(e => { console.error("[dashboard] waterLogs failed:", e); return []; }),
      prisma.mealSession.findMany({
        where: { userId: session.userId },
        orderBy: { orderIndex: "asc" },
      }).catch(e => { console.error("[dashboard] mealSessions failed:", e); return []; }),
      prisma.aITokenUsage.count({
        where: { userId: session.userId }
      }).catch(e => { console.error("[dashboard] aiCount failed:", e); return 0; }),
    ]);

    const totals = foodLogs.reduce(
      (acc, log) => ({
        calories: acc.calories + log.calories,
        protein: acc.protein + log.protein,
        carbs: acc.carbs + log.carbs,
        fat: acc.fat + log.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    const totalWater = waterLogs.reduce((acc, w) => acc + w.amountMl, 0);

    // Streak calculation
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentSummaries = await prisma.dailySummary.findMany({
      where: { userId: session.userId, date: { gte: thirtyDaysAgo.toISOString().split("T")[0] } },
      orderBy: { date: "desc" },
    });

    let streak = 0;
    const todayStr = today;
    let checkDate = new Date();
    while (true) {
      const dateStr = checkDate.toISOString().split("T")[0];
      if (dateStr === todayStr) {
        const todayLogs = foodLogs.length > 0;
        if (todayLogs) { streak++; checkDate.setDate(checkDate.getDate() - 1); continue; }
        else break;
      }
      const summary = recentSummaries.find((s) => s.date === dateStr);
      if (summary && summary.totalCalories > 0) { streak++; checkDate.setDate(checkDate.getDate() - 1); }
      else break;
    }

    return NextResponse.json({
      totals: totals || { calories: 0, protein: 0, carbs: 0, fat: 0 },
      totalWater: totalWater || 0,
      targets: profile || { 
        dailyCalorieTarget: 2000, 
        dailyProteinTarget: 150, 
        dailyCarbTarget: 250,
        dailyFatTarget: 65,
        dailyWaterTargetMl: 2500,
        gender: "Prefer not to say",
        weightKg: 70
      },
      foodLogs: foodLogs || [],
      mealSessions: mealSessions || [],
      streak: streak || 0,
      aiQueryCount: aiCount || 0,
      date: today,
    });
  } catch (err) {
    console.error("[dashboard] fatal catch:", err);
    // Even on total failure, return a safe fallback state so the UI doesn't hang
    return NextResponse.json({
      totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      totalWater: 0,
      targets: { dailyCalories: 2000, dailyProtein: 150 },
      foodLogs: [],
      mealSessions: [],
      streak: 0,
      date: new Date().toISOString().split("T")[0]
    });
  }
}
