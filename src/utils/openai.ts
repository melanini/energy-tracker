import OpenAI from 'openai';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // In development, we'll allow browser usage. For production, you should use API routes.
  dangerouslyAllowBrowser: process.env.NEXT_PUBLIC_APP_ENV === 'development'
});

export async function generateInsight(prompt: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert in analyzing energy and wellness data. Provide clear, actionable insights in a friendly, encouraging tone. Keep explanations to 2-3 sentences."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gpt-3.5-turbo",
    });

    return completion.choices[0].message.content || "Unable to generate insight.";
  } catch (error) {
    console.error('Error generating insight:', error);
    return "Unable to generate insight at this time.";
  }
}

export async function generateChartExplanation(
  chartType: 'history' | 'correlation' | 'timeBreakdown' | 'summary',
  data: any
): Promise<string> {
  const prompts = {
    history: `Given this energy tracking data, provide a brief, insightful explanation of the patterns shown in the history chart. Focus on trends, notable changes, and potential insights. Data: ${JSON.stringify(data)}`,
    correlation: `Analyze these correlation patterns between different energy metrics and provide a clear, concise explanation of what they mean for the user's well-being. Data: ${JSON.stringify(data)}`,
    timeBreakdown: `Looking at this time-of-day energy breakdown, explain what it reveals about the user's daily energy patterns and potential optimization opportunities. Data: ${JSON.stringify(data)}`,
    summary: `Based on these summary metrics, provide a concise interpretation of what they indicate about the user's overall energy management and achievements. Data: ${JSON.stringify(data)}`
  };

  return generateInsight(prompts[chartType]);
}

// Example usage of the API for other features:
export async function generateDailyInsight(userData: any): Promise<string> {
  const prompt = `Based on this user's energy data for today, provide a personalized insight or suggestion: ${JSON.stringify(userData)}`;
  return generateInsight(prompt);
}

export async function generateWeeklySummary(weekData: any): Promise<string> {
  const prompt = `Looking at this week's energy patterns, provide a brief summary of key trends and achievements: ${JSON.stringify(weekData)}`;
  return generateInsight(prompt);
}
