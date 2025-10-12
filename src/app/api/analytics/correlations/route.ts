import { NextResponse } from 'next/server';
import { generateCorrelationChart } from '@/utils/sampleData/chartData';
import { sampleAnalytics } from '@/utils/sampleData';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric') || 'physical_energy';

    const chartData = generateCorrelationChart(metric);
    const correlations = sampleAnalytics.correlations[metric as keyof typeof sampleAnalytics.correlations];

    return NextResponse.json({
      chartData,
      correlations
    });
  } catch (error) {
    console.error('Error generating correlation data:', error);
    return NextResponse.json(
      { error: 'Failed to generate correlation data' },
      { status: 500 }
    );
  }
}
