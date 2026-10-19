// Entry point for the CineBooth API server
import "dotenv/config";

import { connectRedis, disconnectRedis } from "./lib/redis.js";
import { prisma } from "./lib/prisma.js";

const port = Number(process.env.PORT ?? 4000);

// Main entry point for the CineBooth API server
async function main(): Promise<void> {
  // Redis deve essere pronto prima di importare Express.
  await connectRedis();

  // Import dinamico: inizializza le route solo dopo Redis.
  const { app } = await import("./app.js");

  const server = app.listen(port, () => {
    console.log(`[CineBooth API] http://localhost:${port}`);
    console.log("[CineBooth API] Redis connected");
  });
  // Graceful shutdown handling for termination signals
  let shuttingDown = false;
  // Function to handle graceful shutdown of the server
  async function shutdown(signal: string): Promise<void> {
    if (shuttingDown) return;
    shuttingDown = true;

    console.log(`[CineBooth API] ${signal} received`);

    server.close(async () => {
      try {
        await Promise.all([disconnectRedis(), prisma.$disconnect()]);

        process.exit(0);
      } catch (error) {
        console.error("[CineBooth API] Shutdown error:", error);
        process.exit(1);
      }
    });
  }
  // Listen for termination signals and initiate graceful shutdown
  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}
// Start the main function and handle startup errors
main().catch(async (error) => {
  console.error("[CineBooth API] Startup failed:", error);

  await Promise.allSettled([disconnectRedis(), prisma.$disconnect()]);

  process.exit(1);
});
