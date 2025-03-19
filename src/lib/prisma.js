import { PrismaClient } from '@prisma/client';

// Very simple singleton pattern for serverless environments
const globalForPrisma = global;

// Simple Prisma client initialization
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient();
}

const prisma = globalForPrisma.prisma;

export default prisma;
