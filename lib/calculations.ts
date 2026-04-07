export interface BMRInput {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: string;
}

export function calculateBMR(input: BMRInput): number {
  const { weightKg, heightCm, age, gender } = input;
  if (gender === "male") {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  }
  return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
}

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  athlete: 1.9,
};

export function calculateTDEE(bmr: number, activityLevel: string): number {
  return Math.round(bmr * (ACTIVITY_MULTIPLIERS[activityLevel] || 1.55));
}

export function calculateCalorieTarget(tdee: number, goal: string): number {
  switch (goal) {
    case "gain":
    case "muscle":
      return tdee + 300;
    case "lose":
      return tdee - 400;
    case "maintain":
    case "health":
    default:
      return tdee;
  }
}

export function calculateProteinTarget(weightKg: number, goal: string): number {
  switch (goal) {
    case "gain":
    case "muscle":
      return Math.round(weightKg * 2.2);
    case "lose":
      return Math.round(weightKg * 2.0);
    default:
      return Math.round(weightKg * 1.6);
  }
}

export function calculateMacroTargets(
  calorieTarget: number,
  proteinGrams: number
): { carbs: number; fat: number } {
  const proteinCals = proteinGrams * 4;
  const fatCals = calorieTarget * 0.25;
  const carbCals = calorieTarget - proteinCals - fatCals;
  return {
    fat: Math.round(fatCals / 9),
    carbs: Math.round(carbCals / 4),
  };
}

export function calculateWaterTarget(weightKg: number): number {
  return Math.max(2000, Math.round(weightKg * 35));
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal weight";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

export interface NutritionTargets {
  dailyCalorieTarget: number;
  dailyProteinTarget: number;
  dailyCarbTarget: number;
  dailyFatTarget: number;
  dailyWaterTargetMl: number;
  bmr: number;
  tdee: number;
  bmi: number;
  bmiCategory: string;
}

export function calculateAllTargets(profile: {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: string;
  activityLevel: string;
  goal: string;
}): NutritionTargets {
  const bmr = calculateBMR(profile);
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  const calorieTarget = calculateCalorieTarget(tdee, profile.goal);
  const proteinTarget = calculateProteinTarget(profile.weightKg, profile.goal);
  const { carbs, fat } = calculateMacroTargets(calorieTarget, proteinTarget);
  const waterTarget = calculateWaterTarget(profile.weightKg);
  const bmi = calculateBMI(profile.weightKg, profile.heightCm);

  return {
    dailyCalorieTarget: calorieTarget,
    dailyProteinTarget: proteinTarget,
    dailyCarbTarget: carbs,
    dailyFatTarget: fat,
    dailyWaterTargetMl: waterTarget,
    bmr: Math.round(bmr),
    tdee,
    bmi,
    bmiCategory: getBMICategory(bmi),
  };
}
