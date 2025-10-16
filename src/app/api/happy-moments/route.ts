import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await request.formData();
    const photo = formData.get('photo') as File;
    const tsUtc = formData.get('tsUtc') as string;
    const note = formData.get('note') as string;

    if (!photo || !tsUtc) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // TODO: Implement photo upload to cloud storage (e.g., S3, Cloudinary)
    // For now, we'll use a placeholder URL
    const mediaRef = 'placeholder_url';

    const happyMoment = await prisma.happyMoment.create({
      data: {
        userId: session.user.id,
        tsUtc: new Date(tsUtc),
        note,
        mediaRef,
      },
    });

    return NextResponse.json(happyMoment);
  } catch (error) {
    console.error('Error in happy-moments API:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}