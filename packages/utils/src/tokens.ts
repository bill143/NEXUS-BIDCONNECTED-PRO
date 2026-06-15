import { randomString } from "./strings";

/**
 * Generate a secure random token for invitation links.
 * Uses crypto API when available, falls back to random string.
 */
export function generateInvitationToken(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${crypto.randomUUID()}-${crypto.randomUUID()}`.replace(/-/g, "");
  }
  return randomString(64);
}

/**
 * Generate a project number.
 * Format: YYNNN (e.g., 26004 = year 2026, project #4)
 */
export function generateProjectNumber(
  year: number,
  sequenceNumber: number
): string {
  const yearPrefix = year.toString().slice(-2);
  const sequence = sequenceNumber.toString().padStart(3, "0");
  return `${yearPrefix}${sequence}`;
}

/**
 * Hash a token for safe storage (using simple SHA-256).
 * Note: In production, use bcrypt or argon2 for password hashing.
 * This is for token comparison only.
 */
export async function hashToken(token: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hash = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hash));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  // Fallback: return token as-is (should not happen in Node.js 20+)
  return token;
}

/**
 * Verify a token against a hash.
 */
export async function verifyToken(
  token: string,
  hash: string
): Promise<boolean> {
  const tokenHash = await hashToken(token);
  return tokenHash === hash;
}