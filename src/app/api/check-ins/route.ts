import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth';
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    // If no date provided, return today's check-ins
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Build where clause based on authentication status
    const whereClause: any = {
      tsUtc: {
        gte: startOfDay,
        lte: endOfDay,
      },
    };

    // If authenticated, filter by userId
    if (session?.user?.id) {
      whereClause.userId = session.user.id;
    }

    const checkIns = await prisma.checkIn.findMany({
      where: whereClause,
      include: {
        timeEntries: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        tsUtc: 'asc',
      },
    });

    return NextResponse.json(checkIns);
  } catch (error) {
    console.error("Error fetching check-ins:", error);
    return NextResponse.json(
      { error: "Failed to fetch check-ins" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    const data = await request.json();
    const { timeEntries = [], ...checkInData } = data;

    // Create check-in data with userId if authenticated
    const checkInCreateData: any = {
      ...checkInData,
      tsUtc: new Date(),
      note: checkInData.note || "",
      timeEntries: {
        create: timeEntries.map((entry: any) => ({
          hours: entry.hours,
          categoryId: entry.categoryId,
        })),
      },
    };

    // Add userId if user is authenticated
    if (session?.user?.id) {
      checkInCreateData.userId = session.user.id;
    }

    const checkIn = await prisma.checkIn.create({
      data: checkInCreateData,
      include: {
        timeEntries: {
          include: {
            category: true,
          },
        },
      },
    });

    return NextResponse.json(checkIn);
  } catch (error) {
    console.error("Error creating check-in:", error);
    return NextResponse.json(
      { error: "Failed to create check-in" },
      { status: 500 }
    );
  }
}