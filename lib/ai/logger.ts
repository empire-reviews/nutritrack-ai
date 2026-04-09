import { prisma } from "@/lib/db";

export async function logAIUsage(userId: string, provider: string, tokens: number) {
  if (!tokens || tokens <= 0) return;
  const today = new Date().toISOString().split("T")[0];
  
  try {
    await prisma.aITokenUsage.create({
      data: {
        userId,
        provider,
        tokensUsed: tokens,
        date: today,
        // createdAt defaults to now() which gives us the precise time
      }
    });
  } catch (err) {
    console.error("[AI Logger] Failed to record usage:", err);
  }
}
