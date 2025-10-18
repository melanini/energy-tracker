/**
 * Unit tests for daily-insight API route
 */
import { NextRequest } from 'next/server'
import { GET } from '@/app/api/daily-insight/route'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import OpenAI from 'openai'

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

const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockAuth = auth as jest.MockedFunction<typeof auth>
const mockOpenAI = OpenAI as jest.MockedClass<typeof OpenAI>

describe('/api/daily-insight', () => {
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

  describe('GET /api/daily-insight', () => {
    it('should return cached insight for same day', async () => {
      const mockUserId = 'user-123'
      mockAuth.mockResolvedValue({ userId: mockUserId })

      // First call to populate cache
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

      const mockAIResponse = {
        choices: [{
          message: {
            function_call: {
              name: 'generate_insight',
              arguments: JSON.stringify({
                text: 'Test insight',
                explanation: 'Test explanation',
                confidence: 0.8
              })
            }
          }
        }]
      }

      mockPrisma.checkIn.findMany.mockResolvedValue(mockCheckIns)
      mockOpenAIInstance.chat.completions.create.mockResolvedValue(mockAIResponse)

      const request = new NextRequest('http://localhost:3000/api/daily-insight')
      const response1 = await GET(request)
      const data1 = await response1.json()

      // Second call should return cached result
      const response2 = await GET(request)
      const data2 = await response2.json()

      expect(response1.status).toBe(200)
      expect(response2.status).toBe(200)
      expect(data1).toEqual(data2)
      // OpenAI should only be called once due to caching
      expect(mockOpenAIInstance.chat.completions.create).toHaveBeenCalledTimes(1)
    })

    it('should generate insight for authenticated user with data', async () => {
      const mockUserId = 'user-123'
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
          tsUtc: new Date('2024-01-01T14:00:00Z'),
          physical17: 5,
          cognitive17: 7,
          mood17: 6,
          stress17: 2
        }
      ]

      const mockAIResponse = {
        choices: [{
          message: {
            function_call: {
              name: 'generate_insight',
              arguments: JSON.stringify({
                text: 'Your energy peaks in the morning',
                explanation: 'Based on your data, you show higher physical energy in the morning hours',
                confidence: 0.85
              })
            }
          }
        }]
      }

      mockAuth.mockResolvedValue({ userId: mockUserId })
      mockPrisma.checkIn.findMany.mockResolvedValue(mockCheckIns)
      mockOpenAIInstance.chat.completions.create.mockResolvedValue(mockAIResponse)

      const request = new NextRequest('http://localhost:3000/api/daily-insight')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        text: 'Your energy peaks in the morning',
        explanation: 'Based on your data, you show higher physical energy in the morning hours',
        confidence: 0.85,
        generatedAt: expect.any(String)
      })

      expect(mockPrisma.checkIn.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          tsUtc: {
            gte: expect.any(Date)
          }
        },
        orderBy: {
          tsUtc: 'desc'
        }
      })
    })

    it('should generate insight for guest user', async () => {
      const mockCheckIns = [
        {
          id: 'checkin-1',
          userId: null,
          tsUtc: new Date('2024-01-01T08:00:00Z'),
          physical17: 7,
          cognitive17: 6,
          mood17: 5,
          stress17: 3
        }
      ]

      const mockAIResponse = {
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

      mockAuth.mockResolvedValue({ userId: null })
      mockPrisma.checkIn.findMany.mockResolvedValue(mockCheckIns)
      mockOpenAIInstance.chat.completions.create.mockResolvedValue(mockAIResponse)

      const request = new NextRequest('http://localhost:3000/api/daily-insight')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.text).toBe('Guest insight')

      expect(mockPrisma.checkIn.findMany).toHaveBeenCalledWith({
        where: {
          tsUtc: {
            gte: expect.any(Date)
          }
        },
        orderBy: {
          tsUtc: 'desc'
        }
      })
    })

    it('should return default message for no data', async () => {
      mockAuth.mockResolvedValue({ userId: 'user-123' })
      mockPrisma.checkIn.findMany.mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/daily-insight')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        text: "Start tracking your energy to get personalized insights!",
        explanation: "We'll analyze your patterns once you have some data.",
        confidence: 0.5,
        generatedAt: expect.any(String)
      })

      expect(mockOpenAIInstance.chat.completions.create).not.toHaveBeenCalled()
    })

    it('should handle OpenAI API errors', async () => {
      const mockUserId = 'user-123'
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

      mockAuth.mockResolvedValue({ userId: mockUserId })
      mockPrisma.checkIn.findMany.mockResolvedValue(mockCheckIns)
      mockOpenAIInstance.chat.completions.create.mockRejectedValue(new Error('OpenAI API Error'))

      const request = new NextRequest('http://localhost:3000/api/daily-insight')
      const response = await GET(request)

      expect(response.status).toBe(500)
      expect(await response.text()).toBe('Internal Server Error')
    })

    it('should handle missing function call in OpenAI response', async () => {
      const mockUserId = 'user-123'
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

      const mockAIResponse = {
        choices: [{
          message: {
            // Missing function_call
          }
        }]
      }

      mockAuth.mockResolvedValue({ userId: mockUserId })
      mockPrisma.checkIn.findMany.mockResolvedValue(mockCheckIns)
      mockOpenAIInstance.chat.completions.create.mockResolvedValue(mockAIResponse)

      const request = new NextRequest('http://localhost:3000/api/daily-insight')
      const response = await GET(request)

      expect(response.status).toBe(500)
      expect(await response.text()).toBe('Internal Server Error')
    })

    it('should handle invalid JSON in function call arguments', async () => {
      const mockUserId = 'user-123'
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

      const mockAIResponse = {
        choices: [{
          message: {
            function_call: {
              name: 'generate_insight',
              arguments: 'invalid json'
            }
          }
        }]
      }

      mockAuth.mockResolvedValue({ userId: mockUserId })
      mockPrisma.checkIn.findMany.mockResolvedValue(mockCheckIns)
      mockOpenAIInstance.chat.completions.create.mockResolvedValue(mockAIResponse)

      const request = new NextRequest('http://localhost:3000/api/daily-insight')
      const response = await GET(request)

      expect(response.status).toBe(500)
      expect(await response.text()).toBe('Internal Server Error')
    })

    it('should handle database errors', async () => {
      mockAuth.mockResolvedValue({ userId: 'user-123' })
      mockPrisma.checkIn.findMany.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/daily-insight')
      const response = await GET(request)

      expect(response.status).toBe(500)
      expect(await response.text()).toBe('Internal Server Error')
    })

    it('should handle missing OpenAI API key', async () => {
      // Mock environment variable not set
      const originalEnv = process.env.OPENAI_API_KEY
      delete process.env.OPENAI_API_KEY

      mockAuth.mockResolvedValue({ userId: 'user-123' })
      mockPrisma.checkIn.findMany.mockResolvedValue([
        {
          id: 'checkin-1',
          userId: 'user-123',
          tsUtc: new Date('2024-01-01T08:00:00Z'),
          physical17: 7,
          cognitive17: 6,
          mood17: 5,
          stress17: 3
        }
      ])

      const request = new NextRequest('http://localhost:3000/api/daily-insight')
      const response = await GET(request)

      expect(response.status).toBe(500)
      expect(await response.text()).toBe('Internal Server Error')

      // Restore environment variable
      process.env.OPENAI_API_KEY = originalEnv
    })

    it('should call OpenAI with correct parameters', async () => {
      const mockUserId = 'user-123'
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

      const mockAIResponse = {
        choices: [{
          message: {
            function_call: {
              name: 'generate_insight',
              arguments: JSON.stringify({
                text: 'Test insight',
                explanation: 'Test explanation',
                confidence: 0.8
              })
            }
          }
        }]
      }

      mockAuth.mockResolvedValue({ userId: mockUserId })
      mockPrisma.checkIn.findMany.mockResolvedValue(mockCheckIns)
      mockOpenAIInstance.chat.completions.create.mockResolvedValue(mockAIResponse)

      const request = new NextRequest('http://localhost:3000/api/daily-insight')
      await GET(request)

      expect(mockOpenAIInstance.chat.completions.create).toHaveBeenCalledWith({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are an AI analyzing user's energy, mood, and stress data to provide helpful insights. Focus on patterns, trends, and actionable recommendations. Keep responses concise and practical."
          },
          {
            role: "user",
            content: expect.stringContaining('Here is the user\'s data from the last 14 days')
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
      })
    })
  })
})
