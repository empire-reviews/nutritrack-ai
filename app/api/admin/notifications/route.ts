import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    if (!cookieStore.get("admin_token")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { userId, type, message } = await req.json();

    if (!message) return NextResponse.json({ error: "Message is required" }, { status: 400 });

    if (userId) {
      // Send to specific user
      await prisma.notification.create({
        data: {
          userId,
          type: type || "admin_alert",
          message
        }
      });
    } else {
      // Send to ALL users
      const allUsers = await prisma.user.findMany({ select: { id: true } });
      await prisma.notification.createMany({
        data: allUsers.map(u => ({
          userId: u.id,
          type: type || "admin_alert",
          message
        }))
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/notifications] Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
