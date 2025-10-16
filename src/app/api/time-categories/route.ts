import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await prisma.timeCategory.findMany({
      where: {
        isCustom: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching time categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch time categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const category = await prisma.timeCategory.create({
      data: {
        id: data.id,
        label: data.label,
        icon: data.icon,
        isCustom: true,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error creating time category:", error);
    return NextResponse.json(
      { error: "Failed to create time category" },
      { status: 500 }
    );
  }
}
