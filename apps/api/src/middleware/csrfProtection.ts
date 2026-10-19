// Middleware for CSRF protection based on request origin.
import type { NextFunction, Request, Response } from "express";
// HTTP methods considered safe and do not require CSRF checks.
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * Ensures that requests modifying data come
 * exclusively from an authorized origin.
 *
 * This check is independent of CORS: it is applied
 * directly by the server before executing the routes.
 */
export function csrfProtection(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Read-only requests do not require CSRF checks.
  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  const allowedOrigins = new Set<string>();

  const webOrigin = process.env.WEB_ORIGIN;

  if (!webOrigin) {
    res.status(500).json({
      error: "Server origin configuration is missing",
    });
    return;
  }

  // The official frontend origin.
  allowedOrigins.add(new URL(webOrigin).origin);

  // During development, also allow requests
  // coming from the local API origin.
  if (process.env.NODE_ENV === "development") {
    const port = process.env.PORT ?? "4000";

    allowedOrigins.add(`http://localhost:${port}`);
  }

  const origin = req.get("Origin");

  // Reject requests without an Origin header.
  // Do not consider "null" a trusted origin.
  if (!origin || origin === "null") {
    res.status(403).json({
      error: "Origin header is required",
    });
    return;
  }

  let normalizedOrigin: string;

  try {
    const parsed = new URL(origin);

    // Origin must contain only scheme, host, and port.
    if (
      parsed.origin !== origin ||
      !["http:", "https:"].includes(parsed.protocol)
    ) {
      throw new Error("Invalid origin");
    }

    normalizedOrigin = parsed.origin;
  } catch {
    res.status(403).json({
      error: "Invalid Origin header",
    });
    return;
  }

  if (!allowedOrigins.has(normalizedOrigin)) {
    res.status(403).json({
      error: "Origin not allowed",
    });
    return;
  }

  next();
}
