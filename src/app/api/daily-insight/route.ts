import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

// Lazy initialization of OpenAI client
let openaiClient: OpenAI | null = null;

function getOpenAIClient() {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

// Cache key format: userId:date
const insightCache = new Map<string, { text: string; explanation: string; confidence: number; generatedAt: Date }>();

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    const userIdString = userId || 'guest';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cacheKey = `${userIdString}:${today.toISOString()}`;

    // Check cache first
    const cachedInsight = insightCache.get(cacheKey);
    if (cachedInsight) {
      return NextResponse.json(cachedInsight);
    }

    // Build where clause
    const whereClause: any = {
      tsUtc: {
        gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      },
    };

    // If authenticated, filter by userId
    if (userId) {
      whereClause.userId = userId;
    }

    // Get check-ins from the last 14 days
    const checkIns = await prisma.checkIn.findMany({
      where: whereClause,
      orderBy: {
        tsUtc: 'desc',
      },
    });

    if (checkIns.length === 0) {
      return NextResponse.json({
        text: "Start tracking your energy to get personalized insights!",
        explanation: "We'll analyze your patterns once you have some data.",
        confidence: 0.5,
        generatedAt: new Date(),
      });
    }

    // Prepare data for OpenAI
    const checkInData = checkIns.map(ci => ({
      timestamp: ci.tsUtc,
      physical: ci.physical17,
      cognitive: ci.cognitive17,
      mood: ci.mood17,
      stress: ci.stress17,
    }));

    // Generate insight using OpenAI
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an AI analyzing user's energy, mood, and stress data to provide helpful insights. Focus on patterns, trends, and actionable recommendations. Keep responses concise and practical."
        },
        {
          role: "user",
          content: `Here is the user's data from the last 14 days: ${JSON.stringify(checkInData)}. Generate a concise insight with an explanation. Focus on patterns that could help the user optimize their day.`
        }
      ],
      functions: [
        {
          name: "generate_insight",
          parameters: {
            type: "object",
            properties: {
              text: {
                type: "string",
                description: "The main insight message (1-2 sentences)"
              },
              explanation: {
                type: "string",
                description: "Detailed explanation of the insight (2-3 sentences)"
              },
              confidence: {
                type: "number",
                description: "Confidence score between 0 and 1"
              }
            },
            required: ["text", "explanation", "confidence"]
          }
        }
      ],
      function_call: { name: "generate_insight" }
    });

    const functionCall = completion.choices[0].message.function_call;
    if (!functionCall || !functionCall.arguments) {
      throw new Error('Failed to generate insight');
    }

    const insight = JSON.parse(functionCall.arguments);
    insight.generatedAt = new Date();

    // Cache the insight
    insightCache.set(cacheKey, insight);

    return NextResponse.json(insight);
  } catch (error) {
    console.error('Error generating daily insight:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
