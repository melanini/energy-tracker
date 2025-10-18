/**
 * Unit tests for analytics trends API route
 */
import { NextRequest } from 'next/server'
import { GET } from '@/app/api/analytics/trends/route'
import { generateTrendChart } from '@/utils/sampleData/chartData'

// Mock dependencies
jest.mock('@/utils/sampleData/chartData', () => ({
  generateTrendChart: jest.fn()
}))

const mockGenerateTrendChart = generateTrendChart as jest.MockedFunction<typeof generateTrendChart>

describe('/api/analytics/trends', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/analytics/trends', () => {
    it('should return trend data with default parameters', async () => {
      const mockTrendData = {
        chartData: [
          { date: '2024-01-01', value: 7 },
          { date: '2024-01-02', value: 6 },
          { date: '2024-01-03', value: 8 }
        ],
        trend_direction: 'upward',
        summary: 'Energy levels are trending upward over the past 30 days'
      }

      mockGenerateTrendChart.mockReturnValue(mockTrendData)

      const request = new NextRequest('http://localhost:3000/api/analytics/trends')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockTrendData)
      expect(mockGenerateTrendChart).toHaveBeenCalledWith('physical_energy', 30)
    })

    it('should return trend data with custom metric', async () => {
      const mockTrendData = {
        chartData: [
          { date: '2024-01-01', value: 5 },
          { date: '2024-01-02', value: 6 },
          { date: '2024-01-03', value: 7 }
        ],
        trend_direction: 'upward',
        summary: 'Cognitive clarity is trending upward'
      }

      mockGenerateTrendChart.mockReturnValue(mockTrendData)

      const request = new NextRequest('http://localhost:3000/api/analytics/trends?metric=cognitive_clarity')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockTrendData)
      expect(mockGenerateTrendChart).toHaveBeenCalledWith('cognitive_clarity', 30)
    })

    it('should return trend data with custom period', async () => {
      const mockTrendData = {
        chartData: [
          { date: '2024-01-01', value: 7 },
          { date: '2024-01-02', value: 6 }
        ],
        trend_direction: 'downward',
        summary: 'Energy levels are trending downward over the past 7 days'
      }

      mockGenerateTrendChart.mockReturnValue(mockTrendData)

      const request = new NextRequest('http://localhost:3000/api/analytics/trends?periodDays=7')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockTrendData)
      expect(mockGenerateTrendChart).toHaveBeenCalledWith('physical_energy', 7)
    })

    it('should return trend data with both custom metric and period', async () => {
      const mockTrendData = {
        chartData: [
          { date: '2024-01-01', value: 3 },
          { date: '2024-01-02', value: 2 }
        ],
        trend_direction: 'downward',
        summary: 'Stress levels are trending downward over the past 14 days'
      }

      mockGenerateTrendChart.mockReturnValue(mockTrendData)

      const request = new NextRequest('http://localhost:3000/api/analytics/trends?metric=stress&periodDays=14')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockTrendData)
      expect(mockGenerateTrendChart).toHaveBeenCalledWith('stress', 14)
    })

    it('should handle invalid periodDays parameter', async () => {
      const mockTrendData = {
        chartData: [],
        trend_direction: 'stable',
        summary: 'No data available'
      }

      mockGenerateTrendChart.mockReturnValue(mockTrendData)

      const request = new NextRequest('http://localhost:3000/api/analytics/trends?periodDays=invalid')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockTrendData)
      expect(mockGenerateTrendChart).toHaveBeenCalledWith('physical_energy', 30)
    })

    it('should handle negative periodDays parameter', async () => {
      const mockTrendData = {
        chartData: [],
        trend_direction: 'stable',
        summary: 'No data available'
      }

      mockGenerateTrendChart.mockReturnValue(mockTrendData)

      const request = new NextRequest('http://localhost:3000/api/analytics/trends?periodDays=-5')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockTrendData)
      expect(mockGenerateTrendChart).toHaveBeenCalledWith('physical_energy', 30)
    })

    it('should handle zero periodDays parameter', async () => {
      const mockTrendData = {
        chartData: [],
        trend_direction: 'stable',
        summary: 'No data available'
      }

      mockGenerateTrendChart.mockReturnValue(mockTrendData)

      const request = new NextRequest('http://localhost:3000/api/analytics/trends?periodDays=0')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockTrendData)
      expect(mockGenerateTrendChart).toHaveBeenCalledWith('physical_energy', 30)
    })

    it('should handle very large periodDays parameter', async () => {
      const mockTrendData = {
        chartData: Array.from({ length: 365 }, (_, i) => ({
          date: `2024-01-${String(i + 1).padStart(2, '0')}`,
          value: Math.floor(Math.random() * 7) + 1
        })),
        trend_direction: 'stable',
        summary: 'Energy levels are stable over the past year'
      }

      mockGenerateTrendChart.mockReturnValue(mockTrendData)

      const request = new NextRequest('http://localhost:3000/api/analytics/trends?periodDays=365')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockTrendData)
      expect(mockGenerateTrendChart).toHaveBeenCalledWith('physical_energy', 365)
    })

    it('should handle empty metric parameter', async () => {
      const mockTrendData = {
        chartData: [
          { date: '2024-01-01', value: 7 },
          { date: '2024-01-02', value: 6 }
        ],
        trend_direction: 'upward',
        summary: 'Energy levels are trending upward'
      }

      mockGenerateTrendChart.mockReturnValue(mockTrendData)

      const request = new NextRequest('http://localhost:3000/api/analytics/trends?metric=')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockTrendData)
      expect(mockGenerateTrendChart).toHaveBeenCalledWith('physical_energy', 30)
    })

    it('should handle special characters in metric parameter', async () => {
      const mockTrendData = {
        chartData: [],
        trend_direction: 'stable',
        summary: 'Invalid metric provided'
      }

      mockGenerateTrendChart.mockReturnValue(mockTrendData)

      const request = new NextRequest('http://localhost:3000/api/analytics/trends?metric=invalid@metric#name')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockTrendData)
      expect(mockGenerateTrendChart).toHaveBeenCalledWith('invalid@metric#name', 30)
    })

    it('should handle multiple query parameters', async () => {
      const mockTrendData = {
        chartData: [
          { date: '2024-01-01', value: 5 },
          { date: '2024-01-02', value: 6 }
        ],
        trend_direction: 'upward',
        summary: 'Mood is trending upward over the past 7 days'
      }

      mockGenerateTrendChart.mockReturnValue(mockTrendData)

      const request = new NextRequest('http://localhost:3000/api/analytics/trends?metric=mood&periodDays=7&extra=param')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockTrendData)
      expect(mockGenerateTrendChart).toHaveBeenCalledWith('mood', 7)
    })

    it('should handle generateTrendChart errors', async () => {
      mockGenerateTrendChart.mockImplementation(() => {
        throw new Error('Chart generation failed')
      })

      const request = new NextRequest('http://localhost:3000/api/analytics/trends')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to generate trend data' })
    })

    it('should handle generateTrendChart returning null', async () => {
      mockGenerateTrendChart.mockReturnValue(null as any)

      const request = new NextRequest('http://localhost:3000/api/analytics/trends')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toBeNull()
    })

    it('should handle generateTrendChart returning undefined', async () => {
      mockGenerateTrendChart.mockReturnValue(undefined as any)

      const request = new NextRequest('http://localhost:3000/api/analytics/trends')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toBeUndefined()
    })

    it('should handle malformed URL', async () => {
      const mockTrendData = {
        chartData: [],
        trend_direction: 'stable',
        summary: 'No data available'
      }

      mockGenerateTrendChart.mockReturnValue(mockTrendData)

      // This should still work as URL constructor handles malformed URLs
      const request = new NextRequest('http://localhost:3000/api/analytics/trends?invalid=url&with=spaces')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockTrendData)
    })
  })
})
