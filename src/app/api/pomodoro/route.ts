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
    const { duration } = body;

    const pomodoroSession = await prisma.pomodoroSession.create({
      data: {
        userId: userId,
        duration: duration || 25,
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

