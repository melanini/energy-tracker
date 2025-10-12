import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const categoryColors: Record<string, string> = {
  work: '#953599',
  family: '#f5855f',
  rest: '#ce0069',
  hobby: '#A855F7'
};

const categoryIcons: Record<string, string> = {
  work: '💼',
  family: '👨‍👩‍👧‍👦',
  rest: '😴',
  hobby: '🎨'
};

export async function GET(request: Request) {
  console.log('Activity Distribution API called');
  
  // Check if prisma is initialized
  if (!prisma) {
    console.error('Prisma client is not initialized');
    return NextResponse.json(
      { error: 'Database connection not available' },
      { status: 500 }
    );
  }

  try {
    // Test database connection
    await prisma.$connect();
    const { searchParams } = new URL(request.url);
    const timeFrame = searchParams.get('timeFrame') || 'last30';

    // Calculate date range based on timeFrame
    const now = new Date();
    let startDate = new Date();

    switch (timeFrame) {
      case 'last7':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'last30':
        startDate.setDate(now.getDate() - 30);
        break;
      case 'last90':
        startDate.setDate(now.getDate() - 90);
        break;
      case 'lastYear':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Fetch time entries from check-ins
    console.log('Querying check-ins from:', startDate, 'to:', now);
    
    // First check if we have any categories
    const categories = await prisma.timeCategory.findMany();
    console.log('Available categories:', categories);

    // Then get all time entries for the date range
    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        checkIn: {
          tsUtc: {
            gte: startDate,
            lte: now
          }
        }
      },
      include: {
        category: true,
        checkIn: true
      }
    });
    
    console.log('Found time entries:', timeEntries.length);

    // Aggregate time by category
    const categoryTotals: Record<string, number> = {
      work: 0,
      family: 0,
      rest: 0,
      hobby: 0
    };

    console.log('Processing time entries...');
    timeEntries.forEach(entry => {
      const category = entry.categoryId.toLowerCase();
      console.log('Processing entry:', { 
        category, 
        hours: entry.hours,
        date: entry.checkIn.tsUtc 
      });
      if (category in categoryTotals) {
        categoryTotals[category] += entry.hours;
      }
    });
    
    console.log('Category totals:', categoryTotals);

    // Calculate total hours
    const totalHours = Object.values(categoryTotals).reduce((sum, hours) => sum + hours, 0);

    // Build activities array
    const activities = Object.entries(categoryTotals)
      .map(([category, hours]) => ({
        category,
        hours,
        icon: categoryIcons[category] || '📊',
        color: categoryColors[category] || '#953599'
      }))
      .filter(activity => activity.hours > 0) // Only include categories with time spent
      .sort((a, b) => b.hours - a.hours); // Sort by hours descending

    // Find most and least time spent
    let mostTimeSpent = '';
    let leastTimeSpent = '';

    if (activities.length > 0) {
      mostTimeSpent = activities[0].category;
      leastTimeSpent = activities[activities.length - 1].category;
    }

    // If we have no data, return empty state with all categories
    if (activities.length === 0 && categories.length > 0) {
      const emptyActivities = categories.map(cat => ({
        category: cat.id.toLowerCase(),
        hours: 0,
        icon: categoryIcons[cat.id.toLowerCase()] || '📊',
        color: categoryColors[cat.id.toLowerCase()] || '#953599'
      }));

      return NextResponse.json({
        activities: emptyActivities,
        totalHours: 0,
        mostTimeSpent: '',
        leastTimeSpent: ''
      });
    }

    return NextResponse.json({
      activities,
      totalHours,
      mostTimeSpent,
      leastTimeSpent
    });
  } catch (error) {
    console.error('Error fetching activity distribution:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Detailed error:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to fetch activity distribution data', details: errorMessage },
      { status: 500 }
    );
  }
}

