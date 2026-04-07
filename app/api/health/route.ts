import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const status: any = {
    env: {
      DATABASE_URL: !!process.env.DATABASE_URL,
      JWT_SECRET: !!process.env.JWT_SECRET,
      ENCRYPTION_KEY: !!process.env.ENCRYPTION_KEY,
    },
    database: "checking...",
    timestamp: new Date().toISOString()
  };

  try {
    const userCount = await prisma.user.count();
    status.database = `connected (User count: ${userCount})`;
  } catch (err: any) {
    status.database = `error: ${err.message}`;
  }

  return NextResponse.json(status);
}
