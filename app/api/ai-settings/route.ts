import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const settings = await prisma.aISettings.findUnique({ where: { userId: session.userId } });
    return NextResponse.json({ settings });
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
    const settings = await prisma.aISettings.upsert({
      where: { userId: session.userId },
      create: { userId: session.userId, provider: body.provider, model: body.model, apiKeyEncrypted: body.apiKey || null, baseUrl: body.baseUrl || null, fallbackProvider: body.fallbackProvider || "groq", fallbackModel: body.fallbackModel || "llama3-70b-8192" },
      update: { provider: body.provider, model: body.model, apiKeyEncrypted: body.apiKey || null, baseUrl: body.baseUrl || null, fallbackProvider: body.fallbackProvider || "groq", fallbackModel: body.fallbackModel || "llama3-70b-8192" },
    });
    return NextResponse.json({ settings });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

