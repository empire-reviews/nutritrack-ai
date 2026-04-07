export interface AIRequest {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  userId?: string;
}

export interface AIResponse {
  text: string;
  provider: string;
  model: string;
  tokensUsed: number;
}

export interface AIProviderSettings {
  provider: string;
  model: string;
  apiKey?: string;
  baseUrl?: string;
}

async function callGroq(req: AIRequest, apiKey: string, model: string): Promise<AIResponse> {
  const key = apiKey || process.env.GROQ_API_KEY || "";
  if (!key) throw new Error("No Groq API key");
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: model || "llama3-70b-8192",
      messages: [
        ...(req.systemPrompt ? [{ role: "system", content: req.systemPrompt }] : []),
        { role: "user", content: req.prompt },
      ],
      temperature: req.temperature ?? 0.7,
      max_tokens: req.maxTokens ?? 1024,
    }),
  });
  if (!res.ok) throw new Error(`Groq error: ${res.status}`);
  const data = await res.json();
  return {
    text: data.choices[0].message.content,
    provider: "groq",
    model: model || "llama3-70b-8192",
    tokensUsed: data.usage?.total_tokens || 0,
  };
}

async function callGemini(req: AIRequest, apiKey: string, model: string): Promise<AIResponse> {
  const key = apiKey || process.env.GEMINI_API_KEY || "";
  if (!key) throw new Error("No Gemini API key");
  const mdl = model || "gemini-1.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${mdl}:generateContent?key=${key}`;
  const parts = [];
  if (req.systemPrompt) parts.push({ text: req.systemPrompt + "\n\n" + req.prompt });
  else parts.push({ text: req.prompt });
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: { temperature: req.temperature ?? 0.7, maxOutputTokens: req.maxTokens ?? 1024 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
  const data = await res.json();
  return {
    text: data.candidates[0].content.parts[0].text,
    provider: "gemini",
    model: mdl,
    tokensUsed: data.usageMetadata?.totalTokenCount || 0,
  };
}

async function callOpenAICompat(req: AIRequest, baseUrl: string, apiKey: string, model: string, provider: string): Promise<AIResponse> {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({
      model,
      messages: [
        ...(req.systemPrompt ? [{ role: "system", content: req.systemPrompt }] : []),
        { role: "user", content: req.prompt },
      ],
      temperature: req.temperature ?? 0.7,
      max_tokens: req.maxTokens ?? 1024,
    }),
    signal: AbortSignal.timeout(["ollama", "lmstudio", "localai"].includes(provider) ? 600000 : 30000), // 10 mins for local, 30s for cloud
  });
  if (!res.ok) throw new Error(`${provider} error: ${res.status}`);
  const data = await res.json();
  return {
    text: data.choices[0].message.content,
    provider,
    model,
    tokensUsed: data.usage?.total_tokens || 0,
  };
}

