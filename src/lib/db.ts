import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // Only check for DATABASE_URL at runtime, not during build
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL environment variable is not set. Database operations will fail.');
    // Return a mock client during build time
    return new PrismaClient();
  }

  const client = new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  // Test the connection (but don't throw during initialization)
  client.$connect()
    .then(() => {
      console.log('Successfully connected to the database');
    })
    .catch((error) => {
      console.error('Failed to connect to the database:', error);
    });

  return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}