// Middleware and utility functions for handling authentication and session management.
import type { NextFunction, Request, Response } from "express";
import { createHash } from "node:crypto";

import { prisma } from "../lib/prisma.js";

// Name of the session cookie used for authentication.
export const SESSION_COOKIE = "cinebooth_session";

// Shared cookie settings used when clearing a session.
export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

// Function to hash the session token for secure storage and comparison.
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// Clear the authentication cookie from the client's browser.
export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE, sessionCookieOptions);
}

// Middleware function to enforce authentication on protected routes.
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
      select: {
        id: true,
        userId: true,
        revokedAt: true,
        expiresAt: true,
      },
    });

    // Reject revoked or expired sessions and remove their browser cookie.
    if (!session || session.revokedAt || session.expiresAt <= new Date()) {
      clearSessionCookie(res);

      res.status(401).json({
        error: "Invalid or expired session",
      });
      return;
    }

    // Make authenticated user and session IDs available to protected routes.
    res.locals.auth = {
      userId: session.userId,
      sessionId: session.id,
    };

    next();
  } catch (error) {
    next(error);
  }
}
