import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

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

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { checkIns } = await req.json();

    // Analyze the check-in data
    const analysisPrompt = `
      Based on the following user check-in data, provide a personalized, actionable recommendation 
      to help improve their energy levels and well-being. Focus on one specific, implementable suggestion.
      Keep the response concise (max 2 sentences) and friendly.

      Check-in data:
      ${JSON.stringify(checkIns, null, 2)}

      Consider:
      - Physical energy levels
      - Cognitive energy levels
      - Mood patterns
      - Stress levels
      - Time of day patterns

      Format the response as: {insight}\n{action}
      Example: "Your energy peaks in the morning. Try scheduling your most important tasks before noon."
    `;

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an AI wellness coach specializing in energy management and productivity optimization. Provide specific, actionable advice based on user data patterns."
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const recommendation = completion.choices[0].message.content;

    return NextResponse.json({ recommendation });
  } catch (error) {
    console.error('Error generating recommendation:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

