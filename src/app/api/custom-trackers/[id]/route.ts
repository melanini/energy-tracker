import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/custom-trackers/[id]
 * Fetch a specific custom tracker by ID
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const customTracker = await prisma.customTracker.findFirst({
      where: {
        id: params.id,
        userId: userId,
      },
      include: {
        values: {
          orderBy: {
            tsUtc: 'desc',
          },
          take: 30, // Get last 30 values
        },
      },
    });

    if (!customTracker) {
      return new NextResponse('Custom tracker not found', { status: 404 });
    }

    return NextResponse.json(customTracker);
  } catch (error) {
    console.error('Error fetching custom tracker:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * PUT /api/custom-trackers/[id]
 * Update a specific custom tracker
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { label, icon, unit, unitType, maxValue } = body;

    // Check if the tracker exists and belongs to the user
    const existingTracker = await prisma.customTracker.findFirst({
      where: {
        id: params.id,
        userId: userId,
      },
    });

    if (!existingTracker) {
      return new NextResponse('Custom tracker not found', { status: 404 });
    }

    // Validate unitType if provided
    if (unitType) {
      const validUnitTypes = ['number', 'scale', 'boolean', 'string'];
      if (!validUnitTypes.includes(unitType)) {
        return new NextResponse(
          `Invalid unitType. Must be one of: ${validUnitTypes.join(', ')}`,
          { status: 400 }
        );
      }
    }

    // Update the tracker
    const updatedTracker = await prisma.customTracker.update({
      where: {
        id: params.id,
      },
      data: {
        ...(label && { label }),
        ...(icon && { icon }),
        ...(unit && { unit }),
        ...(unitType && { unitType }),
        ...(maxValue !== undefined && { maxValue }),
      },
    });

    return NextResponse.json(updatedTracker);
  } catch (error) {
    console.error('Error updating custom tracker:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * PATCH /api/custom-trackers/[id]
 * Partially update a specific custom tracker
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  // PATCH uses the same logic as PUT for this endpoint
  return PUT(request, { params });
}

/**
 * DELETE /api/custom-trackers/[id]
 * Delete a specific custom tracker
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if the tracker exists and belongs to the user
    const existingTracker = await prisma.customTracker.findFirst({
      where: {
        id: params.id,
        userId: userId,
      },
    });

    if (!existingTracker) {
      return new NextResponse('Custom tracker not found', { status: 404 });
    }

    // Delete the tracker (cascade will delete related values)
    await prisma.customTracker.delete({
      where: {
        id: params.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting custom tracker:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

