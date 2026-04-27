import { PrismaClient } from '@/app/generated/prisma';

// ============================================
// PRISMA CLIENT SINGLETON
// PostgreSQL via DATABASE_URL
// ============================================

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}

export default db;
