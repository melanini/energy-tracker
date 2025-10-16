import { NextResponse } from 'next/server';
import { generateChartExplanation, generateDailyInsight, generateWeeklySummary } from '@/utils/openai';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, data } = body;

    let result;
    switch (type) {
      case 'chart':
        result = await generateChartExplanation(data.chartType, data.chartData);
        break;
      case 'daily':
        result = await generateDailyInsight(data.userData);
        break;
      case 'weekly':
        result = await generateWeeklySummary(data.weekData);
        break;
      default:
        return NextResponse.json({ error: 'Invalid insight type' }, { status: 400 });
    }

    return NextResponse.json({ insight: result });
  } catch (error) {
    console.error('Error generating insight:', error);
    return NextResponse.json(
      { error: 'Failed to generate insight' },
      { status: 500 }
    );
  }
}
