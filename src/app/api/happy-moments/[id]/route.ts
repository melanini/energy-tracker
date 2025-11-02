import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * DELETE /api/happy-moments/[id]
 * Delete a specific happy moment by ID
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

    // Check if the happy moment exists and belongs to the user
    const existingMoment = await prisma.happyMoment.findFirst({
      where: {
        id: params.id,
        userId: userId,
      },
    });

    if (!existingMoment) {
      return new NextResponse('Happy moment not found', { status: 404 });
    }

    // TODO: If mediaRef exists, delete the file from cloud storage
    // For now, we just delete the database record

    // Delete the happy moment
    await prisma.happyMoment.delete({
      where: {
        id: params.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting happy moment:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * GET /api/happy-moments/[id]
 * Get a specific happy moment by ID
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

    const happyMoment = await prisma.happyMoment.findFirst({
      where: {
        id: params.id,
        userId: userId,
      },
    });

    if (!happyMoment) {
      return new NextResponse('Happy moment not found', { status: 404 });
    }

    return NextResponse.json(happyMoment);
  } catch (error) {
    console.error('Error fetching happy moment:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * PUT /api/happy-moments/[id]
 * Update a specific happy moment
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
    const { title, note } = body;

    // Check if the happy moment exists and belongs to the user
    const existingMoment = await prisma.happyMoment.findFirst({
      where: {
        id: params.id,
        userId: userId,
      },
    });

    if (!existingMoment) {
      return new NextResponse('Happy moment not found', { status: 404 });
    }

    // Update the happy moment
    const updatedMoment = await prisma.happyMoment.update({
      where: {
        id: params.id,
      },
      data: {
        ...(title && { title }),
        ...(note !== undefined && { note }),
      },
    });

    return NextResponse.json(updatedMoment);
  } catch (error) {
    console.error('Error updating happy moment:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

