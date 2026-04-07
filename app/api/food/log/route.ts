import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { syncDailySummary } from "@/lib/sync";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const date = req.nextUrl.searchParams.get("date") || new Date().toISOString().split("T")[0];
    const start = new Date(date + "T00:00:00.000Z");
    const end = new Date(date + "T23:59:59.999Z");
    const logs = await prisma.foodLog.findMany({
      where: { userId: session.userId, loggedAt: { gte: start, lte: end } },
      include: { mealSession: true },
      orderBy: { loggedAt: "asc" },
    });
    return NextResponse.json({ logs });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const log = await prisma.foodLog.create({
      data: {
        userId: session.userId,
        mealSessionId: body.mealSessionId || null,
        foodName: body.foodName,
        brand: body.brand || null,
        quantity: body.quantity,
        unit: body.unit || "g",
        calories: body.calories,
        protein: body.protein,
        carbs: body.carbs,
        fat: body.fat,
        fiber: body.fiber || null,
        sugar: body.sugar || null,
        sodium: body.sodium || null,
        aiParsed: body.aiParsed || false,
        loggedAt: body.loggedAt ? new Date(body.loggedAt) : new Date(),
      },
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
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    
    const log = await prisma.foodLog.findUnique({ where: { id, userId: session.userId } });
    if (log) {
      await prisma.foodLog.delete({ where: { id } });
      const dateStr = log.loggedAt.toISOString().split("T")[0];
      await syncDailySummary(session.userId, dateStr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

