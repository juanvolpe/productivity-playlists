const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient();
  try {
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('Successfully connected to database');
    
    const result = await prisma.$queryRaw`SELECT NOW()`;
    console.log('Database time:', result);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

testConnection(); 