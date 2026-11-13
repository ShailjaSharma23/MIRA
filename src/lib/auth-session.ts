import crypto from "crypto";

const AUTH_SECRET = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "mira-default-production-secure-secret-key-32";

export interface SessionData {
  userId: string;
  email: string;
  name: string;
  avatar?: string;
  exp: number;
}

export function createSessionToken(data: Omit<SessionData, "exp">): string {
  // 30 days expiry
  const exp = Date.now() + 30 * 24 * 60 * 60 * 1000;
  const payload: SessionData = { ...data, exp };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", AUTH_SECRET).update(payloadB64).digest("base64url");
  return `${payloadB64}.${signature}`;
}

export function verifySessionToken(token: string): SessionData | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [payloadB64, signature] = parts;
    const expectedSig = crypto.createHmac("sha256", AUTH_SECRET).update(payloadB64).digest("base64url");

    if (signature !== expectedSig) return null;

    const payload: SessionData = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    if (Date.now() > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}
