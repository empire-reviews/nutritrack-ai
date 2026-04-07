import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const pass = process.env.ADMIN_PASSWORD;
  return NextResponse.json({
    hasPass: !!pass,
    length: pass?.length,
    firstChar: pass?.[0],
    lastChar: pass?.[pass.length - 1],
    env: process.env.NODE_ENV
  });
}
