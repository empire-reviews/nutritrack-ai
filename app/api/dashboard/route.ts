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

    const [profile, foodLogs, waterLogs, mealSessions] = await Promise.all([
      prisma.userProfile.findUnique({ where: { userId: session.userId } }),
      prisma.foodLog.findMany({
        where: { userId: session.userId, loggedAt: { gte: start, lte: end } },
        include: { mealSession: true },
        orderBy: { loggedAt: "asc" },
      }),
      prisma.waterLog.findMany({
        where: { userId: session.userId, loggedAt: { gte: start, lte: end } },
      }),
      prisma.mealSession.findMany({
        where: { userId: session.userId },
        orderBy: { orderIndex: "asc" },
      }),
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
      totals,
      totalWater,
      targets: profile || {},
      foodLogs,
      mealSessions,
      streak,
      date: today,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

