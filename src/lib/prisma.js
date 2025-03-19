import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global;

// Use specific connection options for serverless environments
const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.POSTGRES_PRISMA_URL_POOL || process.env.POSTGRES_PRISMA_URL,
      },
    },
    // Add connection pool configuration
    log: ['query', 'error', 'warn'],
    __internal: {
      engine: {
        // These settings help prevent connection issues in serverless environments
        connectionLimit: 5,
      },
    },
  });
};

const prisma = globalForPrisma.prisma || prismaClientSingleton();

// If we're not in production, add the client to the global object
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
