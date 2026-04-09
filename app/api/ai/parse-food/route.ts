import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { aiComplete, parseFoodPrompt } from "@/lib/ai/aiService";
import { parseLocally } from "@/lib/food/localParser";
import { logAIUsage } from "@/lib/ai/logger";

/** Robustly extract the first valid JSON object or array from an AI response */
function extractJSON(raw: string): unknown | null {
  let s = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  try { return JSON.parse(s); } catch { /* continue */ }
  const start = Math.min(
    s.indexOf("{") === -1 ? Infinity : s.indexOf("{"),
    s.indexOf("[") === -1 ? Infinity : s.indexOf("[")
  );
  if (start === Infinity) return null;
  s = s.slice(start);
  const open = s[0];
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  let end = -1;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === open) depth++;
    else if (s[i] === close) { depth--; if (depth === 0) { end = i; break; } }
  }
  if (end === -1) return null;
  try { return JSON.parse(s.slice(0, end + 1)); } catch { return null; }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { text } = await req.json();
    if (!text?.trim()) return NextResponse.json({ error: "No text provided" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { country: true } });
    const aiSettings = await prisma.aISettings.findUnique({ where: { userId: session.userId } });

    // STEP 1: Always try local Indian food database first (instant, no API needed)
    const localResult = parseLocally(text);

    // STEP 2: If local parse found items AND we have no AI configured, return local results
    const hasAI = aiSettings?.apiKeyEncrypted ||
      process.env.GROQ_API_KEY ||
      process.env.GEMINI_API_KEY ||
      ["ollama", "lmstudio", "localai"].includes(aiSettings?.provider || "");

    if (localResult.items.length > 0 && !hasAI) {
      return NextResponse.json({
        parsed: localResult,
        provider: "local-ifct",
        model: "indian-food-db",
        source: "IFCT/NIN Hyderabad + USDA FoodData Central",
      });
    }

    // STEP 3: If AI is available, try AI for more accurate/nuanced parsing
    if (hasAI) {
      try {
        const aiReq = parseFoodPrompt(text, user?.country || "India");
        const aiResp = await aiComplete(aiReq, aiSettings ? {
          provider: aiSettings.provider,
          model: aiSettings.model,
          apiKey: aiSettings.apiKeyEncrypted || undefined,
          baseUrl: aiSettings.baseUrl || undefined,
        } : undefined);

        await logAIUsage(session.userId, aiResp.provider, aiResp.tokensUsed);

        const parsed = extractJSON(aiResp.text);
        if (parsed && typeof parsed === "object") {
          return NextResponse.json({ parsed, provider: aiResp.provider, model: aiResp.model });
        }
      } catch (err) {
        console.warn("[parse-food] AI failed, using local parser:", err);
      }
    }

    // STEP 4: Return local result (may have items or be empty)
    if (localResult.items.length > 0) {
      return NextResponse.json({
        parsed: localResult,
        provider: "local-ifct",
        model: "indian-food-db",
        source: "IFCT/NIN Hyderabad + USDA FoodData Central",
      });
    }

    // STEP 5: Nothing matched — return generic fallback
    return NextResponse.json({
      parsed: {
        items: [{ name: text, quantity: 1, unit: "serving", estimatedGrams: 150, calories: 200, protein: 8, carbs: 25, fat: 7, fiber: 2 }],
        totalCalories: 200, totalProtein: 8, confidence: "low",
        notes: "Could not identify specific foods. Please edit values manually or use 'Search Food' mode for USDA data.",
      },
      provider: "fallback",
      model: "none",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
