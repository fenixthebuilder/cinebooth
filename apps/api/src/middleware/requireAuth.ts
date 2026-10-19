// Middleware to require authentication for protected routes
import type { NextFunction, Request, Response } from "express";

import { createHash } from "node:crypto";
import { prisma } from "../lib/prisma.js";

export const SESSION_COOKIE = "cinebooth_session";

// Name of the session cookie used for authentication
// Function to hash the session token for secure storage and comparison
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// Middleware function to enforce authentication on protected routes
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = req.cookies?.[SESSION_COOKIE];

    if (typeof token !== "string" || !token) {
      res.status(401).json({
        error: "Unauthorized",
      });
      return;
    }

    const session = await prisma.session.findUnique({
      where: {
        tokenHash: hashToken(token),
      },
      include: {
        user: true,
      },
    });

    if (!session || session.revokedAt || session.expiresAt <= new Date()) {
      res.status(401).json({
        error: "Invalid or expired session",
      });
      return;
    }

    res.locals.auth = {
      userId: session.user.id,
      sessionId: session.id,
    };

    next();
  } catch (error) {
    next(error);
  }
}
