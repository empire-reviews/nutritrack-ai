export interface NutritionProfile {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: string;
  activityLevel: string;
  exerciseDaysPerWeek?: number;
  goal: string;
  bodyFatPercent?: number | null;
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

/**
 * Estimates Body Fat % using BMI, Age, and Gender correlation
 */
export function estimateBodyFat(bmi: number, age: number, gender: string): number {
  const genderValue = gender === "male" ? 1 : 0;
  // Standard Adult Body Fat % formula
  const bf = (1.20 * bmi) + (0.23 * age) - (10.8 * genderValue) - 5.4;
  return Math.max(5, Math.min(60, bf)); // Clamped for safety
}

export function calculateLBM(weightKg: number, bodyFatPercent: number): number {
  return weightKg * (1 - (bodyFatPercent / 100));
}

export function calculateBMR(input: NutritionProfile): number {
  const { weightKg, heightCm, age, gender, bodyFatPercent } = input;
  const bmi = calculateBMI(weightKg, heightCm);
  const activeBodyFat = bodyFatPercent || estimateBodyFat(bmi, age, gender);
  
  // Use Katch-McArdle formula for high precision (requires lean mass)
  const lbm = calculateLBM(weightKg, activeBodyFat);
  return 370 + (21.6 * lbm);
}

export function calculateTDEE(bmr: number, activityLevel: string, daysPerWeek: number = 0): number {
  // Use a base multiplier + an intensity spike per exercise day
  const baseMulti: Record<string, number> = {
    sedentary: 1.2,
    light: 1.3,
    moderate: 1.4,
    active: 1.5,
    athlete: 1.6,
  };
  
  const start = baseMulti[activityLevel] || 1.3;
  // Add 0.05 for every day of exercise to personalize the multiplier
  const dynamicMulti = start + (daysPerWeek * 0.05);
  
  return Math.round(bmr * Math.min(dynamicMulti, 2.2)); // Cap at 2.2 for extreme athletes
}

export function calculateCalorieTarget(tdee: number, goal: string): number {
  switch (goal) {
    case "gain":
    case "muscle":
      return Math.round(tdee * 1.15); // 15% surplus
    case "lose":
      return Math.round(tdee * 0.85); // 15% deficit (safe & sustainable)
    default:
      return tdee;
  }
}

export function calculateProteinTarget(weightKg: number, goal: string): number {
  // Protein is higher for those actively trying to build muscle
  switch (goal) {
    case "gain":
    case "muscle":
      return Math.round(weightKg * 2.2);
    case "lose":
      return Math.round(weightKg * 1.8);
    default:
      return Math.round(weightKg * 1.6);
  }
}

export function calculateMacroTargets(
  calorieTarget: number,
  proteinGrams: number
): { carbs: number; fat: number } {
  const proteinCals = proteinGrams * 4;
  // Fat is traditionally 20-30% of calories. We'll use 25% as standard.
  const fatCals = calorieTarget * 0.25;
  const carbCals = calorieTarget - proteinCals - fatCals;
  
  return {
    fat: Math.max(30, Math.round(fatCals / 9)), // Min 30g for hormonal health
    carbs: Math.round(Math.max(0, carbCals) / 4),
  };
}

export function calculateWaterTarget(weightKg: number): number {
  // 35ml per kg of bodyweight
  return Math.max(2000, Math.round(weightKg * 35));
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
  estimatedBodyFat: number;
}

export function calculateAllTargets(profile: NutritionProfile): NutritionTargets {
  const bmi = calculateBMI(profile.weightKg, profile.heightCm);
  const estBF = profile.bodyFatPercent || estimateBodyFat(bmi, profile.age, profile.gender);
  
  const bmr = calculateBMR({ ...profile, bodyFatPercent: estBF });
  const tdee = calculateTDEE(bmr, profile.activityLevel, profile.exerciseDaysPerWeek);
  
  const calorieTarget = calculateCalorieTarget(tdee, profile.goal);
  const proteinTarget = calculateProteinTarget(profile.weightKg, profile.goal);
  const { carbs, fat } = calculateMacroTargets(calorieTarget, proteinTarget);
  const waterTarget = calculateWaterTarget(profile.weightKg);

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
    estimatedBodyFat: Math.round(estBF * 10) / 10,
  };
}

