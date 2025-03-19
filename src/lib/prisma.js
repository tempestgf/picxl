import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global;

// Ensure the prisma instance is pristine at the start of every request in development
if (process.env.NODE_ENV === 'development' && globalForPrisma.prisma) {
  // Only disconnect if there's an existing client
  globalForPrisma.prisma.$disconnect();
  globalForPrisma.prisma = null;
}

// Create a new PrismaClient with pooled connections
const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.POSTGRES_PRISMA_URL_POOL, // Use the connection pool URL
      },
    },
    // Add log levels for debugging if needed
    log: ['error', 'warn'],
    // Configure connection pooling
    __internal: {
      useUds: true, // Use Unix Domain Socket where available
    },
  });
};

// Use existing client instance or create a new one
const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

// Save reference to the client on the global object in development
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;

// Add a handler for cleanup during shutdown
if (process.env.NODE_ENV !== 'production') {
  process.on('beforeExit', () => {
    if (globalForPrisma.prisma) {
      globalForPrisma.prisma.$disconnect();
    }
  });
}
