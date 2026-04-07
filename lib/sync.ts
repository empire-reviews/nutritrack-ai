import { prisma } from "@/lib/db";

export async function syncDailySummary(userId: string, dateStr: string) {
  const start = new Date(dateStr + "T00:00:00.000Z");
  const end = new Date(dateStr + "T23:59:59.999Z");

  const [foodAgg, waterAgg] = await Promise.all([
    prisma.foodLog.aggregate({
      where: { userId, loggedAt: { gte: start, lte: end } },
      _sum: { calories: true, protein: true, carbs: true, fat: true },
    }),
    prisma.waterLog.aggregate({
      where: { userId, loggedAt: { gte: start, lte: end } },
      _sum: { amountMl: true },
    }),
  ]);

  await prisma.dailySummary.upsert({
    where: { userId_date: { userId, date: dateStr } },
    update: {
      totalCalories: foodAgg._sum.calories || 0,
      totalProtein: foodAgg._sum.protein || 0,
      totalCarbs: foodAgg._sum.carbs || 0,
      totalFat: foodAgg._sum.fat || 0,
      totalWaterMl: waterAgg._sum.amountMl || 0,
    },
    create: {
      userId,
      date: dateStr,
      totalCalories: foodAgg._sum.calories || 0,
      totalProtein: foodAgg._sum.protein || 0,
      totalCarbs: foodAgg._sum.carbs || 0,
      totalFat: foodAgg._sum.fat || 0,
      totalWaterMl: waterAgg._sum.amountMl || 0,
    },
  });
}
