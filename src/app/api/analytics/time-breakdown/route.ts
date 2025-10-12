import { NextResponse } from 'next/server';
import { generateTimeBreakdownChart } from '@/utils/sampleData/chartData';

export async function GET() {
  try {
    const { chartData, stats } = generateTimeBreakdownChart();

    return NextResponse.json({
      chartData,
      stats
    });
  } catch (error) {
    console.error('Error generating time breakdown data:', error);
    return NextResponse.json(
      { error: 'Failed to generate time breakdown data' },
      { status: 500 }
    );
  }
}
