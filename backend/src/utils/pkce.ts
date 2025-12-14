import crypto from 'crypto';

/**
 * Calculates the code challenge from a code verifier using SHA-256
 * @param codeVerifier - The code verifier to transform
 * @returns Base64URL-encoded SHA-256 hash of the code verifier
 */
export function calculateCodeChallenge(codeVerifier: string): string {
  // Step 1: Create a SHA-256 hash of the code verifier
  const hash = crypto.createHash('sha256').update(codeVerifier).digest();

  // Step 2: Convert the hash to Base64
  const base64 = hash.toString('base64');

  // Step 3: Convert Base64 to URL-safe Base64 (Base64URL)
  const base64UrlSafe = base64
    .replace(/\+/g, '-') // Replace '+' with '-'
    .replace(/\//g, '_') // Replace '/' with '_'
    .replace(/=+$/, ''); // Remove '=' padding

  return base64UrlSafe;
}

/**
 * Verifies that a code verifier matches a code challenge
 * @param codeVerifier - The original code verifier
 * @param codeChallenge - The code challenge to verify against
 * @returns true if the verifier matches the challenge
 */
export function verifyCodeChallenge(
  codeVerifier: string,
  codeChallenge: string
): boolean {
  const calculatedChallenge = calculateCodeChallenge(codeVerifier);
  return calculatedChallenge === codeChallenge;
}
