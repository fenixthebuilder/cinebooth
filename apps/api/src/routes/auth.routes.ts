// Authentication routes for the CineBooth API
import { Router, type Response } from "express";
import { randomBytes } from "node:crypto";
import argon2 from "argon2";
import { z } from "zod";

// Import the Prisma client and authentication middleware
import { prisma } from "../lib/prisma.js";
import { Prisma } from "../generated/prisma/client.js";

import {
  hashToken,
  requireAuth,
  SESSION_COOKIE,
  clearSessionCookie,
  sessionCookieOptions,
} from "../middleware/requireAuth.js";

import {
  loginRateLimit,
  registerRateLimit,
} from "../middleware/authRateLimit.js";

// Create the authentication router instance
export const authRouter = Router();

// Define the request payload schemas for registration and login
const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/)
    // Store usernames in lowercase to prevent case-sensitive duplicates.
    .transform((value) => value.toLowerCase()),

  email: z
    .email()
    .trim()
    // Normalize emails before checking uniqueness in the database.
    .transform((value) => value.toLowerCase()),

  password: z.string().min(12).max(128),
});

// Define the request payload schema for login
const loginSchema = z.object({
  email: z
    .email()
    .trim()
    .transform((value) => value.toLowerCase()),

  password: z.string(),
});

// Determine if the application is running in production mode
const isProduction = process.env.NODE_ENV === "production";

// Define the cookie options for session management
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax" as const,
  path: "/",
};

// Transform a user object into a public-facing representation,
// excluding sensitive information such as the password hash.
function publicUser(user: {
  id: string;
  username: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: Date;
}) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  };
}

// Create a new session for the authenticated user and set the session cookie
async function createSession(userId: string, res: Response): Promise<void> {
  const token = randomBytes(32).toString("hex");

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt,
    },
  });

  res.cookie(SESSION_COOKIE, token, {
    ...cookieOptions,
    expires: expiresAt,
  });
}

/**
 * Check whether Prisma rejected an operation because
 * a unique database constraint was violated.
 *
 * P2002 can occur even after checking for an existing user,
 * for example when two registrations happen concurrently.
 */
function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

// REGISTER NEW USER with rate limiting
authRouter.post("/register", registerRateLimit, async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid registration data",
        details: parsed.error.flatten(),
      });
      return;
    }

    // Username and email have already been normalized by Zod.
    const { username, email, password } = parsed.data;

    const instance = await prisma.instance.upsert({
      where: {
        domain: process.env.INSTANCE_DOMAIN ?? "localhost",
      },
      update: {},
      create: {
        domain: process.env.INSTANCE_DOMAIN ?? "localhost",
        name: process.env.INSTANCE_NAME ?? "CineBooth Local",
      },
    });

    // Early duplicate check for a more predictable API response.
    // The database unique constraints still protect against races.
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          {
            instanceId: instance.id,
            username,
          },
        ],
      },
    });

    if (existingUser) {
      res.status(409).json({
        error: "Email or username already in use",
      });
      return;
    }

    // Hash passwords with Argon2id before persisting them.
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
    });

    const user = await prisma.user.create({
      data: {
        instanceId: instance.id,
        username,
        email,
        passwordHash,
      },
    });

    await createSession(user.id, res);

    res.status(201).json({
      user: publicUser(user),
    });
  } catch (error) {
    // Handle database uniqueness violations caused by concurrent requests.
    if (isUniqueConstraintError(error)) {
      res.status(409).json({
        error: "Email or username already in use",
      });
      return;
    }

    next(error);
  }
});

// LOGIN EXISTING USER with rate limiting
authRouter.post("/login", loginRateLimit, async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid credentials",
      });
      return;
    }

    // Zod has already normalized the email address.
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({
        error: "Invalid credentials",
      });
      return;
    }

    const validPassword = await argon2.verify(user.passwordHash, password);

    if (!validPassword) {
      res.status(401).json({
        error: "Invalid credentials",
      });
      return;
    }

    await createSession(user.id, res);

    res.json({
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
});

// GET CURRENT AUTHENTICATED USER
authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: res.locals.auth.userId,
      },
    });

    if (!user) {
      res.status(401).json({
        error: "Unauthorized",
      });
      return;
    }

    res.json({
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
});

// LOGOUT
authRouter.post("/logout", requireAuth, async (req, res, next) => {
  try {
    await prisma.session.update({
      where: {
        id: res.locals.auth.sessionId,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    clearSessionCookie(res);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// LOGOUT FROM ALL DEVICES
authRouter.post("/logout-all", requireAuth, async (_req, res, next) => {
  try {
    const { userId } = res.locals.auth;

    // Revoke every active session belonging to the authenticated user.
    await prisma.session.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    // Remove the current browser's authentication cookie.
    clearSessionCookie(res);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
