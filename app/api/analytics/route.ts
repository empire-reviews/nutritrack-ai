import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const days = parseInt(req.nextUrl.searchParams.get("days") || "30");
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceStr = since.toISOString().split("T")[0];

    const [summaries, weightLogs, waterLogs] = await Promise.all([
      prisma.dailySummary.findMany({
        where: { userId: session.userId, date: { gte: sinceStr } },
        orderBy: { date: "asc" },
      }),
      prisma.weightLog.findMany({
        where: { userId: session.userId, loggedAt: { gte: since } },
        orderBy: { loggedAt: "asc" },
      }),
      prisma.waterLog.findMany({
        where: { userId: session.userId, loggedAt: { gte: since } },
        orderBy: { loggedAt: "asc" },
      }),
    ]);

    const profile = await prisma.userProfile.findUnique({ where: { userId: session.userId } });

    return NextResponse.json({ summaries, weightLogs, waterLogs, profile });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

