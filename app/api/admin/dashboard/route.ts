import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    if (!cookieStore.get("admin_token")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const todayStr = new Date().toISOString().split("T")[0];

    const [
      totalUsers,
      totalFoods,
      activeToday,
      recentUsers,
      aiStats
    ] = await Promise.all([
      prisma.user.count(),
      prisma.foodLog.count(),
      prisma.dailySummary.count({ where: { date: todayStr } }),
      prisma.user.findMany({ 
        take: 5, 
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, createdAt: true, country: true }
      }),
      prisma.aISettings.groupBy({
        by: ["provider"],
        _count: { provider: true }
      })
    ]);

    return NextResponse.json({
      totalUsers,
      totalFoods,
      activeToday,
      recentUsers,
      aiDistribution: aiStats.map(s => ({ name: s.provider, value: s._count.provider }))
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
