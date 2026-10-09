import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

export async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL connected successfully via Prisma Client');
  } catch (error) {
    console.error('❌ Failed to connect to PostgreSQL:', error);
    process.exit(1);
  }
}
