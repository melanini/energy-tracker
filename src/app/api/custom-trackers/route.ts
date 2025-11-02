import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/custom-trackers
 * Fetch all custom trackers for the authenticated user
 */
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const customTrackers = await prisma.customTracker.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        id: true,
        label: true,
        icon: true,
        unit: true,
        unitType: true,
        maxValue: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(customTrackers);
  } catch (error) {
    console.error('Error fetching custom trackers:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * POST /api/custom-trackers
 * Create a new custom tracker for the authenticated user
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { label, icon, unit, unitType, maxValue } = body;

    // Validate required fields
    if (!label || !icon || !unit || !unitType) {
      return new NextResponse(
        'Missing required fields: label, icon, unit, unitType',
        { status: 400 }
      );
    }

    // Validate unitType
    const validUnitTypes = ['number', 'scale', 'boolean', 'string'];
    if (!validUnitTypes.includes(unitType)) {
      return new NextResponse(
        `Invalid unitType. Must be one of: ${validUnitTypes.join(', ')}`,
        { status: 400 }
      );
    }

    // Ensure the user exists in the database
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: null,
        name: null,
      },
    });

    // Create the custom tracker
    const customTracker = await prisma.customTracker.create({
      data: {
        userId: userId,
        label,
        icon,
        unit,
        unitType,
        maxValue: maxValue || null,
      },
    });

    return NextResponse.json(customTracker, { status: 201 });
  } catch (error) {
    console.error('Error creating custom tracker:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

