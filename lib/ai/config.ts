import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/crypto";

export interface AIProviderConfig {
  provider: string;
  model: string;
  apiKey?: string;
  baseUrl?: string;
}

export interface SystemAIConfig {
  slots: {
    primary: AIProviderConfig;
    fallback1: AIProviderConfig;
    fallback2: AIProviderConfig;
  };
}

const DEFAULT_CONFIG: SystemAIConfig = {
  slots: {
    primary: { provider: "groq", model: "llama-3.1-8b-instant", apiKey: process.env.GROQ_API_KEY },
    fallback1: { provider: "gemini", model: "gemini-1.5-flash", apiKey: process.env.GEMINI_API_KEY },
    fallback2: { provider: "groq", model: "llama-3.1-8b-instant", apiKey: process.env.GROQ_API_KEY },
  }
};

/**
 * Fetches and decrypts the system-wide AI configuration from the database.
 * Falls back to environment variables if no config is found.
 */
export async function getSystemAIConfig(): Promise<SystemAIConfig> {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "ai_configuration" }
    });

    if (!setting) return DEFAULT_CONFIG;

    const rawData = JSON.parse(setting.value);
    
    // Decrypt all keys in the slots
    const decryptedConfig: SystemAIConfig = {
      slots: {
        primary: {
          ...rawData.primary,
          apiKey: rawData.primary.apiKey ? decrypt(rawData.primary.apiKey) : undefined
        },
        fallback1: {
          ...rawData.fallback1,
          apiKey: rawData.fallback1.apiKey ? decrypt(rawData.fallback1.apiKey) : undefined
        },
        fallback2: {
          ...rawData.fallback2,
          apiKey: rawData.fallback2.apiKey ? decrypt(rawData.fallback2.apiKey) : undefined
        }
      }
    };

    return decryptedConfig;
  } catch (err) {
    console.error("Failed to load System AI Config:", err);
    return DEFAULT_CONFIG;
  }
}
