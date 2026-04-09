import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { aiComplete } from "@/lib/ai/aiService";
import { logAIUsage } from "@/lib/ai/logger";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { message } = await req.json();
    
    const todayStr = new Date().toISOString().split('T')[0];
    const [profile, user, dailySummary, todayLogs] = await Promise.all([
      prisma.userProfile.findUnique({ where: { userId: session.userId } }),
      prisma.user.findUnique({ where: { id: session.userId }, select: { name: true, country: true } }),
      prisma.dailySummary.findUnique({ where: { userId_date: { userId: session.userId, date: todayStr } } }),
      prisma.foodLog.findMany({ 
        where: { userId: session.userId, loggedAt: { gte: new Date(todayStr) } },
        select: { foodName: true, quantity: true, unit: true, calories: true }
      })
    ]);
    const aiSettings = await prisma.aISettings.findUnique({ where: { userId: session.userId } });

    let diet = "None";
    let medical = "None";
    try {
      const parsedDiet = JSON.parse(profile?.dietaryRestrictions || "[]");
      if (parsedDiet.length > 0) diet = parsedDiet.join(", ");
      
      const parsedMed = JSON.parse(profile?.medicalConditions || "[]");
      if (parsedMed.length > 0) medical = parsedMed.join(", ");
    } catch { /* ignore parse errors */ }

    const eatenList = todayLogs && todayLogs.length > 0 
      ? todayLogs.map(f => `${f.quantity}${f.unit} ${f.foodName} (${Math.round(f.calories)}kcal)`).join(", ")
      : "Nothing logged yet today.";
      
    const intakeSoFar = dailySummary 
      ? `${Math.round(dailySummary.totalCalories)}kcal, ${Math.round(dailySummary.totalProtein)}g protein, ${Math.round(dailySummary.totalCarbs)}g carbs, ${Math.round(dailySummary.totalFat)}g fat.`
      : `0kcal, 0g protein, 0g carbs, 0g fat.`;

    const systemPrompt = `You are a certified AI clinical nutritionist named NutriBot. 
User: ${user?.name}, from ${user?.country}.
Daily targets: ${profile?.dailyCalorieTarget}kcal, ${profile?.dailyProteinTarget}g protein, ${profile?.dailyCarbTarget}g carbs, ${profile?.dailyFatTarget}g fat.
Consumed so far today: ${intakeSoFar}
Foods eaten today: ${eatenList}

Goal: ${profile?.goal}. Activity: ${profile?.activityLevel}. Preferred Cuisine: ${profile?.cuisine}.

CRITICAL Rules:
1. Dietary Restrictions: ${diet}. YOU MUST STRICTLY OBEY THESE. If Vegetarian/Vegan, NEVER suggest meat/poultry/fish. 
2. Medical Conditions: ${medical}. Tailor advice safely.
3. DO NOT use stereotypical greetings (like "Namaste" or "Hi [Name]") in every single message. Be conversational, direct, and skip the repetitive introductions. Jump straight into the helpful advice!`;

    const aiResp = await aiComplete({ prompt: message, systemPrompt, maxTokens: 512 }, aiSettings ? {
      provider: aiSettings.provider,
      model: aiSettings.model,
      apiKey: aiSettings.apiKeyEncrypted || undefined,
    } : undefined);

    await logAIUsage(session.userId, aiResp.provider, aiResp.tokensUsed);

    return NextResponse.json({ reply: aiResp.text, provider: aiResp.provider });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

