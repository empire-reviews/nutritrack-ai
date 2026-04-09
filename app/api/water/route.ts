import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { syncDailySummary } from "@/lib/sync";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const today = new Date().toISOString().split("T")[0];
    const waterLogs = await prisma.waterLog.findMany({
      where: { userId: session.userId, loggedAt: { gte: new Date(today + "T00:00:00.000Z") } },
      orderBy: { loggedAt: "desc" },
    });
    return NextResponse.json({ waterLogs });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { amountMl } = await req.json();
    const log = await prisma.waterLog.create({
      data: { userId: session.userId, amountMl },
    });
    
    // Sync to DailySummary
    const dateStr = log.loggedAt.toISOString().split("T")[0];
    await syncDailySummary(session.userId, dateStr);

    return NextResponse.json({ log });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const log = await prisma.waterLog.findUnique({ where: { id } });
    if (!log || log.userId !== session.userId) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.waterLog.delete({ where: { id } });
    
    // Sync to DailySummary
    const dateStr = log.loggedAt.toISOString().split("T")[0];
    await syncDailySummary(session.userId, dateStr);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
