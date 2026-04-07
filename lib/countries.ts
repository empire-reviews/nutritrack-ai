export const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Argentina","Armenia","Australia","Austria","Azerbaijan",
  "Bahrain","Bangladesh","Belarus","Belgium","Bolivia","Bosnia and Herzegovina","Brazil","Bulgaria",
  "Cambodia","Canada","Chile","China","Colombia","Croatia","Cuba","Czech Republic",
  "Denmark","Dominican Republic","Ecuador","Egypt","El Salvador","Ethiopia",
  "Finland","France","Georgia","Germany","Ghana","Greece","Guatemala","Honduras","Hungary",
  "India","Indonesia","Iran","Iraq","Ireland","Israel","Italy",
  "Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyzstan",
  "Lebanon","Libya","Malaysia","Mexico","Morocco","Myanmar",
  "Nepal","Netherlands","New Zealand","Nicaragua","Nigeria","Norway",
  "Oman","Pakistan","Palestinian Territories","Panama","Paraguay","Peru","Philippines","Poland","Portugal",
  "Qatar","Romania","Russia","Rwanda",
  "Saudi Arabia","Senegal","Serbia","Singapore","Somalia","South Africa","South Korea","Spain","Sri Lanka","Sudan","Sweden","Switzerland","Syria",
  "Taiwan","Tajikistan","Tanzania","Thailand","Tunisia","Turkey","Turkmenistan",
  "Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan",
  "Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"
];

export const LOCAL_FOODS_BY_COUNTRY: Record<string, { name: string; protein: number; per: string; notes: string }[]> = {
  Pakistan: [
    { name: "Chicken Karahi", protein: 27, per: "100g", notes: "Popular spiced chicken dish" },
    { name: "Daal (Lentils)", protein: 9, per: "100g cooked", notes: "High fiber, great protein source" },
    { name: "Eggs (Anda)", protein: 13, per: "100g (2 eggs)", notes: "Excellent complete protein" },
    { name: "Paneer", protein: 18, per: "100g", notes: "Fresh cottage cheese" },
    { name: "Dahi (Yogurt)", protein: 3.5, per: "100g", notes: "Probiotics + protein" },
    { name: "Fish (Machli)", protein: 22, per: "100g", notes: "Rohu, Catla common types" },
    { name: "Chana (Chickpeas)", protein: 8.9, per: "100g cooked", notes: "Excellent plant protein" },
    { name: "Mutton", protein: 25, per: "100g", notes: "High protein red meat" },
  ],
  India: [
    { name: "Paneer", protein: 18, per: "100g", notes: "Versatile vegetarian protein" },
    { name: "Moong Dal", protein: 9, per: "100g cooked", notes: "Easy to digest" },
    { name: "Chicken", protein: 27, per: "100g", notes: "Lean protein" },
    { name: "Rajma (Kidney Beans)", protein: 8.7, per: "100g cooked", notes: "High fiber + protein" },
    { name: "Tofu", protein: 8, per: "100g", notes: "Plant-based protein" },
    { name: "Greek Yogurt (Dahi)", protein: 10, per: "100g", notes: "High protein dairy" },
  ],
  Nigeria: [
    { name: "Beans (Ewa)", protein: 9, per: "100g cooked", notes: "Staple protein source" },
    { name: "Suya Beef", protein: 25, per: "100g", notes: "Spiced grilled meat" },
    { name: "Fish (Tilapia)", protein: 20, per: "100g", notes: "Common and affordable" },
    { name: "Groundnuts (Peanuts)", protein: 26, per: "100g", notes: "High protein snack" },
    { name: "Egusi (Melon Seeds)", protein: 24, per: "100g", notes: "Nutritious seed" },
    { name: "Chicken", protein: 27, per: "100g", notes: "Lean protein" },
  ],
  "United States": [
    { name: "Chicken Breast", protein: 31, per: "100g", notes: "Leanest protein source" },
    { name: "Greek Yogurt", protein: 17, per: "170g serving", notes: "High protein snack" },
    { name: "Cottage Cheese", protein: 11, per: "100g", notes: "Slow-digesting casein" },
    { name: "Eggs", protein: 13, per: "100g", notes: "Complete amino acid profile" },
    { name: "Tuna (canned)", protein: 25, per: "100g", notes: "Budget-friendly protein" },
    { name: "Black Beans", protein: 8.9, per: "100g cooked", notes: "Plant protein + fiber" },
  ],
  Brazil: [
    { name: "Frango (Chicken)", protein: 27, per: "100g", notes: "Lean grilled chicken" },
    { name: "Feijao (Black Beans)", protein: 8.9, per: "100g cooked", notes: "Brazilian staple" },
    { name: "Queijo (Cheese)", protein: 25, per: "100g", notes: "Minas cheese popular" },
    { name: "Ovo (Eggs)", protein: 13, per: "100g", notes: "Complete protein" },
    { name: "Atum (Tuna)", protein: 25, per: "100g", notes: "Great lean protein" },
  ],
};

export function getLocalFoods(country: string) {
  return LOCAL_FOODS_BY_COUNTRY[country] || LOCAL_FOODS_BY_COUNTRY["United States"];
}
