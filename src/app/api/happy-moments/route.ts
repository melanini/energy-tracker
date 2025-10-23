import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      // Handle JSON requests (from note-taking)
      const body = await request.json();
      const { title, note, tsUtc } = body;

      if (!title || !tsUtc) {
        return new NextResponse('Missing required fields: title and tsUtc', { status: 400 });
      }

      
      const happyMoment = await prisma.happyMoment.create({
        data: {
          userId: userId,
          title: title,
          tsUtc: new Date(tsUtc),
          note: note,
          mediaRef: null,
        },
      });

      return NextResponse.json(happyMoment);
    } else {
      // Handle form data requests (from photo capture)
      const formData = await request.formData();
      const photo = formData.get('photo') as File;
      const tsUtc = formData.get('tsUtc') as string;
      const title = formData.get('title') as string;
      const note = formData.get('note') as string;

      if (!photo || !tsUtc || !title) {
        return new NextResponse('Missing required fields: photo, title, and tsUtc', { status: 400 });
      }

      // TODO: Implement photo upload to cloud storage (e.g., S3, Cloudinary)
      // For now, we'll use a placeholder URL
      const mediaRef = 'placeholder_url';

      const happyMoment = await prisma.happyMoment.create({
        data: {
          userId: userId,
          title,
          tsUtc: new Date(tsUtc),
          note,
          mediaRef,
        },
      });

      return NextResponse.json(happyMoment);
    }
  } catch (error) {
    console.error('Error in happy-moments API:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '3');

    const happyMoments = await prisma.happyMoment.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      select: {
        id: true,
        title: true,
        note: true,
        mediaRef: true,
        createdAt: true,
      },
    });

    return NextResponse.json(happyMoments);
  } catch (error) {
    console.error('Error fetching happy moments:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}