import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    if (!cookieStore.get("admin_token")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const todayStr = new Date().toISOString().split("T")[0];

    console.log("[admin/dashboard] Fetching stats...");
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const [
        totalUsers,
        totalFoods,
        activeToday,
        recentUsers,
        aiStats,
        goalStats,
        growthStats,
        macroStats
      ] = await Promise.all([
        prisma.user.count().catch(() => 0),
        prisma.foodLog.count().catch(() => 0),
        prisma.dailySummary.count({ where: { date: todayStr } }).catch(() => 0),
        prisma.user.findMany({ 
          take: 10, 
          orderBy: { createdAt: "desc" },
          select: { id: true, name: true, email: true, createdAt: true, country: true }
        }).catch(() => []),
        prisma.aITokenUsage.groupBy({
          by: ["provider"],
          _sum: { tokensUsed: true }
        }).catch(() => []),
        prisma.userProfile.groupBy({
          by: ["goal"],
          _count: { userId: true }
        }).catch(() => []),
        prisma.user.groupBy({
          by: ["createdAt"],
          _count: { id: true },
          where: { createdAt: { gte: sevenDaysAgo } }
        }).catch(() => []),
        prisma.dailySummary.aggregate({
          _avg: { totalCalories: true, totalProtein: true, totalCarbs: true, totalFat: true }
        }).catch(() => ({ _avg: { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 } }))
      ]);

      // Calculate Goal Distribution
      const goalDistribution = goalStats.map(s => ({ 
        name: s.goal.charAt(0).toUpperCase() + s.goal.slice(1), 
        value: s._count.userId 
      }));

      const totalAIQueries = await prisma.aITokenUsage.count().catch(() => 0);
      const aiUsageTrend = await prisma.aITokenUsage.groupBy({
        by: ["date"],
        _count: { id: true },
        where: { createdAt: { gte: sevenDaysAgo } },
        orderBy: { date: "asc" }
      }).catch(() => []);

      return NextResponse.json({
        totalUsers,
        totalFoods,
        activeToday,
        recentUsers,
        goalDistribution,
        totalAIQueries,
        aiUsageTrend: aiUsageTrend.map(t => ({ date: t.date, count: t._count.id })),
        aiDistribution: aiStats.map(s => ({ name: s.provider, value: s._sum.tokensUsed })),
        userGrowth: growthStats.map(s => ({ date: s.createdAt.toISOString().split("T")[0], count: s._count.id })),
        avgMacros: macroStats._avg
      });
    } catch (promiseErr) {
      console.error("[admin/dashboard] Promise.all failed critically:", promiseErr);
      return NextResponse.json({ 
        error: "Database connection timed out or failed",
        details: promiseErr instanceof Error ? promiseErr.message : String(promiseErr)
      }, { status: 500 });
    }
  } catch (err) {
    console.error("[admin/dashboard] Unexpected server error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
