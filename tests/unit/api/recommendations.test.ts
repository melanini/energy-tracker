/**
 * Unit tests for recommendations API route
 */
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/recommendations/route'
import { auth } from '@clerk/nextjs/server'
import OpenAI from 'openai'

// Mock dependencies
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

const mockAuth = auth as jest.MockedFunction<typeof auth>
const mockOpenAI = OpenAI as jest.MockedClass<typeof OpenAI>

describe('/api/recommendations', () => {
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

  describe('POST /api/recommendations', () => {
    it('should generate recommendation for authenticated user', async () => {
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
            content: 'Your energy peaks in the morning. Try scheduling your most important tasks before noon.'
          }
        }]
      }

      mockAuth.mockResolvedValue({ userId: mockUserId })
      mockOpenAIInstance.chat.completions.create.mockResolvedValue(mockAIResponse)

      const request = new NextRequest('http://localhost:3000/api/recommendations', {
        method: 'POST',
        body: JSON.stringify({ checkIns: mockCheckIns }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        recommendation: 'Your energy peaks in the morning. Try scheduling your most important tasks before noon.'
      })

      expect(mockOpenAIInstance.chat.completions.create).toHaveBeenCalledWith({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are an AI wellness coach specializing in energy management and productivity optimization. Provide specific, actionable advice based on user data patterns."
          },
          {
            role: "user",
            content: expect.stringContaining('Based on the following user check-in data')
          }
        ],
        temperature: 0.7,
        max_tokens: 150
      })
    })

    it('should return 401 for unauthenticated user', async () => {
      mockAuth.mockResolvedValue({ userId: null })

      const request = new NextRequest('http://localhost:3000/api/recommendations', {
        method: 'POST',
        body: JSON.stringify({ checkIns: [] }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)

      expect(response.status).toBe(401)
      expect(await response.text()).toBe('Unauthorized')
      expect(mockOpenAIInstance.chat.completions.create).not.toHaveBeenCalled()
    })

    it('should handle empty check-ins array', async () => {
      const mockUserId = 'user-123'
      const mockAIResponse = {
        choices: [{
          message: {
            content: 'Start tracking your energy to get personalized recommendations!'
          }
        }]
      }

      mockAuth.mockResolvedValue({ userId: mockUserId })
      mockOpenAIInstance.chat.completions.create.mockResolvedValue(mockAIResponse)

      const request = new NextRequest('http://localhost:3000/api/recommendations', {
        method: 'POST',
        body: JSON.stringify({ checkIns: [] }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        recommendation: 'Start tracking your energy to get personalized recommendations!'
      })
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
      mockOpenAIInstance.chat.completions.create.mockRejectedValue(new Error('OpenAI API Error'))

      const request = new NextRequest('http://localhost:3000/api/recommendations', {
        method: 'POST',
        body: JSON.stringify({ checkIns: mockCheckIns }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
      expect(await response.text()).toBe('Internal Server Error')
    })

    it('should handle missing OpenAI API key', async () => {
      // Mock environment variable not set
      const originalEnv = process.env.OPENAI_API_KEY
      delete process.env.OPENAI_API_KEY

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

      const request = new NextRequest('http://localhost:3000/api/recommendations', {
        method: 'POST',
        body: JSON.stringify({ checkIns: mockCheckIns }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
      expect(await response.text()).toBe('Internal Server Error')

      // Restore environment variable
      process.env.OPENAI_API_KEY = originalEnv
    })

    it('should handle invalid JSON', async () => {
      mockAuth.mockResolvedValue({ userId: 'user-123' })

      const request = new NextRequest('http://localhost:3000/api/recommendations', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
      expect(await response.text()).toBe('Internal Server Error')
    })

    it('should handle missing body', async () => {
      mockAuth.mockResolvedValue({ userId: 'user-123' })

      const request = new NextRequest('http://localhost:3000/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
      expect(await response.text()).toBe('Internal Server Error')
    })

    it('should handle empty response from OpenAI', async () => {
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
            content: null
          }
        }]
      }

      mockAuth.mockResolvedValue({ userId: mockUserId })
      mockOpenAIInstance.chat.completions.create.mockResolvedValue(mockAIResponse)

      const request = new NextRequest('http://localhost:3000/api/recommendations', {
        method: 'POST',
        body: JSON.stringify({ checkIns: mockCheckIns }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        recommendation: null
      })
    })

    it('should handle large check-ins data', async () => {
      const mockUserId = 'user-123'
      const mockCheckIns = Array.from({ length: 100 }, (_, i) => ({
        id: `checkin-${i}`,
        userId: mockUserId,
        tsUtc: new Date(`2024-01-${String(i + 1).padStart(2, '0')}T08:00:00Z`),
        physical17: Math.floor(Math.random() * 7) + 1,
        cognitive17: Math.floor(Math.random() * 7) + 1,
        mood17: Math.floor(Math.random() * 7) + 1,
        stress17: Math.floor(Math.random() * 4) + 1
      }))

      const mockAIResponse = {
        choices: [{
          message: {
            content: 'Based on your extensive data, consider maintaining consistent sleep patterns.'
          }
        }]
      }

      mockAuth.mockResolvedValue({ userId: mockUserId })
      mockOpenAIInstance.chat.completions.create.mockResolvedValue(mockAIResponse)

      const request = new NextRequest('http://localhost:3000/api/recommendations', {
        method: 'POST',
        body: JSON.stringify({ checkIns: mockCheckIns }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        recommendation: 'Based on your extensive data, consider maintaining consistent sleep patterns.'
      })
    })

    it('should handle malformed check-ins data', async () => {
      const mockUserId = 'user-123'
      const mockCheckIns = [
        {
          id: 'checkin-1',
          // Missing required fields
          tsUtc: new Date('2024-01-01T08:00:00Z')
        },
        {
          // Invalid data structure
          invalidField: 'invalid'
        }
      ]

      const mockAIResponse = {
        choices: [{
          message: {
            content: 'Please ensure your data is properly formatted for analysis.'
          }
        }]
      }

      mockAuth.mockResolvedValue({ userId: mockUserId })
      mockOpenAIInstance.chat.completions.create.mockResolvedValue(mockAIResponse)

      const request = new NextRequest('http://localhost:3000/api/recommendations', {
        method: 'POST',
        body: JSON.stringify({ checkIns: mockCheckIns }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        recommendation: 'Please ensure your data is properly formatted for analysis.'
      })
    })

    it('should call OpenAI with correct analysis prompt structure', async () => {
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
            content: 'Test recommendation'
          }
        }]
      }

      mockAuth.mockResolvedValue({ userId: mockUserId })
      mockOpenAIInstance.chat.completions.create.mockResolvedValue(mockAIResponse)

      const request = new NextRequest('http://localhost:3000/api/recommendations', {
        method: 'POST',
        body: JSON.stringify({ checkIns: mockCheckIns }),
        headers: { 'Content-Type': 'application/json' }
      })

      await POST(request)

      const callArgs = mockOpenAIInstance.chat.completions.create.mock.calls[0][0]
      expect(callArgs.messages[1].content).toContain('Based on the following user check-in data')
      expect(callArgs.messages[1].content).toContain('provide a personalized, actionable recommendation')
      expect(callArgs.messages[1].content).toContain('Physical energy levels')
      expect(callArgs.messages[1].content).toContain('Cognitive energy levels')
      expect(callArgs.messages[1].content).toContain('Mood patterns')
      expect(callArgs.messages[1].content).toContain('Stress levels')
      expect(callArgs.messages[1].content).toContain('Time of day patterns')
    })
  })
})
