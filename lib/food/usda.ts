const USDA_API_KEY = process.env.USDA_API_KEY || "DEMO_KEY";
const USDA_BASE = "https://api.nal.usda.gov/fdc/v1";

export interface USDAFood {
  fdcId: number;
  description: string;
  brandOwner?: string;
  foodNutrients: { nutrientId: number; value: number }[];
}

export interface FoodItem {
  fdcId: number;
  name: string;
  brand?: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g: number;
}

function extractNutrient(nutrients: { nutrientId: number; value: number }[], ids: number[]): number {
  for (const id of ids) {
    const n = nutrients.find((x) => x.nutrientId === id);
    if (n) return Math.round(n.value * 10) / 10;
  }
  return 0;
}

export async function searchUSDA(query: string, pageSize = 20): Promise<FoodItem[]> {
  try {
    const url = `${USDA_BASE}/foods/search?query=${encodeURIComponent(query)}&pageSize=${pageSize}&api_key=${USDA_API_KEY}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.foods || []).map((f: USDAFood) => ({
      fdcId: f.fdcId,
      name: f.description,
      brand: f.brandOwner,
      caloriesPer100g: extractNutrient(f.foodNutrients, [1008, 2047, 2048]),
      proteinPer100g: extractNutrient(f.foodNutrients, [1003]),
      carbsPer100g: extractNutrient(f.foodNutrients, [1005]),
      fatPer100g: extractNutrient(f.foodNutrients, [1004]),
      fiberPer100g: extractNutrient(f.foodNutrients, [1079]),
    }));
  } catch {
    return [];
  }
}

export function calculatePortionNutrition(food: FoodItem, grams: number) {
  const ratio = grams / 100;
  return {
    calories: Math.round(food.caloriesPer100g * ratio * 10) / 10,
    protein: Math.round(food.proteinPer100g * ratio * 10) / 10,
    carbs: Math.round(food.carbsPer100g * ratio * 10) / 10,
    fat: Math.round(food.fatPer100g * ratio * 10) / 10,
    fiber: Math.round(food.fiberPer100g * ratio * 10) / 10,
  };
}
