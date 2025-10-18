/**
 * Functional tests for analytics workflow
 */
import { NextRequest } from 'next/server'
import { GET as getDailyInsight } from '@/app/api/daily-insight/route'
import { POST as getRecommendations } from '@/app/api/recommendations/route'
import { GET as getTrends } from '@/app/api/analytics/trends/route'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import OpenAI from 'openai'
import { generateTrendChart } from '@/utils/sampleData/chartData'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    checkIn: {
      findMany: jest.fn()
    }
  }
}))

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn()
}))

jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn()
        }
      }
    }))
  }
})

jest.mock('@/utils/sampleData/chartData', () => ({
  generateTrendChart: jest.fn()
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockAuth = auth as jest.MockedFunction<typeof auth>
const mockOpenAI = OpenAI as jest.MockedClass<typeof OpenAI>
const mockGenerateTrendChart = generateTrendChart as jest.MockedFunction<typeof generateTrendChart>

describe('Analytics Workflow', () => {
  let mockOpenAIInstance: any

  beforeEach(() => {
    jest.clearAllMocks()
    mockOpenAIInstance = {
      chat: {
        completions: {
          create: jest.fn()
        }
      }
    }
    mockOpenAI.mockImplementation(() => mockOpenAIInstance)
  })

  describe('Complete Analytics Flow', () => {
    it('should handle complete analytics workflow for user with data', async () => {
      const mockUserId = 'user-123'
      mockAuth.mockResolvedValue({ userId: mockUserId })

      // Mock check-in data for the last 14 days
      const mockCheckIns = [
        {
          id: 'checkin-1',
          userId: mockUserId,
          tsUtc: new Date('2024-01-01T08:00:00Z'),
          physical17: 7,
          cognitive17: 6,
          mood17: 5,
          stress17: 3
        },
        {
          id: 'checkin-2',
          userId: mockUserId,
          tsUtc: new Date('2024-01-02T08:00:00Z'),
          physical17: 6,
          cognitive17: 7,
          mood17: 6,
          stress17: 2
        },
        {
          id: 'checkin-3',
          userId: mockUserId,
          tsUtc: new Date('2024-01-03T08:00:00Z'),
          physical17: 8,
          cognitive17: 5,
          mood17: 7,
          stress17: 1
        }
      ]

      mockPrisma.checkIn.findMany.mockResolvedValue(mockCheckIns)

      // Step 1: Get daily insight
      const mockInsightResponse = {
        choices: [{
          message: {
            function_call: {
              name: 'generate_insight',
              arguments: JSON.stringify({
                text: 'Your energy levels are consistently high in the morning',
                explanation: 'Based on your tracking data, you show peak physical energy between 8-10 AM',
                confidence: 0.85
              })
            }
          }
        }]
      }

      mockOpenAIInstance.chat.completions.create.mockResolvedValue(mockInsightResponse)

      const insightRequest = new NextRequest('http://localhost:3000/api/daily-insight')
      const insightResponse = await getDailyInsight(insightRequest)
      const insightData = await insightResponse.json()

      expect(insightResponse.status).toBe(200)
      expect(insightData.text).toBe('Your energy levels are consistently high in the morning')
      expect(insightData.confidence).toBe(0.85)

      // Step 2: Get recommendations
      const mockRecommendationResponse = {
        choices: [{
          message: {
            content: 'Schedule your most demanding tasks in the morning when your energy is highest.'
          }
        }]
      }

      mockOpenAIInstance.chat.completions.create.mockResolvedValue(mockRecommendationResponse)

      const recommendationRequest = new NextRequest('http://localhost:3000/api/recommendations', {
        method: 'POST',
        body: JSON.stringify({ checkIns: mockCheckIns }),
        headers: { 'Content-Type': 'application/json' }
      })

      const recommendationResponse = await getRecommendations(recommendationRequest)
      const recommendationData = await recommendationResponse.json()

      expect(recommendationResponse.status).toBe(200)
      expect(recommendationData.recommendation).toBe('Schedule your most demanding tasks in the morning when your energy is highest.')

      // Step 3: Get trend analysis
      const mockTrendData = {
        chartData: [
          { date: '2024-01-01', value: 7 },
          { date: '2024-01-02', value: 6 },
          { date: '2024-01-03', value: 8 }
        ],
        trend_direction: 'upward',
        summary: 'Your physical energy is trending upward over the past 30 days'
      }

      mockGenerateTrendChart.mockReturnValue(mockTrendData)

      const trendRequest = new NextRequest('http://localhost:3000/api/analytics/trends?metric=physical_energy&periodDays=30')
      const trendResponse = await getTrends(trendRequest)
      const trendData = await trendResponse.json()

      expect(trendResponse.status).toBe(200)
      expect(trendData.trend_direction).toBe('upward')
      expect(trendData.chartData).toHaveLength(3)

      // Verify the complete workflow
      expect(mockPrisma.checkIn.findMany).toHaveBeenCalledTimes(1)
      expect(mockOpenAIInstance.chat.completions.create).toHaveBeenCalledTimes(2)
      expect(mockGenerateTrendChart).toHaveBeenCalledWith('physical_energy', 30)
    })

    it('should handle analytics workflow for user with no data', async () => {
      const mockUserId = 'user-123'
      mockAuth.mockResolvedValue({ userId: mockUserId })

      // Mock empty check-ins
      mockPrisma.checkIn.findMany.mockResolvedValue([])

      // Step 1: Get daily insight (should return default message)
      const insightRequest = new NextRequest('http://localhost:3000/api/daily-insight')
      const insightResponse = await getDailyInsight(insightRequest)
      const insightData = await insightResponse.json()

      expect(insightResponse.status).toBe(200)
      expect(insightData.text).toBe("Start tracking your energy to get personalized insights!")
      expect(insightData.explanation).toBe("We'll analyze your patterns once you have some data.")

      // Step 2: Get recommendations with empty data
      const mockRecommendationResponse = {
        choices: [{
          message: {
            content: 'Start tracking your energy to get personalized recommendations!'
          }
        }]
      }

      mockOpenAIInstance.chat.completions.create.mockResolvedValue(mockRecommendationResponse)

      const recommendationRequest = new NextRequest('http://localhost:3000/api/recommendations', {
        method: 'POST',
        body: JSON.stringify({ checkIns: [] }),
        headers: { 'Content-Type': 'application/json' }
      })

      const recommendationResponse = await getRecommendations(recommendationRequest)
      const recommendationData = await recommendationResponse.json()

      expect(recommendationResponse.status).toBe(200)
      expect(recommendationData.recommendation).toBe('Start tracking your energy to get personalized recommendations!')

      // Step 3: Get trend analysis (should still work with sample data)
      const mockTrendData = {
        chartData: [],
        trend_direction: 'stable',
        summary: 'No data available for trend analysis'
      }

      mockGenerateTrendChart.mockReturnValue(mockTrendData)

      const trendRequest = new NextRequest('http://localhost:3000/api/analytics/trends')
      const trendResponse = await getTrends(trendRequest)
      const trendData = await trendResponse.json()

      expect(trendResponse.status).toBe(200)
      expect(trendData.trend_direction).toBe('stable')
      expect(trendData.chartData).toHaveLength(0)
    })

    it('should handle analytics workflow with different metrics', async () => {
      const mockUserId = 'user-123'
      mockAuth.mockResolvedValue({ userId: mockUserId })

      const mockCheckIns = [
        {
          id: 'checkin-1',
          userId: mockUserId,
          tsUtc: new Date('2024-01-01T08:00:00Z'),
          physical17: 5,
          cognitive17: 8,
          mood17: 6,
          stress17: 2
        }
      ]

      mockPrisma.checkIn.findMany.mockResolvedValue(mockCheckIns)

      // Test different metrics for trend analysis
      const metrics = ['cognitive_clarity', 'mood', 'stress']
      const mockTrendData = {
        chartData: [{ date: '2024-01-01', value: 5 }],
        trend_direction: 'stable',
        summary: 'Metric is stable'
      }

      for (const metric of metrics) {
        mockGenerateTrendChart.mockReturnValue(mockTrendData)

        const trendRequest = new NextRequest(`http://localhost:3000/api/analytics/trends?metric=${metric}`)
        const trendResponse = await getTrends(trendRequest)
        const trendData = await trendResponse.json()

        expect(trendResponse.status).toBe(200)
        expect(mockGenerateTrendChart).toHaveBeenCalledWith(metric, 30)
      }
    })

    it('should handle analytics workflow with different time periods', async () => {
      const mockUserId = 'user-123'
      mockAuth.mockResolvedValue({ userId: mockUserId })

      const mockCheckIns = [
        {
          id: 'checkin-1',
          userId: mockUserId,
          tsUtc: new Date('2024-01-01T08:00:00Z'),
          physical17: 7,
          cognitive17: 6,
          mood17: 5,
          stress17: 3
        }
      ]

      mockPrisma.checkIn.findMany.mockResolvedValue(mockCheckIns)

      // Test different time periods
      const periods = [7, 14, 30, 90, 365]
      const mockTrendData = {
        chartData: [{ date: '2024-01-01', value: 7 }],
        trend_direction: 'upward',
        summary: 'Energy trending upward'
      }

      for (const period of periods) {
        mockGenerateTrendChart.mockReturnValue(mockTrendData)

        const trendRequest = new NextRequest(`http://localhost:3000/api/analytics/trends?periodDays=${period}`)
        const trendResponse = await getTrends(trendRequest)
        const trendData = await trendResponse.json()

        expect(trendResponse.status).toBe(200)
        expect(mockGenerateTrendChart).toHaveBeenCalledWith('physical_energy', period)
      }
    })

    it('should handle analytics workflow with error scenarios', async () => {
      const mockUserId = 'user-123'
      mockAuth.mockResolvedValue({ userId: mockUserId })

      // Test OpenAI API error in daily insight
      mockPrisma.checkIn.findMany.mockResolvedValue([
        {
          id: 'checkin-1',
          userId: mockUserId,
          tsUtc: new Date('2024-01-01T08:00:00Z'),
          physical17: 7,
          cognitive17: 6,
          mood17: 5,
          stress17: 3
        }
      ])

      mockOpenAIInstance.chat.completions.create.mockRejectedValue(new Error('OpenAI API Error'))

      const insightRequest = new NextRequest('http://localhost:3000/api/daily-insight')
      const insightResponse = await getDailyInsight(insightRequest)

      expect(insightResponse.status).toBe(500)

      // Test OpenAI API error in recommendations
      const recommendationRequest = new NextRequest('http://localhost:3000/api/recommendations', {
        method: 'POST',
        body: JSON.stringify({ checkIns: [] }),
        headers: { 'Content-Type': 'application/json' }
      })

      const recommendationResponse = await getRecommendations(recommendationRequest)

      expect(recommendationResponse.status).toBe(500)

      // Test trend chart generation error
      mockGenerateTrendChart.mockImplementation(() => {
        throw new Error('Chart generation failed')
      })

      const trendRequest = new NextRequest('http://localhost:3000/api/analytics/trends')
      const trendResponse = await getTrends(trendRequest)

      expect(trendResponse.status).toBe(500)
    })

    it('should handle analytics workflow with guest user', async () => {
      mockAuth.mockResolvedValue({ userId: null })

      // Mock guest check-ins
      const mockCheckIns = [
        {
          id: 'checkin-guest',
          userId: null,
          tsUtc: new Date('2024-01-01T08:00:00Z'),
          physical17: 7,
          cognitive17: 6,
          mood17: 5,
          stress17: 3
        }
      ]

      mockPrisma.checkIn.findMany.mockResolvedValue(mockCheckIns)

      // Daily insight should work for guest
      const mockInsightResponse = {
        choices: [{
          message: {
            function_call: {
              name: 'generate_insight',
              arguments: JSON.stringify({
                text: 'Guest insight',
                explanation: 'Guest explanation',
                confidence: 0.7
              })
            }
          }
        }]
      }

      mockOpenAIInstance.chat.completions.create.mockResolvedValue(mockInsightResponse)

      const insightRequest = new NextRequest('http://localhost:3000/api/daily-insight')
      const insightResponse = await getDailyInsight(insightRequest)
      const insightData = await insightResponse.json()

      expect(insightResponse.status).toBe(200)
      expect(insightData.text).toBe('Guest insight')

      // Recommendations should fail for guest (requires authentication)
      const recommendationRequest = new NextRequest('http://localhost:3000/api/recommendations', {
        method: 'POST',
        body: JSON.stringify({ checkIns: mockCheckIns }),
        headers: { 'Content-Type': 'application/json' }
      })

      const recommendationResponse = await getRecommendations(recommendationRequest)

      expect(recommendationResponse.status).toBe(401)

      // Trend analysis should work for guest (uses sample data)
      const mockTrendData = {
        chartData: [{ date: '2024-01-01', value: 7 }],
        trend_direction: 'stable',
        summary: 'Guest trend analysis'
      }

      mockGenerateTrendChart.mockReturnValue(mockTrendData)

      const trendRequest = new NextRequest('http://localhost:3000/api/analytics/trends')
      const trendResponse = await getTrends(trendRequest)
      const trendData = await trendResponse.json()

      expect(trendResponse.status).toBe(200)
      expect(trendData.summary).toBe('Guest trend analysis')
    })
  })
})
