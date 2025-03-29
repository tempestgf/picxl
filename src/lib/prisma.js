import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

// Properly define globalThis for Next.js environment
const globalForPrisma = globalThis;

// Get the database URL from environment variables
const databaseUrl = process.env.DATABASE_URL;

// Validate database URL before proceeding
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not defined. Please provide a valid database URL in your environment variables."
  );
}

// Create a client object for export
let prisma;

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });
}

// Assign the client instance with proper type safety
prisma = globalForPrisma.prisma;

// Logging to help debug the initialization
if (!prisma) {
  console.error("Failed to initialize Prisma client");
  // Fall back to a new instance if the global one fails
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });
}

export default prisma;
