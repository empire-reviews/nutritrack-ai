/**
 * Local Food Parser with Indian Food Composition Table (IFCT) + USDA data
 * Source: NIN Hyderabad IFCT-2017, USDA FoodData Central
 * Works WITHOUT any AI API key
 */

interface FoodEntry {
  names: string[];          // all possible names (Hindi, English, transliteration)
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g: number;
  defaultServingG: number;  // typical Indian serving size in grams
  defaultUnit: string;      // "piece", "bowl", "cup", "plate"
  category: string;
}

// IFCT-2017 (NIN Hyderabad) + USDA reference data
const FOOD_DB: FoodEntry[] = [
  // === ROTIS / BREADS ===
  { names: ["roti", "chapati", "chapatti", "phulka", "fulka"], caloriesPer100g: 297, proteinPer100g: 8.7, carbsPer100g: 45, fatPer100g: 8.8, fiberPer100g: 3.5, defaultServingG: 40, defaultUnit: "piece", category: "bread" },
  { names: ["paratha", "parantha", "prantha", "aloo paratha", "aloo parantha"], caloriesPer100g: 326, proteinPer100g: 6.3, carbsPer100g: 37, fatPer100g: 16.5, fiberPer100g: 2.5, defaultServingG: 80, defaultUnit: "piece", category: "bread" },
  { names: ["naan", "nan", "butter naan", "garlic naan"], caloriesPer100g: 291, proteinPer100g: 8.7, carbsPer100g: 48, fatPer100g: 5.9, fiberPer100g: 2.1, defaultServingG: 90, defaultUnit: "piece", category: "bread" },
  { names: ["puri", "poori"], caloriesPer100g: 376, proteinPer100g: 7, carbsPer100g: 46, fatPer100g: 18, fiberPer100g: 2, defaultServingG: 25, defaultUnit: "piece", category: "bread" },
  { names: ["kulcha", "amritsari kulcha"], caloriesPer100g: 300, proteinPer100g: 8, carbsPer100g: 47, fatPer100g: 8, fiberPer100g: 2, defaultServingG: 80, defaultUnit: "piece", category: "bread" },
  { names: ["bhatura", "bhature", "chole bhature"], caloriesPer100g: 330, proteinPer100g: 7, carbsPer100g: 42, fatPer100g: 15, fiberPer100g: 1.5, defaultServingG: 80, defaultUnit: "piece", category: "bread" },
  { names: ["dosa", "plain dosa", "masala dosa"], caloriesPer100g: 141, proteinPer100g: 3.5, carbsPer100g: 21, fatPer100g: 4.7, fiberPer100g: 0.8, defaultServingG: 85, defaultUnit: "piece", category: "bread" },
  { names: ["idli"], caloriesPer100g: 97, proteinPer100g: 4, carbsPer100g: 20, fatPer100g: 0.3, fiberPer100g: 0.8, defaultServingG: 40, defaultUnit: "piece", category: "bread" },
  { names: ["uttapam", "uthappam"], caloriesPer100g: 155, proteinPer100g: 4, carbsPer100g: 22, fatPer100g: 5.5, fiberPer100g: 1.2, defaultServingG: 100, defaultUnit: "piece", category: "bread" },
  { names: ["bread", "white bread", "bread slice", "toast"], caloriesPer100g: 265, proteinPer100g: 9, carbsPer100g: 49, fatPer100g: 3.2, fiberPer100g: 2.7, defaultServingG: 28, defaultUnit: "slice", category: "bread" },

  // === RICE ===
  { names: ["rice", "chawal", "white rice", "cooked rice", "plain rice", "steamed rice"], caloriesPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28, fatPer100g: 0.3, fiberPer100g: 0.4, defaultServingG: 180, defaultUnit: "plate", category: "grain" },
  { names: ["biryani", "chicken biryani", "mutton biryani", "veg biryani"], caloriesPer100g: 180, proteinPer100g: 10, carbsPer100g: 22, fatPer100g: 6, fiberPer100g: 1, defaultServingG: 250, defaultUnit: "plate", category: "grain" },
  { names: ["pulao", "pulav", "veg pulao", "jeera rice"], caloriesPer100g: 145, proteinPer100g: 3, carbsPer100g: 24, fatPer100g: 4, fiberPer100g: 0.8, defaultServingG: 200, defaultUnit: "plate", category: "grain" },
  { names: ["khichdi", "khichadi"], caloriesPer100g: 105, proteinPer100g: 4, carbsPer100g: 17, fatPer100g: 2.5, fiberPer100g: 1.5, defaultServingG: 200, defaultUnit: "bowl", category: "grain" },
  { names: ["poha", "chivda", "beaten rice"], caloriesPer100g: 130, proteinPer100g: 2.5, carbsPer100g: 23, fatPer100g: 3, fiberPer100g: 1.2, defaultServingG: 150, defaultUnit: "plate", category: "grain" },
  { names: ["upma"], caloriesPer100g: 125, proteinPer100g: 3, carbsPer100g: 18, fatPer100g: 4.5, fiberPer100g: 1, defaultServingG: 150, defaultUnit: "plate", category: "grain" },

  // === DALS / LENTILS ===
  { names: ["dal", "daal", "toor dal", "arhar dal", "pigeon pea", "yellow dal"], caloriesPer100g: 116, proteinPer100g: 9, carbsPer100g: 20, fatPer100g: 0.4, fiberPer100g: 3, defaultServingG: 175, defaultUnit: "bowl", category: "dal" },
  { names: ["chana dal", "bengal gram dal", "split chickpea"], caloriesPer100g: 125, proteinPer100g: 10, carbsPer100g: 21, fatPer100g: 0.5, fiberPer100g: 4, defaultServingG: 175, defaultUnit: "bowl", category: "dal" },
  { names: ["moong dal", "mung dal", "green gram dal"], caloriesPer100g: 106, proteinPer100g: 7.5, carbsPer100g: 18, fatPer100g: 0.3, fiberPer100g: 2.5, defaultServingG: 175, defaultUnit: "bowl", category: "dal" },
  { names: ["masoor dal", "red lentil", "masur dal"], caloriesPer100g: 116, proteinPer100g: 9, carbsPer100g: 20, fatPer100g: 0.4, fiberPer100g: 3, defaultServingG: 175, defaultUnit: "bowl", category: "dal" },
  { names: ["urad dal", "black gram dal"], caloriesPer100g: 120, proteinPer100g: 8, carbsPer100g: 20, fatPer100g: 0.6, fiberPer100g: 3.5, defaultServingG: 175, defaultUnit: "bowl", category: "dal" },
  { names: ["rajma", "kidney beans", "rajma curry", "rajma chawal"], caloriesPer100g: 127, proteinPer100g: 8.7, carbsPer100g: 22.8, fatPer100g: 0.5, fiberPer100g: 6.4, defaultServingG: 175, defaultUnit: "bowl", category: "dal" },
  { names: ["chole", "chana", "chickpea", "chickpea curry", "chana masala", "chole masala"], caloriesPer100g: 140, proteinPer100g: 7, carbsPer100g: 18, fatPer100g: 5, fiberPer100g: 5, defaultServingG: 175, defaultUnit: "bowl", category: "dal" },
  { names: ["sambhar", "sambar"], caloriesPer100g: 50, proteinPer100g: 2.5, carbsPer100g: 7, fatPer100g: 1.5, fiberPer100g: 2, defaultServingG: 150, defaultUnit: "bowl", category: "dal" },
  { names: ["kadhi", "kadi", "kadhi pakora"], caloriesPer100g: 70, proteinPer100g: 3, carbsPer100g: 8, fatPer100g: 3, fiberPer100g: 0.5, defaultServingG: 175, defaultUnit: "bowl", category: "dal" },

  // === SABJI / VEGETABLES ===
  { names: ["lauki", "lauki ki sabji", "bottle gourd", "ghiya", "dudhi", "lauki sabji"], caloriesPer100g: 60, proteinPer100g: 1.5, carbsPer100g: 6, fatPer100g: 3, fiberPer100g: 1.5, defaultServingG: 175, defaultUnit: "bowl", category: "sabji" },
  { names: ["kaddu", "kaddu ki sabji", "pumpkin", "pumpkin sabji", "sitaphal"], caloriesPer100g: 65, proteinPer100g: 1.2, carbsPer100g: 8, fatPer100g: 3, fiberPer100g: 1.5, defaultServingG: 175, defaultUnit: "bowl", category: "sabji" },
  { names: ["aloo", "aloo ki sabji", "potato", "potato curry", "aloo sabji", "dum aloo", "aloo gobi", "aloo matar"], caloriesPer100g: 120, proteinPer100g: 2, carbsPer100g: 16, fatPer100g: 5, fiberPer100g: 2, defaultServingG: 175, defaultUnit: "bowl", category: "sabji" },
  { names: ["bhindi", "bhindi ki sabji", "okra", "lady finger", "bhindi masala"], caloriesPer100g: 80, proteinPer100g: 2, carbsPer100g: 7, fatPer100g: 5, fiberPer100g: 3.2, defaultServingG: 150, defaultUnit: "bowl", category: "sabji" },
  { names: ["baingan", "brinjal", "eggplant", "baingan bharta", "begun"], caloriesPer100g: 85, proteinPer100g: 1.5, carbsPer100g: 8, fatPer100g: 5, fiberPer100g: 3, defaultServingG: 160, defaultUnit: "bowl", category: "sabji" },
  { names: ["gobhi", "gobi", "cauliflower", "phool gobi", "gobi sabji", "aloo gobi"], caloriesPer100g: 75, proteinPer100g: 2, carbsPer100g: 6, fatPer100g: 4.5, fiberPer100g: 2.5, defaultServingG: 150, defaultUnit: "bowl", category: "sabji" },
  { names: ["palak", "spinach", "palak paneer", "saag"], caloriesPer100g: 85, proteinPer100g: 5, carbsPer100g: 5, fatPer100g: 5.5, fiberPer100g: 2, defaultServingG: 175, defaultUnit: "bowl", category: "sabji" },
  { names: ["paneer", "paneer ki sabji", "paneer butter masala", "shahi paneer", "matar paneer", "palak paneer"], caloriesPer100g: 180, proteinPer100g: 12, carbsPer100g: 6, fatPer100g: 12, fiberPer100g: 1, defaultServingG: 175, defaultUnit: "bowl", category: "sabji" },
  { names: ["mix veg", "mix vegetable", "mixed vegetable", "sabji", "subji", "sabzi"], caloriesPer100g: 85, proteinPer100g: 2, carbsPer100g: 9, fatPer100g: 4.5, fiberPer100g: 2.5, defaultServingG: 175, defaultUnit: "bowl", category: "sabji" },
  { names: ["tinda", "tinde", "tinda sabji", "round gourd"], caloriesPer100g: 55, proteinPer100g: 1.2, carbsPer100g: 5, fatPer100g: 3, fiberPer100g: 1.5, defaultServingG: 175, defaultUnit: "bowl", category: "sabji" },
  { names: ["tori", "torai", "turai", "ridge gourd", "tori ki sabji"], caloriesPer100g: 55, proteinPer100g: 1, carbsPer100g: 5, fatPer100g: 3, fiberPer100g: 2, defaultServingG: 175, defaultUnit: "bowl", category: "sabji" },
  { names: ["karela", "bitter gourd", "karela sabji"], caloriesPer100g: 65, proteinPer100g: 1.5, carbsPer100g: 6, fatPer100g: 3.5, fiberPer100g: 2.5, defaultServingG: 150, defaultUnit: "bowl", category: "sabji" },
  { names: ["shimla mirch", "capsicum", "bell pepper"], caloriesPer100g: 70, proteinPer100g: 1.5, carbsPer100g: 7, fatPer100g: 4, fiberPer100g: 2, defaultServingG: 150, defaultUnit: "bowl", category: "sabji" },
  { names: ["matar", "peas", "green peas", "matar paneer", "matar mushroom"], caloriesPer100g: 95, proteinPer100g: 5, carbsPer100g: 12, fatPer100g: 3.5, fiberPer100g: 4, defaultServingG: 150, defaultUnit: "bowl", category: "sabji" },

  // === NON-VEG / MEAT ===
  { names: ["chicken", "chicken curry", "chicken masala", "murgh", "chicken gravy"], caloriesPer100g: 150, proteinPer100g: 14, carbsPer100g: 5, fatPer100g: 8, fiberPer100g: 0.5, defaultServingG: 200, defaultUnit: "bowl", category: "nonveg" },
  { names: ["chicken breast", "grilled chicken"], caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6, fiberPer100g: 0, defaultServingG: 150, defaultUnit: "piece", category: "nonveg" },
  { names: ["chicken tandoori", "tandoori chicken"], caloriesPer100g: 148, proteinPer100g: 22, carbsPer100g: 3, fatPer100g: 5, fiberPer100g: 0.5, defaultServingG: 200, defaultUnit: "piece", category: "nonveg" },
  { names: ["butter chicken", "murgh makhani"], caloriesPer100g: 175, proteinPer100g: 12, carbsPer100g: 8, fatPer100g: 11, fiberPer100g: 0.5, defaultServingG: 200, defaultUnit: "bowl", category: "nonveg" },
  { names: ["mutton", "mutton curry", "gosht", "mutton masala", "lamb curry"], caloriesPer100g: 175, proteinPer100g: 16, carbsPer100g: 4, fatPer100g: 10, fiberPer100g: 0.5, defaultServingG: 200, defaultUnit: "bowl", category: "nonveg" },
  { names: ["fish", "fish curry", "machli", "fish fry"], caloriesPer100g: 140, proteinPer100g: 18, carbsPer100g: 4, fatPer100g: 6, fiberPer100g: 0, defaultServingG: 150, defaultUnit: "piece", category: "nonveg" },
  { names: ["egg", "anda", "boiled egg", "egg boiled"], caloriesPer100g: 155, proteinPer100g: 13, carbsPer100g: 1.1, fatPer100g: 11, fiberPer100g: 0, defaultServingG: 50, defaultUnit: "piece", category: "nonveg" },
  { names: ["egg curry", "anda curry", "egg masala"], caloriesPer100g: 130, proteinPer100g: 10, carbsPer100g: 5, fatPer100g: 8, fiberPer100g: 0.5, defaultServingG: 200, defaultUnit: "bowl", category: "nonveg" },
  { names: ["omelette", "omelet", "egg omelette"], caloriesPer100g: 154, proteinPer100g: 11, carbsPer100g: 1.6, fatPer100g: 12, fiberPer100g: 0, defaultServingG: 75, defaultUnit: "piece", category: "nonveg" },
  { names: ["keema", "qeema", "minced meat", "kheema"], caloriesPer100g: 180, proteinPer100g: 16, carbsPer100g: 4, fatPer100g: 11, fiberPer100g: 0.5, defaultServingG: 175, defaultUnit: "bowl", category: "nonveg" },

  // === DAIRY ===
  { names: ["milk", "doodh", "full cream milk"], caloriesPer100g: 62, proteinPer100g: 3.3, carbsPer100g: 5, fatPer100g: 3.3, fiberPer100g: 0, defaultServingG: 240, defaultUnit: "glass", category: "dairy" },
  { names: ["curd", "dahi", "yogurt", "yoghurt", "plain curd"], caloriesPer100g: 60, proteinPer100g: 3.5, carbsPer100g: 4.7, fatPer100g: 3.3, fiberPer100g: 0, defaultServingG: 150, defaultUnit: "bowl", category: "dairy" },
  { names: ["lassi", "sweet lassi", "namkeen lassi", "chaas", "buttermilk"], caloriesPer100g: 66, proteinPer100g: 2.4, carbsPer100g: 10, fatPer100g: 1.6, fiberPer100g: 0, defaultServingG: 250, defaultUnit: "glass", category: "dairy" },
  { names: ["raita", "boondi raita", "cucumber raita"], caloriesPer100g: 55, proteinPer100g: 3, carbsPer100g: 5, fatPer100g: 2.5, fiberPer100g: 0.3, defaultServingG: 120, defaultUnit: "bowl", category: "dairy" },
  { names: ["kheer", "rice kheer", "phirni"], caloriesPer100g: 130, proteinPer100g: 3.5, carbsPer100g: 20, fatPer100g: 4, fiberPer100g: 0.2, defaultServingG: 150, defaultUnit: "bowl", category: "dairy" },
  { names: ["chai", "tea", "masala chai", "doodh chai"], caloriesPer100g: 30, proteinPer100g: 1, carbsPer100g: 4, fatPer100g: 1, fiberPer100g: 0, defaultServingG: 150, defaultUnit: "cup", category: "dairy" },

  // === SNACKS / NUTS ===
  { names: ["samosa", "aloo samosa"], caloriesPer100g: 262, proteinPer100g: 4, carbsPer100g: 28, fatPer100g: 15, fiberPer100g: 2, defaultServingG: 100, defaultUnit: "piece", category: "snack" },
  { names: ["pakora", "pakode", "bhajiya", "bhaji"], caloriesPer100g: 280, proteinPer100g: 5, carbsPer100g: 25, fatPer100g: 18, fiberPer100g: 2, defaultServingG: 30, defaultUnit: "piece", category: "snack" },
  { names: ["mathri", "namak pare", "namkeen"], caloriesPer100g: 450, proteinPer100g: 8, carbsPer100g: 50, fatPer100g: 24, fiberPer100g: 2, defaultServingG: 30, defaultUnit: "piece", category: "snack" },
  { names: ["biscuit", "cookie", "parle g", "marie"], caloriesPer100g: 450, proteinPer100g: 6, carbsPer100g: 70, fatPer100g: 16, fiberPer100g: 2, defaultServingG: 8, defaultUnit: "piece", category: "snack" },
  { names: ["maggi", "noodles", "instant noodles"], caloriesPer100g: 188, proteinPer100g: 4.5, carbsPer100g: 26, fatPer100g: 7.5, fiberPer100g: 1, defaultServingG: 140, defaultUnit: "plate", category: "snack" },
  { names: ["peanut", "peanuts", "moongfali", "groundnut"], caloriesPer100g: 567, proteinPer100g: 26, carbsPer100g: 16, fatPer100g: 49, fiberPer100g: 9, defaultServingG: 28, defaultUnit: "handful", category: "snack" },
  { names: ["almond", "almonds", "badam"], caloriesPer100g: 579, proteinPer100g: 21, carbsPer100g: 22, fatPer100g: 50, fiberPer100g: 12, defaultServingG: 28, defaultUnit: "handful", category: "snack" },
  { names: ["cashew", "cashews", "kaju"], caloriesPer100g: 553, proteinPer100g: 18, carbsPer100g: 30, fatPer100g: 44, fiberPer100g: 3, defaultServingG: 28, defaultUnit: "handful", category: "snack" },

  // === FRUITS ===
  { names: ["banana", "kela", "kele"], caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 23, fatPer100g: 0.3, fiberPer100g: 2.6, defaultServingG: 118, defaultUnit: "piece", category: "fruit" },
  { names: ["apple", "seb"], caloriesPer100g: 52, proteinPer100g: 0.3, carbsPer100g: 14, fatPer100g: 0.2, fiberPer100g: 2.4, defaultServingG: 182, defaultUnit: "piece", category: "fruit" },
  { names: ["mango", "aam"], caloriesPer100g: 60, proteinPer100g: 0.8, carbsPer100g: 15, fatPer100g: 0.4, fiberPer100g: 1.6, defaultServingG: 200, defaultUnit: "piece", category: "fruit" },
  { names: ["papaya", "papita"], caloriesPer100g: 43, proteinPer100g: 0.5, carbsPer100g: 11, fatPer100g: 0.3, fiberPer100g: 1.7, defaultServingG: 150, defaultUnit: "bowl", category: "fruit" },
  { names: ["guava", "amrud"], caloriesPer100g: 68, proteinPer100g: 2.6, carbsPer100g: 14, fatPer100g: 1, fiberPer100g: 5.4, defaultServingG: 150, defaultUnit: "piece", category: "fruit" },
  { names: ["orange", "santra", "mosambi"], caloriesPer100g: 47, proteinPer100g: 0.9, carbsPer100g: 12, fatPer100g: 0.1, fiberPer100g: 2.4, defaultServingG: 150, defaultUnit: "piece", category: "fruit" },

  // === SWEETS / DESSERTS ===
  { names: ["gulab jamun"], caloriesPer100g: 325, proteinPer100g: 5, carbsPer100g: 48, fatPer100g: 13, fiberPer100g: 0.5, defaultServingG: 40, defaultUnit: "piece", category: "sweet" },
  { names: ["jalebi"], caloriesPer100g: 370, proteinPer100g: 3, carbsPer100g: 60, fatPer100g: 13, fiberPer100g: 0.2, defaultServingG: 50, defaultUnit: "piece", category: "sweet" },
  { names: ["rasgulla", "rosogolla"], caloriesPer100g: 186, proteinPer100g: 5, carbsPer100g: 35, fatPer100g: 3, fiberPer100g: 0, defaultServingG: 60, defaultUnit: "piece", category: "sweet" },
  { names: ["laddu", "ladoo", "besan laddu", "boondi ladoo"], caloriesPer100g: 425, proteinPer100g: 7, carbsPer100g: 52, fatPer100g: 22, fiberPer100g: 1, defaultServingG: 40, defaultUnit: "piece", category: "sweet" },
  { names: ["barfi", "burfi", "kaju katli", "kaju barfi"], caloriesPer100g: 400, proteinPer100g: 8, carbsPer100g: 50, fatPer100g: 19, fiberPer100g: 0.5, defaultServingG: 30, defaultUnit: "piece", category: "sweet" },
  { names: ["halwa", "suji halwa", "gajar halwa", "moong dal halwa"], caloriesPer100g: 250, proteinPer100g: 3.5, carbsPer100g: 35, fatPer100g: 11, fiberPer100g: 1, defaultServingG: 100, defaultUnit: "bowl", category: "sweet" },

  // === GENERAL / WESTERN ===
  { names: ["oats", "oatmeal", "daliya"], caloriesPer100g: 105, proteinPer100g: 4, carbsPer100g: 18, fatPer100g: 2, fiberPer100g: 2.7, defaultServingG: 250, defaultUnit: "bowl", category: "grain" },
  { names: ["cornflakes", "cereal", "muesli"], caloriesPer100g: 157, proteinPer100g: 3, carbsPer100g: 33, fatPer100g: 1.5, fiberPer100g: 1.2, defaultServingG: 200, defaultUnit: "bowl", category: "grain" },
  { names: ["pasta", "macaroni", "spaghetti"], caloriesPer100g: 131, proteinPer100g: 5, carbsPer100g: 25, fatPer100g: 1.1, fiberPer100g: 1.8, defaultServingG: 200, defaultUnit: "plate", category: "grain" },
  { names: ["pizza", "pizza slice"], caloriesPer100g: 266, proteinPer100g: 11, carbsPer100g: 33, fatPer100g: 10, fiberPer100g: 2.3, defaultServingG: 107, defaultUnit: "slice", category: "snack" },
  { names: ["burger", "veg burger", "chicken burger"], caloriesPer100g: 240, proteinPer100g: 12, carbsPer100g: 24, fatPer100g: 11, fiberPer100g: 1.5, defaultServingG: 200, defaultUnit: "piece", category: "snack" },
  { names: ["sandwich", "veg sandwich", "grilled sandwich"], caloriesPer100g: 230, proteinPer100g: 8, carbsPer100g: 28, fatPer100g: 10, fiberPer100g: 2, defaultServingG: 150, defaultUnit: "piece", category: "snack" },

  // === DRINKS ===
  { names: ["coffee", "black coffee"], caloriesPer100g: 2, proteinPer100g: 0.3, carbsPer100g: 0, fatPer100g: 0, fiberPer100g: 0, defaultServingG: 180, defaultUnit: "cup", category: "drink" },
  { names: ["juice", "orange juice", "apple juice", "fruit juice", "mango juice"], caloriesPer100g: 45, proteinPer100g: 0.5, carbsPer100g: 11, fatPer100g: 0.1, fiberPer100g: 0.2, defaultServingG: 250, defaultUnit: "glass", category: "drink" },
  { names: ["nimbu pani", "lemonade", "shikanji"], caloriesPer100g: 25, proteinPer100g: 0.1, carbsPer100g: 6, fatPer100g: 0, fiberPer100g: 0, defaultServingG: 250, defaultUnit: "glass", category: "drink" },
  { names: ["protein shake", "whey protein"], caloriesPer100g: 50, proteinPer100g: 10, carbsPer100g: 2, fatPer100g: 0.5, fiberPer100g: 0, defaultServingG: 300, defaultUnit: "glass", category: "drink" },
];

