import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { aiComplete, recommendationsPrompt } from "@/lib/ai/aiService";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const aiSettings = await prisma.aISettings.findUnique({ where: { userId: session.userId } });
    const profile = await prisma.userProfile.findUnique({ where: { userId: session.userId } });
    const user = await prisma.user.findUnique({ where: { id: session.userId } });

    const prompt = recommendationsPrompt({
      country: user?.country || "US",
      goal: profile?.goal || "maintain",
      remainingCalories: body.remainingCalories || 500,
      remainingProtein: body.remainingProtein || 50,
      dietaryRestrictions: JSON.parse(profile?.dietaryRestrictions || "[]"),
      medicalConditions: JSON.parse(profile?.medicalConditions || "[]"),
      cuisine: profile?.cuisine || "General",
    });

    const aiResp = await aiComplete(prompt, aiSettings ? {
      provider: aiSettings.provider,
      model: aiSettings.model,
      apiKey: aiSettings.apiKeyEncrypted || undefined,
    } : undefined);

    let data;
    try {
      const cleaned = aiResp.text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      data = JSON.parse(cleaned);
    } catch {
      data = { quickSnacks: [], nextMeal: null, toHitGoal: { summary: aiResp.text, options: [] } };
    }

    return NextResponse.json({ data, provider: aiResp.provider });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

