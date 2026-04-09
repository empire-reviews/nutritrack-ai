const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:Rv6ty9hbLhfqwVfH@db.kaslstkuegjrdkqunxry.supabase.co:5432/postgres"
    },
  },
});

const crypto = require('crypto');
const ENCRYPTION_KEY = "nutritrack-32char-encryption-key"; // Default

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

async function inject() {
  const finalData = {
    primary: {
      provider: "groq",
      model: "llama-3.1-8b-instant",
      apiKey: encrypt("gsk_qFmD2xZIs6dD4v2oY9q9WGdyb3FYNp2sD7fG1j3mK9L5z8n2pQ") // Placeholder, replace with yours
    },
    fallback1: { provider: "groq", model: "llama-3.1-8b-instant", apiKey: null },
    fallback2: { provider: "groq", model: "llama-3.1-8b-instant", apiKey: null },
    updatedAt: new Date().toISOString()
  };

  try {
    await prisma.systemSetting.upsert({
      where: { key: "ai_configuration" },
      create: { 
        id: "ai_config",
        key: "ai_configuration", 
        value: JSON.stringify(finalData) 
      },
      update: { value: JSON.stringify(finalData) },
    });
    console.log("✅ AI Configuration successfully injected into Database!");
  } catch (e) {
    console.error("❌ Failed to inject:", e);
  } finally {
    await prisma.$disconnect();
  }
}

inject();
