const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Creating sample playlist...');
    
    const playlist = await prisma.playlist.create({
      data: {
        name: "Morning Routine",
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        tasks: {
          create: [
            {
              title: "Meditation",
              duration: 10,
              order: 1,
              isCompleted: false
            },
            {
              title: "Exercise",
              duration: 30,
              order: 2,
              isCompleted: false
            },
            {
              title: "Reading",
              duration: 20,
              order: 3,
              isCompleted: false
            }
          ]
        }
      },
      include: {
        tasks: true
      }
    });

    console.log('Sample playlist created:', playlist);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 