async function callProvider(req: AIRequest, settings: AIProviderSettings): Promise<AIResponse> {
  const { provider, model, apiKey, baseUrl } = settings;
  switch (provider) {
    case "groq":
      return callGroq(req, apiKey || "", model);
    case "gemini":
      return callGemini(req, apiKey || "", model);
    case "openai":
      return callOpenAICompat(req, "https://api.openai.com/v1", apiKey || process.env.OPENAI_API_KEY || "", model || "gpt-3.5-turbo", "openai");
    case "anthropic": {
      const key = apiKey || process.env.ANTHROPIC_API_KEY || "";
      if (!key) throw new Error("No Anthropic key");
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: model || "claude-3-haiku-20240307",
          max_tokens: req.maxTokens ?? 1024,
          system: req.systemPrompt,
          messages: [{ role: "user", content: req.prompt }],
        }),
      });
      if (!res.ok) throw new Error(`Anthropic error: ${res.status}`);
      const d = await res.json();
      return { text: d.content[0].text, provider: "anthropic", model: model || "claude-3-haiku-20240307", tokensUsed: d.usage?.input_tokens + d.usage?.output_tokens || 0 };
    }
    case "mistral":
      return callOpenAICompat(req, "https://api.mistral.ai/v1", apiKey || process.env.MISTRAL_API_KEY || "", model || "mistral-small-latest", "mistral");
    case "together":
      return callOpenAICompat(req, "https://api.together.xyz/v1", apiKey || process.env.TOGETHER_API_KEY || "", model || "meta-llama/Llama-3-8b-chat-hf", "together");
    case "openrouter":
      return callOpenAICompat(req, "https://openrouter.ai/api/v1", apiKey || process.env.OPENROUTER_API_KEY || "", model || "mistralai/mistral-7b-instruct:free", "openrouter");
    case "cohere": {
      const key = apiKey || process.env.COHERE_API_KEY || "";
      if (!key) throw new Error("No Cohere key");
      const res = await fetch("https://api.cohere.ai/v1/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({ model: model || "command-r", message: req.prompt, preamble: req.systemPrompt }),
      });
      if (!res.ok) throw new Error(`Cohere error: ${res.status}`);
      const d = await res.json();
      return { text: d.text, provider: "cohere", model: model || "command-r", tokensUsed: d.meta?.tokens?.input_tokens + d.meta?.tokens?.output_tokens || 0 };
    }
    case "deepseek":
      return callOpenAICompat(req, "https://api.deepseek.com/v1", apiKey || process.env.DEEPSEEK_API_KEY || "", model || "deepseek-chat", "deepseek");
    case "huggingface": {
      const key = apiKey || process.env.HUGGINGFACE_API_KEY || "";
      if (!key) throw new Error("No HuggingFace key");
      const mdl = model || "mistralai/Mistral-7B-Instruct-v0.3";
      const res = await fetch(`https://api-inference.huggingface.co/models/${mdl}/v1/chat/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: req.prompt }], max_tokens: req.maxTokens ?? 1024 }),
      });
      if (!res.ok) throw new Error(`HuggingFace error: ${res.status}`);
      const d = await res.json();
      return { text: d.choices[0].message.content, provider: "huggingface", model: mdl, tokensUsed: 0 };
    }
    case "ollama":
      return callOpenAICompat(req, (baseUrl || process.env.OLLAMA_BASE_URL || "http://localhost:11434") + "/v1", "", model || "llama3", "ollama");
    case "lmstudio":
      return callOpenAICompat(req, baseUrl || process.env.LMSTUDIO_BASE_URL || "http://localhost:1234/v1", "", model || "local-model", "lmstudio");
    case "localai":
      return callOpenAICompat(req, baseUrl || process.env.LOCALAI_BASE_URL || "http://localhost:8080/v1", "", model || "gpt-3.5-turbo", "localai");
    default:
      return callGroq(req, "", "llama3-70b-8192");
  }
}

export async function aiComplete(req: AIRequest, userSettings?: AIProviderSettings): Promise<AIResponse> {
  const primary: AIProviderSettings = userSettings || {
    provider: process.env.DEFAULT_AI_PROVIDER || "groq",
    model: "llama3-70b-8192",
    apiKey: process.env.GROQ_API_KEY,
  };

  const fallbackChain: AIProviderSettings[] = [
    { provider: "gemini", model: "gemini-1.5-flash", apiKey: process.env.GEMINI_API_KEY },
    { provider: "groq", model: "llama3-8b-8192", apiKey: process.env.GROQ_API_KEY },
  ];

  const toTry = [primary, ...fallbackChain.filter(f => f.provider !== primary.provider)];

  for (const settings of toTry) {
    try {
      return await callProvider(req, settings);
    } catch (err) {
      console.warn(`AI provider ${settings.provider} failed:`, err);
      continue;
    }
  }

  // Last resort: mock
  return {
    text: "I am currently unavailable. Please configure a valid AI provider in Settings.",
    provider: "none",
    model: "none",
    tokensUsed: 0,
  };
}

export function parseFoodPrompt(foodDescription: string, country: string): AIRequest {
  return {
    systemPrompt: `You are a certified clinical nutritionist with a USDA food composition database. You MUST provide accurate, evidence-based nutritional values. Your values must match real-world nutrition data within 10% accuracy.

CRITICAL ACCURACY RULES:
- Use USDA FoodData Central values as your reference
- Calculate based on ACTUAL weight in grams, not arbitrary numbers
- 1g protein = 4 kcal, 1g carbs = 4 kcal, 1g fat = 9 kcal
- Calories MUST equal: (protein × 4) + (carbs × 4) + (fat × 9) ± 10%
- If unsure, use the HIGHER estimate for calories, never undercount

REFERENCE DATA FOR COMMON FOODS (per 100g cooked/prepared):
- White rice cooked: 130 kcal, 2.7g protein, 28g carbs, 0.3g fat
- Wheat roti/chapati (1 medium ~40g): 120 kcal, 3.5g protein, 18g carbs, 3.5g fat
- Chicken breast cooked: 165 kcal, 31g protein, 0g carbs, 3.6g fat
- Chicken curry (with gravy): 150 kcal, 14g protein, 5g carbs, 8g fat per 100g
- Dal/lentils cooked: 116 kcal, 9g protein, 20g carbs, 0.4g fat
- Egg whole boiled: 155 kcal, 13g protein, 1.1g carbs, 11g fat (1 egg ~50g = 78 kcal)
- Paneer: 265 kcal, 18g protein, 1.2g carbs, 21g fat
- Milk whole (1 cup 240ml): 149 kcal, 8g protein, 12g carbs, 8g fat
- Banana (1 medium 118g): 105 kcal, 1.3g protein, 27g carbs, 0.4g fat
- Apple (1 medium 182g): 95 kcal, 0.5g protein, 25g carbs, 0.3g fat
- Bread white (1 slice 25g): 66 kcal, 2g protein, 13g carbs, 0.8g fat
- Lauki/bottle gourd sabji: 25 kcal, 0.6g protein, 5g carbs, 0.5g fat per 100g (with oil+spices: ~60 kcal, 1.5g protein, 6g carbs, 3g fat per 100g)
- Aloo sabji (potato curry): 120 kcal, 2g protein, 16g carbs, 5g fat per 100g
- Rajma/kidney beans cooked: 127 kcal, 8.7g protein, 22.8g carbs, 0.5g fat
- Chole/chickpea curry: 140 kcal, 7g protein, 18g carbs, 5g fat per 100g
- Biryani chicken: 180 kcal, 10g protein, 22g carbs, 6g fat per 100g
- Paratha (1 medium ~80g): 260 kcal, 5g protein, 30g carbs, 13g fat
- Dosa plain (1 medium ~85g): 120 kcal, 3g protein, 18g carbs, 4g fat
- Idli (1 piece ~40g): 39 kcal, 2g protein, 8g carbs, 0.1g fat
- Samosa (1 piece ~100g): 262 kcal, 4g protein, 28g carbs, 15g fat
- Lassi sweet (1 glass 250ml): 165 kcal, 6g protein, 25g carbs, 4g fat
- Oats cooked (1 cup): 158 kcal, 6g protein, 27g carbs, 3.2g fat
- Pasta cooked: 131 kcal, 5g protein, 25g carbs, 1.1g fat
- Naan (1 piece ~90g): 262 kcal, 8.7g protein, 43g carbs, 5.3g fat

PORTION SIZE RULES FOR ${country}:
- Roti/chapati: 1 medium = 35-45g
- Rice serving: 1 plate/katori = 150-200g cooked
- Sabji/curry serving: 1 bowl/katori = 150-200g
- Dal serving: 1 bowl = 150-200g
- If user says "a plate" or "a bowl", use standard ${country} portions
- If quantity is ambiguous, assume a normal adult serving

Respond ONLY in valid JSON. No text before or after.`,
    prompt: `Parse this food into INDIVIDUAL items with ACCURATE nutrition based on real USDA/nutrition database values.

User country: ${country}
Food description: "${foodDescription}"

JSON format (respond with ONLY this, no other text):
{
  "items": [
    {
      "name": "Specific Food Name",
      "quantity": 1,
      "unit": "piece/bowl/cup/plate",
      "estimatedGrams": 0,
      "calories": 0,
      "protein": 0.0,
      "carbs": 0.0,
      "fat": 0.0,
      "fiber": 0.0
    }
  ],
  "totalCalories": 0,
  "totalProtein": 0.0,
  "confidence": "high",
  "notes": "Brief note about portion assumptions"
}`,
    temperature: 0.15,
    maxTokens: 1500,
  };
}

export function recommendationsPrompt(profile: {
  country: string;
  goal: string;
  remainingCalories: number;
  remainingProtein: number;
  dietaryRestrictions: string[];
  medicalConditions: string[];
  cuisine: string;
}): AIRequest {
  return {
    systemPrompt: "You are a professional nutritionist. Always respond in valid JSON only.",
    prompt: `Generate 3 food recommendations for a user with this profile:
Country: ${profile.country}
Goal: ${profile.goal}
Preferred Cuisine: ${profile.cuisine}
Remaining calories today: ${profile.remainingCalories} kcal
Remaining protein today: ${profile.remainingProtein}g
Dietary restrictions: ${profile.dietaryRestrictions.join(", ") || "none"}
Medical conditions: ${profile.medicalConditions.join(", ") || "none"}

CRITICAL RULES:
1. YOU MUST STRICTLY OBEY DIETARY RESTRICTIONS. If Vegetarian/Vegan, NEVER suggest meat/poultry/fish. 
2. Tailor to their medical conditions.
3. Recommend foods matching their preferred cuisine.

Respond ONLY with this JSON:
{
  "quickSnacks": [
    {"name": "...", "calories": 0, "protein": 0, "description": "...", "prepTime": "5 min"}
  ],
  "nextMeal": {
    "name": "...",
    "items": ["..."],
    "totalCalories": 0,
    "totalProtein": 0
  },
  "toHitGoal": {
    "summary": "...",
    "options": [{"food": "...", "amount": "...", "protein": 0}]
  }
}`,
    temperature: 0.7,
    maxTokens: 1024,
  };
}

export function dailySummaryPrompt(data: {
  name: string;
  calories: number;
  targetCalories: number;
  protein: number;
  targetProtein: number;
  carbs: number;
  fat: number;
  waterMl: number;
  targetWaterMl: number;
  streakDays: number;
}): AIRequest {
  return {
    systemPrompt: "You are a friendly, encouraging nutrition coach. Be conversational and motivating.",
    prompt: `Generate a personalized end-of-day nutrition summary for ${data.name}:
Calories: ${data.calories}/${data.targetCalories} kcal (${Math.round((data.calories / data.targetCalories) * 100)}%)
Protein: ${data.protein}/${data.targetProtein}g (${Math.round((data.protein / data.targetProtein) * 100)}%)
Carbs: ${data.carbs}g
Fat: ${data.fat}g
Water: ${data.waterMl}/${data.targetWaterMl}ml (${Math.round((data.waterMl / data.targetWaterMl) * 100)}%)
Streak: ${data.streakDays} days

Write a 3-4 paragraph encouraging summary. Mention what went well, what to improve, and a specific actionable tip for tomorrow. Use emojis. Keep it personal and motivating.`,
    temperature: 0.8,
    maxTokens: 512,
  };
}
