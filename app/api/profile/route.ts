import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const [user, profile] = await Promise.all([
      prisma.user.findUnique({ where: { id: session.userId }, select: { id: true, name: true, email: true, country: true } }),
      prisma.userProfile.findUnique({ where: { userId: session.userId } }),
    ]);
    return NextResponse.json({ user, profile });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    await prisma.user.update({ where: { id: session.userId }, data: { name: body.name, country: body.country } });
    if (body.profile) {
      await prisma.userProfile.updateMany({ where: { userId: session.userId }, data: body.profile });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

