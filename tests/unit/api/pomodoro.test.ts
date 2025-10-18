/**
 * Unit tests for pomodoro API route
 */
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/pomodoro/route'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    pomodoroSession: {
      create: jest.fn()
    }
  }
}))

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn()
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockAuth = auth as jest.MockedFunction<typeof auth>

describe('/api/pomodoro', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/pomodoro', () => {
    it('should create pomodoro session for authenticated user', async () => {
      const mockUserId = 'user-123'
      const mockPomodoroData = {
        duration: 25
      }

      const mockCreatedSession = {
        id: 'pomodoro-1',
        userId: mockUserId,
        duration: 25,
        tsUtc: expect.any(Date),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      }

      mockAuth.mockResolvedValue({ userId: mockUserId })
      mockPrisma.pomodoroSession.create.mockResolvedValue(mockCreatedSession)

      const request = new NextRequest('http://localhost:3000/api/pomodoro', {
        method: 'POST',
        body: JSON.stringify(mockPomodoroData),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toEqual(mockCreatedSession)
      expect(mockPrisma.pomodoroSession.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          duration: 25,
          tsUtc: expect.any(Date)
        }
      })
    })

    it('should use default duration when not provided', async () => {
      const mockUserId = 'user-123'
      const mockPomodoroData = {}

      const mockCreatedSession = {
        id: 'pomodoro-1',
        userId: mockUserId,
        duration: 25,
        tsUtc: expect.any(Date),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      }

      mockAuth.mockResolvedValue({ userId: mockUserId })
      mockPrisma.pomodoroSession.create.mockResolvedValue(mockCreatedSession)

      const request = new NextRequest('http://localhost:3000/api/pomodoro', {
        method: 'POST',
        body: JSON.stringify(mockPomodoroData),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toEqual(mockCreatedSession)
      expect(mockPrisma.pomodoroSession.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          duration: 25,
          tsUtc: expect.any(Date)
        }
      })
    })

    it('should handle custom duration', async () => {
      const mockUserId = 'user-123'
      const mockPomodoroData = {
        duration: 50
      }

      const mockCreatedSession = {
        id: 'pomodoro-1',
        userId: mockUserId,
        duration: 50,
        tsUtc: expect.any(Date),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      }

      mockAuth.mockResolvedValue({ userId: mockUserId })
      mockPrisma.pomodoroSession.create.mockResolvedValue(mockCreatedSession)

      const request = new NextRequest('http://localhost:3000/api/pomodoro', {
        method: 'POST',
        body: JSON.stringify(mockPomodoroData),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toEqual(mockCreatedSession)
      expect(mockPrisma.pomodoroSession.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          duration: 50,
          tsUtc: expect.any(Date)
        }
      })
    })

    it('should return 401 for unauthenticated user', async () => {
      mockAuth.mockResolvedValue({ userId: null })

      const request = new NextRequest('http://localhost:3000/api/pomodoro', {
        method: 'POST',
        body: JSON.stringify({ duration: 25 }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toEqual({ error: 'Unauthorized' })
      expect(mockPrisma.pomodoroSession.create).not.toHaveBeenCalled()
    })

    it('should handle database errors', async () => {
      mockAuth.mockResolvedValue({ userId: 'user-123' })
      mockPrisma.pomodoroSession.create.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/pomodoro', {
        method: 'POST',
        body: JSON.stringify({ duration: 25 }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to create pomodoro session' })
    })

    it('should handle invalid JSON', async () => {
      mockAuth.mockResolvedValue({ userId: 'user-123' })

      const request = new NextRequest('http://localhost:3000/api/pomodoro', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to create pomodoro session' })
    })

    it('should handle missing body', async () => {
      mockAuth.mockResolvedValue({ userId: 'user-123' })

      const request = new NextRequest('http://localhost:3000/api/pomodoro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to create pomodoro session' })
    })

    it('should handle zero duration', async () => {
      const mockUserId = 'user-123'
      const mockPomodoroData = {
        duration: 0
      }

      const mockCreatedSession = {
        id: 'pomodoro-1',
        userId: mockUserId,
        duration: 0,
        tsUtc: expect.any(Date),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      }

      mockAuth.mockResolvedValue({ userId: mockUserId })
      mockPrisma.pomodoroSession.create.mockResolvedValue(mockCreatedSession)

      const request = new NextRequest('http://localhost:3000/api/pomodoro', {
        method: 'POST',
        body: JSON.stringify(mockPomodoroData),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toEqual(mockCreatedSession)
      expect(mockPrisma.pomodoroSession.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          duration: 0,
          tsUtc: expect.any(Date)
        }
      })
    })

    it('should handle negative duration', async () => {
      const mockUserId = 'user-123'
      const mockPomodoroData = {
        duration: -10
      }

      const mockCreatedSession = {
        id: 'pomodoro-1',
        userId: mockUserId,
        duration: -10,
        tsUtc: expect.any(Date),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      }

      mockAuth.mockResolvedValue({ userId: mockUserId })
      mockPrisma.pomodoroSession.create.mockResolvedValue(mockCreatedSession)

      const request = new NextRequest('http://localhost:3000/api/pomodoro', {
        method: 'POST',
        body: JSON.stringify(mockPomodoroData),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toEqual(mockCreatedSession)
      expect(mockPrisma.pomodoroSession.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          duration: -10,
          tsUtc: expect.any(Date)
        }
      })
    })
  })
})