/**
 * Parse food text locally using Indian food database
 * Handles: "4 roti and kaddu ki sabji 1 bowl", "2 egg and bread", etc.
 */
export function parseLocally(text: string): { items: { name: string; quantity: number; unit: string; estimatedGrams: number; calories: number; protein: number; carbs: number; fat: number; fiber: number }[]; totalCalories: number; totalProtein: number; confidence: string; notes: string } {
  const input = text.toLowerCase().trim();

  // Split by "and", ",", "+", "with", "aur", "ke saath"
  const parts = input
    .split(/\s*(?:and|aur|,|\+|with|ke saath|ke sath)\s*/i)
    .map(s => s.trim())
    .filter(Boolean);

  const items: { name: string; quantity: number; unit: string; estimatedGrams: number; calories: number; protein: number; carbs: number; fat: number; fiber: number }[] = [];
  const matchedFoods: string[] = [];

  for (const part of parts) {
    let qty = 1;
    let customGrams: number | null = null;
    let rest = part;

    // Check for gram specification: "200g rice", "50 grams of peanuts"
    const gramMatch = part.match(/^(\d+\.?\d*)\s*(?:g|gm|grams?)\s*(?:of\s+)?/i);
    if (gramMatch) {
      customGrams = parseFloat(gramMatch[1]);
      qty = customGrams; // For display, quantity is the gram amount
      rest = part.slice(gramMatch[0].length);
    } else {
      // Otherwise extract normal quantity: "4 roti", "1 bowl dal"
      const qtyMatch = part.match(/^(\d+\.?\d*)\s*/);
      if (qtyMatch) {
        qty = parseFloat(qtyMatch[1]);
        rest = part.slice(qtyMatch[0].length);
      }
    }

    // Check for unit: "1 bowl dal", "1 plate rice", "1 cup", "1 glass", "1 katori"
    const unitMatch = rest.match(/^(?:bowl|bowls?|plate|plates?|cup|cups?|glass|glasses|katori|katora|serving|servings?)\s+(?:of\s+)?/i);
    if (unitMatch) {
      rest = rest.slice(unitMatch[0].length);
    }

    // Remove "ki sabji", "ki sabzi", "ka sabji" suffix and use base name for matching
    const cleanedRest = rest
      .replace(/\s*(?:ki|ka|ke)\s+(?:sabji|sabzi|subji|subzi|curry|dal|daal)\s*/gi, "")
      .trim();

    // Find best matching food
    let bestMatch: FoodEntry | null = null;
    let bestScore = 0;

    for (const food of FOOD_DB) {
      for (const name of food.names) {
        // Check if the part contains this food name
        if (rest.includes(name) || cleanedRest.includes(name) || part.includes(name)) {
          const score = name.length; // prefer longer (more specific) matches
          if (score > bestScore) {
            bestScore = score;
            bestMatch = food;
          }
        }
      }
    }

    // Also try matching the cleaned rest directly (e.g. "kaddu" from "kaddu ki sabji")
    if (!bestMatch) {
      for (const food of FOOD_DB) {
        for (const name of food.names) {
          if (cleanedRest.includes(name) || name.includes(cleanedRest)) {
            const score = name.length;
            if (score > bestScore) {
              bestScore = score;
              bestMatch = food;
            }
          }
        }
      }
    }

    if (bestMatch) {
      const servingG = customGrams || (bestMatch.defaultServingG * qty);
      const ratio = servingG / 100;

      items.push({
        name: bestMatch.names[0].charAt(0).toUpperCase() + bestMatch.names[0].slice(1) + (bestMatch.category === "sabji" ? " sabji" : ""),
        quantity: qty,
        unit: customGrams ? "g" : bestMatch.defaultUnit,
        estimatedGrams: Math.round(servingG),
        calories: Math.round(bestMatch.caloriesPer100g * ratio),
        protein: Math.round(bestMatch.proteinPer100g * ratio * 10) / 10,
        carbs: Math.round(bestMatch.carbsPer100g * ratio * 10) / 10,
        fat: Math.round(bestMatch.fatPer100g * ratio * 10) / 10,
        fiber: Math.round(bestMatch.fiberPer100g * ratio * 10) / 10,
      });
      matchedFoods.push(bestMatch.names[0]);
    }
  }

  // If nothing matched from splitting, try matching whole input
  if (items.length === 0) {
    for (const food of FOOD_DB) {
      for (const name of food.names) {
        if (input.includes(name)) {
          const ratio = food.defaultServingG / 100;
          items.push({
            name: food.names[0].charAt(0).toUpperCase() + food.names[0].slice(1),
            quantity: 1,
            unit: food.defaultUnit,
            estimatedGrams: food.defaultServingG,
            calories: Math.round(food.caloriesPer100g * ratio),
            protein: Math.round(food.proteinPer100g * ratio * 10) / 10,
            carbs: Math.round(food.carbsPer100g * ratio * 10) / 10,
            fat: Math.round(food.fatPer100g * ratio * 10) / 10,
            fiber: Math.round(food.fiberPer100g * ratio * 10) / 10,
          });
          break;
        }
      }
    }
  }

  const totalCalories = items.reduce((a, i) => a + i.calories, 0);
  const totalProtein = items.reduce((a, i) => a + i.protein, 0);

  return {
    items,
    totalCalories,
    totalProtein: Math.round(totalProtein * 10) / 10,
    confidence: items.length > 0 ? "high" : "low",
    notes: items.length > 0
      ? `Matched ${items.length} item(s) using IFCT/NIN Indian nutrition database. Values are for standard Indian home-cooked portions.`
      : "Could not identify food items. Please try individual food names.",
  };
}
