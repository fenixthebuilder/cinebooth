import { prisma } from "../lib/prisma.js";

// Run the cleanup once every hour.
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;

// Keep revoked sessions for 24 hours before removing them.
const REVOKED_RETENTION_MS = 24 * 60 * 60 * 1000;

let cleanupTimer: NodeJS.Timeout | undefined;
let cleanupRunning = false;

/**
 * Remove expired sessions and sessions that were revoked
 * more than 24 hours ago.
 */
export async function cleanupSessions(): Promise<void> {
  if (cleanupRunning) {
    return;
  }

  cleanupRunning = true;

  try {
    const now = new Date();

    const revokedBefore = new Date(now.getTime() - REVOKED_RETENTION_MS);

    const result = await prisma.session.deleteMany({
      where: {
        OR: [
          { expiresAt: { lte: now } },
          { revokedAt: { lte: revokedBefore } },
        ],
      },
    });

    if (result.count > 0) {
      console.log(`[CineBooth Sessions] Removed ${result.count} old sessions`);
    }
  } catch (error) {
    console.error("[CineBooth Sessions] Cleanup failed:", error);
  } finally {
    cleanupRunning = false;
  }
}

// Start periodic cleanup without preventing Node.js from exiting.
export function startSessionCleanup(): void {
  if (cleanupTimer) {
    return;
  }

  void cleanupSessions();

  cleanupTimer = setInterval(() => {
    void cleanupSessions();
  }, CLEANUP_INTERVAL_MS);

  cleanupTimer.unref();
}

// Stop scheduling new cleanup operations.
export function stopSessionCleanup(): void {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = undefined;
  }
}
