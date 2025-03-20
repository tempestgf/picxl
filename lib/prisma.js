import { PrismaClient } from '@prisma/client';

// Configuración específica para entornos serverless
const prismaClientSingleton = () => {
  // En producción (Vercel), usar configuración de conexión optimizada para serverless
  if (process.env.NODE_ENV === 'production') {
    return new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      // Configuración específica para entornos serverless
      log: ['error', 'warn'],
      // Reducir el número de conexiones y configurar tiempos de espera
      connection: {
        options: {
          min: 0,      // Mínimo número de conexiones
          max: 10,     // Máximo número de conexiones
          idle: 10000, // Tiempo de espera máximo para conexiones inactivas en ms
        },
      },
    });
  } else {
    // Configuración para desarrollo local
    return new PrismaClient();
  }
};

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global;

const prisma = globalForPrisma.prisma || prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
