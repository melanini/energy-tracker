import { NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { durationMin, duration } = body;

    // Accept both durationMin (new) and duration (legacy) for backwards compatibility
    const durationValue = durationMin || duration || 25;

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

    const pomodoroSession = await prisma.pomodoroSession.create({
      data: {
        userId: userId,
        duration: durationValue,
        tsUtc: new Date(),
      },
    });

    return NextResponse.json(pomodoroSession, { status: 201 });
  } catch (error) {
    console.error("Error creating pomodoro session:", error);
    return NextResponse.json(
      { error: "Failed to create pomodoro session" },
      { status: 500 }
    );
  }
}

