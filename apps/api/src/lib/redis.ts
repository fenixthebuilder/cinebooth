// Redis client setup and connection management
import { createClient } from "redis";

// Retrieve the Redis connection URL from environment variables
// Throw an error if the Redis URL is not configured
const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("REDIS_URL is not configured");
}

// Create and configure the Redis client instance
export const redis = createClient({
  url: redisUrl,
});
// Handle Redis client errors and log them to the console
redis.on("error", (error) => {
  console.error("[Redis]", error);
});

// Connect to the Redis server if not already connected
export async function connectRedis(): Promise<void> {
  if (!redis.isOpen) {
    await redis.connect();
  }
}

// Disconnect from the Redis server if currently connected
export async function disconnectRedis(): Promise<void> {
  if (redis.isOpen) {
    await redis.quit();
  }
}
