import { PrismaClient } from '@prisma/client';

// Very simple singleton pattern for serverless environments
const globalForPrisma = global;

// Get the database URL from environment variables
// Fallback to a placeholder during build time
const databaseUrl = process.env.DATABASE_URL || 
  "postgresql://placeholder:placeholder@localhost:5432/placeholder";

// Properly initialize the Prisma client with explicit connection config
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });
}

const prisma = globalForPrisma.prisma;

export default prisma;
