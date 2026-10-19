// Initialize and configure the Prisma client for database access
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

// Retrieve the database connection string from environment variables
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

// Create a new PrismaPg adapter instance with the connection string
const adapter = new PrismaPg({
  connectionString,
});

// Instantiate the Prisma client with the configured adapter
export const prisma = new PrismaClient({
  adapter,
});
