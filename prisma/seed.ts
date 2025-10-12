import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // First, create the default time categories
  const categories = await Promise.all([
    prisma.timeCategory.upsert({
      where: { id: 'work' },
      update: {},
      create: {
        id: 'work',
        label: 'Work',
        icon: '💼',
        isCustom: false,
      },
    }),
    prisma.timeCategory.upsert({
      where: { id: 'family' },
      update: {},
      create: {
        id: 'family',
        label: 'Family',
        icon: '👨‍👩‍👧‍👦',
        isCustom: false,
      },
    }),
    prisma.timeCategory.upsert({
      where: { id: 'rest' },
      update: {},
      create: {
        id: 'rest',
        label: 'Rest',
        icon: '😴',
        isCustom: false,
      },
    }),
    prisma.timeCategory.upsert({
      where: { id: 'hobby' },
      update: {},
      create: {
        id: 'hobby',
        label: 'Hobby',
        icon: '🎨',
        isCustom: false,
      },
    }),
  ]);

  // Create sample check-ins for the last 30 days
  const now = new Date();
  const checkIns = [];

  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(now.getDate() - i);
    date.setHours(20, 0, 0, 0); // Set to 8 PM

    const checkIn = await prisma.checkIn.create({
      data: {
        window: 'evening',
        physical17: Math.floor(Math.random() * 7) + 3, // Random between 3-10
        cognitive17: Math.floor(Math.random() * 7) + 3, // Random between 3-10
        mood17: Math.floor(Math.random() * 3) + 1,
        stress17: Math.floor(Math.random() * 4) + 1,
        note: 'Sample data',
        tsUtc: date,
        timeEntries: {
          create: [
            {
              categoryId: 'work',
              hours: Math.floor(Math.random() * 5) + 4, // 4-9 hours
            },
            {
              categoryId: 'family',
              hours: Math.floor(Math.random() * 3) + 2, // 2-5 hours
            },
            {
              categoryId: 'rest',
              hours: Math.floor(Math.random() * 3) + 6, // 6-9 hours (including sleep)
            },
            {
              categoryId: 'hobby',
              hours: Math.floor(Math.random() * 2) + 1, // 1-3 hours
            },
          ],
        },
      },
    });

    checkIns.push(checkIn);
  }

  console.log('Seed data created successfully!');
  console.log(`Created ${categories.length} categories`);
  console.log(`Created ${checkIns.length} check-ins with time entries`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
