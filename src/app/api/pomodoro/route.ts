import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { duration } = body;

    const pomodoroSession = await prisma.pomodoroSession.create({
      data: {
        userId: session.user.id,
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

