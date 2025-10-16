import { NextResponse } from 'next/server';
import { generateEnergyHistoryChart } from '@/utils/sampleData/chartData';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const metrics = searchParams.get('metrics')?.split(',') || [];

    const chartData = generateEnergyHistoryChart();
    // Filter datasets based on selected metrics
    if (metrics.length > 0) {
      chartData.datasets = chartData.datasets.filter(ds => 
        metrics.includes(ds.label.toLowerCase().replace(' ', '_'))
      );
    }

    return NextResponse.json({ chartData });
  } catch (error) {
    console.error('Error generating history data:', error);
    return NextResponse.json(
      { error: 'Failed to generate history data' },
      { status: 500 }
    );
  }
}
