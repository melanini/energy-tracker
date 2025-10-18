/**
 * Unit tests for check-ins API route
 */
import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/check-ins/route'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    checkIn: {
      findMany: jest.fn(),
      create: jest.fn()
    }
  }
}))

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn()
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockAuth = auth as jest.MockedFunction<typeof auth>

describe('/api/check-ins', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/check-ins', () => {
    it('should return check-ins for authenticated user', async () => {
      const mockUserId = 'user-123'
      const mockCheckIns = [
        {
          id: 'checkin-1',
          userId: mockUserId,
          window: 'morning',
          physical17: 7,
          cognitive17: 6,
          mood17: 5,
          stress17: 3,
          note: 'Feeling good',
          tsUtc: new Date('2024-01-01T08:00:00Z'),
          timeEntries: []
        }
      ]

      mockAuth.mockResolvedValue({ userId: mockUserId })
      mockPrisma.checkIn.findMany.mockResolvedValue(mockCheckIns)

      const request = new NextRequest('http://localhost:3000/api/check-ins')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockCheckIns)
      expect(mockPrisma.checkIn.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          tsUtc: {
            gte: expect.any(Date),
            lte: expect.any(Date)
          }
        },
        include: {
          timeEntries: {
            include: {
              category: true
            }
          }
        },
        orderBy: {
          tsUtc: 'asc'
        }
      })
    })

    it('should return check-ins for guest user', async () => {
      mockAuth.mockResolvedValue({ userId: null })
      mockPrisma.checkIn.findMany.mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/check-ins')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual([])
      expect(mockPrisma.checkIn.findMany).toHaveBeenCalledWith({
        where: {
          tsUtc: {
            gte: expect.any(Date),
            lte: expect.any(Date)
          }
        },
        include: {
          timeEntries: {
            include: {
              category: true
            }
          }
        },
        orderBy: {
          tsUtc: 'asc'
        }
      })
    })

    it('should handle date parameter', async () => {
      const mockUserId = 'user-123'
      const testDate = '2024-01-15'
      
      mockAuth.mockResolvedValue({ userId: mockUserId })
      mockPrisma.checkIn.findMany.mockResolvedValue([])

      const request = new NextRequest(`http://localhost:3000/api/check-ins?date=${testDate}`)
      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(mockPrisma.checkIn.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          tsUtc: {
            gte: new Date('2024-01-15T00:00:00.000Z'),
            lte: new Date('2024-01-15T23:59:59.999Z')
          }
        },
        include: {
          timeEntries: {
            include: {
              category: true
            }
          }
        },
        orderBy: {
          tsUtc: 'asc'
        }
      })
    })

    it('should handle database errors', async () => {
      mockAuth.mockResolvedValue({ userId: 'user-123' })
      mockPrisma.checkIn.findMany.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/check-ins')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to fetch check-ins' })
    })
  })

  describe('POST /api/check-ins', () => {
    it('should create check-in for authenticated user', async () => {
      const mockUserId = 'user-123'
      const mockCheckInData = {
        window: 'morning',
        physical17: 7,
        cognitive17: 6,
        mood17: 5,
        stress17: 3,
        note: 'Feeling good',
        timeEntries: [
          { hours: 2, categoryId: 'work' },
          { hours: 1, categoryId: 'exercise' }
        ]
      }

      const mockCreatedCheckIn = {
        id: 'checkin-1',
        userId: mockUserId,
        ...mockCheckInData,
        tsUtc: expect.any(Date),
        timeEntries: [
          { hours: 2, categoryId: 'work', category: { id: 'work', label: 'Work' } },
          { hours: 1, categoryId: 'exercise', category: { id: 'exercise', label: 'Exercise' } }
        ]
      }

      mockAuth.mockResolvedValue({ userId: mockUserId })
      mockPrisma.checkIn.create.mockResolvedValue(mockCreatedCheckIn)

      const request = new NextRequest('http://localhost:3000/api/check-ins', {
        method: 'POST',
        body: JSON.stringify(mockCheckInData),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockCreatedCheckIn)
      expect(mockPrisma.checkIn.create).toHaveBeenCalledWith({
        data: {
          ...mockCheckInData,
          userId: mockUserId,
          tsUtc: expect.any(Date),
          note: 'Feeling good',
          timeEntries: {
            create: [
              { hours: 2, categoryId: 'work' },
              { hours: 1, categoryId: 'exercise' }
            ]
          }
        },
        include: {
          timeEntries: {
            include: {
              category: true
            }
          }
        }
      })
    })

    it('should create check-in for guest user', async () => {
      const mockCheckInData = {
        window: 'morning',
        physical17: 7,
        cognitive17: 6,
        mood17: 5,
        stress17: 3,
        note: 'Feeling good',
        timeEntries: []
      }

      const mockCreatedCheckIn = {
        id: 'checkin-1',
        userId: null,
        ...mockCheckInData,
        tsUtc: expect.any(Date),
        timeEntries: []
      }

      mockAuth.mockResolvedValue({ userId: null })
      mockPrisma.checkIn.create.mockResolvedValue(mockCreatedCheckIn)

      const request = new NextRequest('http://localhost:3000/api/check-ins', {
        method: 'POST',
        body: JSON.stringify(mockCheckInData),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockCreatedCheckIn)
      expect(mockPrisma.checkIn.create).toHaveBeenCalledWith({
        data: {
          ...mockCheckInData,
          tsUtc: expect.any(Date),
          note: 'Feeling good',
          timeEntries: {
            create: []
          }
        },
        include: {
          timeEntries: {
            include: {
              category: true
            }
          }
        }
      })
    })

    it('should handle missing note field', async () => {
      const mockUserId = 'user-123'
      const mockCheckInData = {
        window: 'morning',
        physical17: 7,
        cognitive17: 6,
        mood17: 5,
        stress17: 3,
        timeEntries: []
      }

      const mockCreatedCheckIn = {
        id: 'checkin-1',
        userId: mockUserId,
        ...mockCheckInData,
        note: '',
        tsUtc: expect.any(Date),
        timeEntries: []
      }

      mockAuth.mockResolvedValue({ userId: mockUserId })
      mockPrisma.checkIn.create.mockResolvedValue(mockCreatedCheckIn)

      const request = new NextRequest('http://localhost:3000/api/check-ins', {
        method: 'POST',
        body: JSON.stringify(mockCheckInData),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockPrisma.checkIn.create).toHaveBeenCalledWith({
        data: {
          ...mockCheckInData,
          userId: mockUserId,
          tsUtc: expect.any(Date),
          note: '',
          timeEntries: {
            create: []
          }
        },
        include: {
          timeEntries: {
            include: {
              category: true
            }
          }
        }
      })
    })

    it('should handle database errors', async () => {
      mockAuth.mockResolvedValue({ userId: 'user-123' })
      mockPrisma.checkIn.create.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/check-ins', {
        method: 'POST',
        body: JSON.stringify({
          window: 'morning',
          physical17: 7,
          cognitive17: 6,
          mood17: 5,
          stress17: 3,
          note: 'Feeling good',
          timeEntries: []
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to create check-in' })
    })

    it('should handle invalid JSON', async () => {
      mockAuth.mockResolvedValue({ userId: 'user-123' })

      const request = new NextRequest('http://localhost:3000/api/check-ins', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to create check-in' })
    })
  })
})
