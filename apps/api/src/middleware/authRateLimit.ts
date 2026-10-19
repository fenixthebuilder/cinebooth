// Middleware for rate limiting authentication-related routes (registration and login)
import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";

import { redis } from "../lib/redis.js";

// Helper function to create a Redis store for rate limiting with a specific key prefix
function createRedisStore(prefix: string): RedisStore {
  return new RedisStore({
    sendCommand: (...args: string[]) => redis.sendCommand(args),
    prefix,
  });
}

// Rate limiting configuration for registration and login routes
export const registerRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  store: createRedisStore("cinebooth:rl:register:"),
  message: {
    error: "Too many registration attempts. Try again later.",
  },
});

// Rate limiting configuration for login routes
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  store: createRedisStore("cinebooth:rl:login:"),
  message: {
    error: "Too many login attempts. Try again later.",
  },
});
