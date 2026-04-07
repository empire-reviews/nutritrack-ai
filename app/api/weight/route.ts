import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const weightLogs = await prisma.weightLog.findMany({
      where: { userId: session.userId },
      orderBy: { loggedAt: "desc" },
      take: 60,
    });
    return NextResponse.json({ weightLogs });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { weightKg } = await req.json();
    const log = await prisma.weightLog.create({
      data: { userId: session.userId, weightKg },
    });
    await prisma.userProfile.updateMany({
      where: { userId: session.userId },
      data: { weightKg },
    });
    return NextResponse.json({ log });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

