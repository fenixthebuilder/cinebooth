import express from "express";
import cors from "cors";
import helmet from "helmet";

export const app = express();

app.use(helmet());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

app.use(express.json({ limit: "1mb" }));

app.get("/api/v1/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "cinebooth-api",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
  });
});