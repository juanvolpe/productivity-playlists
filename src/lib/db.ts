import { PrismaClient } from '@prisma/client'
import { logger } from './logger'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

logger.info('Initializing Prisma client with environment:', {
  nodeEnv: process.env.NODE_ENV,
  hasDbUrl: !!process.env.DATABASE_URL
});

// Simplified Prisma client without event handlers
export const prisma = globalThis.prisma || new PrismaClient({
  log: ['error', 'warn'],
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
} 