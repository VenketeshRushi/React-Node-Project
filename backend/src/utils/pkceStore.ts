import { redisClient } from '@/services/redis/redis.client.js';

interface PKCEData {
  codeChallenge: string;
  timestamp: number;
}

/**
 * Store PKCE challenge with state
 */
export async function storePKCEChallenge(
  state: string,
  codeChallenge: string,
  ttl: number = 600
): Promise<void> {
  const key = `pkce:${state}`;
  const data: PKCEData = {
    codeChallenge,
    timestamp: Date.now(),
  };

  await redisClient.setex(key, ttl, JSON.stringify(data));
}

/**
 * Consume (retrieve and delete) PKCE challenge
 */
export async function consumePKCEChallenge(
  state: string
): Promise<PKCEData | null> {
  const key = `pkce:${state}`;

  const pipeline = redisClient.pipeline();
  pipeline.get(key);
  pipeline.del(key);

  const results = await pipeline.exec();

  if (!results || !results[0] || !results[0][1]) {
    return null;
  }

  const data = results[0][1] as string;
  return JSON.parse(data) as PKCEData;
}
