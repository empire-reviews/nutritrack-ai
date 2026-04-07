import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { calculateAllTargets } from "@/lib/calculations";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const {
      age, gender, heightCm, weightKg, bodyFatPercent, waistCm,
      goal, targetWeightKg, targetWeeks, activityLevel,
      exerciseTypes, exerciseDaysPerWeek, dietaryRestrictions,
      medicalConditions, mealCount, cuisine,
      aiProvider, aiModel, aiApiKey,
    } = body;

    const targets = calculateAllTargets({ weightKg, heightCm, age, gender, activityLevel, goal });

    await prisma.userProfile.upsert({
      where: { userId: session.userId },
      create: {
        userId: session.userId,
        age, gender, heightCm, weightKg, bodyFatPercent, waistCm,
        goal, targetWeightKg, targetWeeks, activityLevel,
        exerciseTypes: JSON.stringify(exerciseTypes || []),
        exerciseDaysPerWeek: exerciseDaysPerWeek || 3,
        dietaryRestrictions: JSON.stringify(dietaryRestrictions || []),
        medicalConditions: JSON.stringify(medicalConditions || []),
        mealCount: mealCount || 3,
        cuisine: cuisine || "general",
        dailyCalorieTarget: targets.dailyCalorieTarget,
        dailyProteinTarget: targets.dailyProteinTarget,
        dailyCarbTarget: targets.dailyCarbTarget,
        dailyFatTarget: targets.dailyFatTarget,
        dailyWaterTargetMl: targets.dailyWaterTargetMl,
      },
      update: {
        age, gender, heightCm, weightKg, bodyFatPercent, waistCm,
        goal, targetWeightKg, targetWeeks, activityLevel,
        exerciseTypes: JSON.stringify(exerciseTypes || []),
        exerciseDaysPerWeek: exerciseDaysPerWeek || 3,
        dietaryRestrictions: JSON.stringify(dietaryRestrictions || []),
        medicalConditions: JSON.stringify(medicalConditions || []),
        mealCount: mealCount || 3,
        cuisine: cuisine || "general",
        dailyCalorieTarget: targets.dailyCalorieTarget,
        dailyProteinTarget: targets.dailyProteinTarget,
        dailyCarbTarget: targets.dailyCarbTarget,
        dailyFatTarget: targets.dailyFatTarget,
        dailyWaterTargetMl: targets.dailyWaterTargetMl,
      },
    });

    // Create default meal sessions
    const mealNames = getMealNames(mealCount || 3);
    await prisma.mealSession.deleteMany({ where: { userId: session.userId } });
    await prisma.mealSession.createMany({
      data: mealNames.map((m, i) => ({
        userId: session.userId,
        name: m.name,
        scheduledTime: m.time,
        orderIndex: i,
      })),
    });

    // Save AI settings if provided
    if (aiProvider && aiProvider !== "skip") {
      await prisma.aISettings.upsert({
        where: { userId: session.userId },
        create: {
          userId: session.userId,
          provider: aiProvider,
          model: aiModel || getDefaultModel(aiProvider),
          apiKeyEncrypted: aiApiKey || null,
          fallbackProvider: "groq",
          fallbackModel: "llama3-70b-8192",
        },
        update: {
          provider: aiProvider,
          model: aiModel || getDefaultModel(aiProvider),
          apiKeyEncrypted: aiApiKey || null,
        },
      });
    }

    await prisma.user.update({
      where: { id: session.userId },
      data: { isOnboarded: true },
    });

    return NextResponse.json({ success: true, targets });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

function getMealNames(count: number) {
  const all = [
    { name: "Breakfast", time: "08:00" },
    { name: "Morning Snack", time: "10:30" },
    { name: "Lunch", time: "13:00" },
    { name: "Afternoon Snack", time: "16:00" },
    { name: "Dinner", time: "19:00" },
    { name: "Evening Snack", time: "21:00" },
    { name: "Late Snack", time: "22:00" },
  ];
  if (count <= 3) return [all[0], all[2], all[4]];
  if (count === 4) return [all[0], all[2], all[4], all[5]];
  if (count === 5) return [all[0], all[1], all[2], all[3], all[4]];
  if (count === 6) return [all[0], all[1], all[2], all[3], all[4], all[5]];
  return all;
}

function getDefaultModel(provider: string) {
  const models: Record<string, string> = {
    groq: "llama3-70b-8192",
    gemini: "gemini-1.5-flash",
    openai: "gpt-3.5-turbo",
    anthropic: "claude-3-haiku-20240307",
    mistral: "mistral-small-latest",
    together: "meta-llama/Llama-3-8b-chat-hf",
    cohere: "command-r",
    deepseek: "deepseek-chat",
    ollama: "llama3",
    lmstudio: "local-model",
    localai: "gpt-3.5-turbo",
  };
  return models[provider] || "llama3-70b-8192";
}

