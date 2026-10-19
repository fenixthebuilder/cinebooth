// Main application entry point for the Cinebooth API using Express.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import { authRouter } from "./routes/auth.routes.js";
import { csrfProtection } from "./middleware/csrfProtection.js";

export const app = express();

// Avoid exposing the framework via the X-Powered-By header.
app.disable("x-powered-by");

// Set security-related HTTP headers.
app.use(helmet());

// Allow the authorized frontend to use cookies.
app.use(
  cors({
    origin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
    credentials: true,
  }),
);

// Limit the size of JSON request bodies.
app.use(express.json({ limit: "100kb" }));

// Make cookies available via req.cookies.
app.use(cookieParser());

// Public endpoint to check the API status.
app.get("/api/v1/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "cinebooth-api",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
  });
});

// Protection against data-modifying requests
// coming from unauthorized origins.
app.use(csrfProtection);

// Authentication endpoint.
app.use("/api/v1/auth", authRouter);

// Centralized error handling.
app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("[CineBooth API]", error);

    res.status(500).json({
      error: "Internal server error",
    });
  },
);
