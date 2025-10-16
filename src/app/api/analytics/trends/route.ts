import { NextResponse } from 'next/server';
import { generateTrendChart } from '@/utils/sampleData/chartData';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric') || 'physical_energy';
    const periodDays = parseInt(searchParams.get('periodDays') || '30', 10);

    const { chartData, trend_direction, summary } = generateTrendChart(metric, periodDays);

    return NextResponse.json({
      chartData,
      trend_direction,
      summary
    });
  } catch (error) {
    console.error('Error generating trend data:', error);
    return NextResponse.json(
      { error: 'Failed to generate trend data' },
      { status: 500 }
    );
  }
}
