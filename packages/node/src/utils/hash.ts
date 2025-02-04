import crypto from "crypto";

/**
 * Creates a consistent hash from a string value
 * @param value - The string to hash
 * @returns A 6-character hash string
 */
export function hashKey(value: string, salt: string): string {
  return crypto
    .createHash("md5")
    .update(salt + value)
    .digest("hex")
    .slice(0, 6);
}
