import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

// Properly define globalThis for Next.js environment
const globalForPrisma = globalThis;

// Check if we're in a build environment (Next.js build process)
const isBuildTime = process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build';

// Create a client object for export
let prisma;

// Skip actual client initialization during build time to prevent errors
if (isBuildTime) {
  console.log('Build time detected, using mock Prisma client');
  prisma = {
    // Provide mock implementations for common methods
    $connect: async () => {},
    $disconnect: async () => {},
    // Add mock implementations for models you use
    ticket: {
      findUnique: async () => null,
      findMany: async () => [],
      create: async () => ({}),
      delete: async () => ({})
    },
    user: {
      findUnique: async () => null,
    }
  };
} else {
  // Regular runtime initialization
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.warn("DATABASE_URL is not defined. Database operations will fail.");
  }
  
  if (!globalForPrisma.prisma) {
    try {
      globalForPrisma.prisma = new PrismaClient({
        datasources: databaseUrl ? {
          db: {
            url: databaseUrl,
          },
        } : undefined,
      });
    } catch (e) {
      console.error("Failed to initialize Prisma client:", e);
      // Provide a minimal mock client as fallback
      globalForPrisma.prisma = {
        $connect: async () => {},
        $disconnect: async () => {},
      };
    }
  }
  
  prisma = globalForPrisma.prisma;
}

export default prisma;
