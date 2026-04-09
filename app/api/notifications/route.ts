import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const notifications = await prisma.notification.findMany({
      where: { userId: session.userId, read: false },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ notifications });
  } catch (err) {
    console.error("[api/notifications] GET error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { notificationId } = await req.json();
    if (!notificationId) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.notification.update({
      where: { id: notificationId, userId: session.userId },
      data: { read: true }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/notifications] POST error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
