import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signToken, setAuthCookie } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, country } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, country: country || "US" },
    });
    const token = await signToken({ userId: user.id, email: user.email, role: user.role });
    await setAuthCookie(token);
    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, isOnboarded: user.isOnboarded },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

