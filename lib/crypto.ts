import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "nutritrack-32char-encryption-key-fallback";
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

/**
 * Encrypts a string using AES-256-GCM.
 * Format: salt:iv:authTag:encryptedData
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const salt = crypto.randomBytes(SALT_LENGTH);
  
  // Use PBKDF2 to derive a key from the secret
  const key = crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, 100000, 32, "sha256");
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  
  return [
    salt.toString("hex"),
    iv.toString("hex"),
    tag.toString("hex"),
    encrypted.toString("hex")
  ].join(":");
}

/**
 * Decrypts a string encrypted with the above encrypt function.
 */
export function decrypt(encryptedText: string): string {
  try {
    const [saltHex, ivHex, tagHex, dataHex] = encryptedText.split(":");
    
    if (!saltHex || !ivHex || !tagHex || !dataHex) return "";
    
    const salt = Buffer.from(saltHex, "hex");
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const encryptedData = Buffer.from(dataHex, "hex");
    
    const key = crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, 100000, 32, "sha256");
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    decipher.setAuthTag(tag);
    
    return Buffer.concat([
      decipher.update(encryptedData),
      decipher.final()
    ]).toString("utf8");
  } catch (err) {
    console.error("Decryption failed:", err);
    return "";
  }
}
