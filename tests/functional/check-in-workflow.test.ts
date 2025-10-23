/**
 * Functional tests for check-in workflow
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

describe('Check-in Workflow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Complete Check-in Flow', () => {
    it('should handle complete user check-in workflow', async () => {
      const mockUserId = 'user-123'
      const testDate = '2024-01-15'
      
      // Mock authentication
      mockAuth.mockResolvedValue({ userId: mockUserId })

      // Step 1: Create a check-in
      const checkInData = {
        window: 'morning',
        physical17: 7,
        cognitive17: 6,
        mood17: 5,
        stress17: 3,
        note: 'Feeling energized this morning!',
        timeEntries: [
          { hours: 2, categoryId: 'work' },
          { hours: 1, categoryId: 'exercise' },
          { hours: 0.5, categoryId: 'family' }
        ]
      }

      const mockCreatedCheckIn = {
        id: 'checkin-1',
        userId: mockUserId,
        ...checkInData,
        tsUtc: new Date('2024-01-15T08:00:00Z'),
        timeEntries: [
          { hours: 2, categoryId: 'work', category: { id: 'work', label: 'Work' } },
          { hours: 1, categoryId: 'exercise', category: { id: 'exercise', label: 'Exercise' } },
          { hours: 0.5, categoryId: 'family', category: { id: 'family', label: 'Family' } }
        ]
      }

      mockPrisma.checkIn.create.mockResolvedValue(mockCreatedCheckIn)

      const createRequest = new NextRequest('http://localhost:3000/api/check-ins', {
        method: 'POST',
        body: JSON.stringify(checkInData),
        headers: { 'Content-Type': 'application/json' }
      })

      const createResponse = await POST(createRequest)
      const createdData = await createResponse.json()

      expect(createResponse.status).toBe(200)
      expect(createdData.id).toBe('checkin-1')
      expect(createdData.userId).toBe(mockUserId)
      expect(createdData.timeEntries).toHaveLength(3)

      // Step 2: Retrieve check-ins for the same date
      const mockRetrievedCheckIns = [mockCreatedCheckIn]
      mockPrisma.checkIn.findMany.mockResolvedValue(mockRetrievedCheckIns)

      const getRequest = new NextRequest(`http://localhost:3000/api/check-ins?date=${testDate}`)
      const getResponse = await GET(getRequest)
      const retrievedData = await getResponse.json()

      expect(getResponse.status).toBe(200)
      expect(retrievedData).toHaveLength(1)
      expect(retrievedData[0].id).toBe('checkin-1')
      expect(retrievedData[0].timeEntries).toHaveLength(3)

      // Verify the complete workflow
      expect(mockPrisma.checkIn.create).toHaveBeenCalledWith({
        data: {
          ...checkInData,
          userId: mockUserId,
          tsUtc: expect.any(Date),
          note: 'Feeling energized this morning!',
          timeEntries: {
            create: [
              { hours: 2, categoryId: 'work' },
              { hours: 1, categoryId: 'exercise' },
              { hours: 0.5, categoryId: 'family' }
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

    it('should handle multiple check-ins per day', async () => {
      const mockUserId = 'user-123'
      const testDate = '2024-01-15'
      
      mockAuth.mockResolvedValue({ userId: mockUserId })

      // Create morning check-in
      const morningCheckIn = {
        window: 'morning',
        physical17: 7,
        cognitive17: 6,
        mood17: 5,
        stress17: 3,
        note: 'Great morning!',
        timeEntries: [{ hours: 2, categoryId: 'work' }]
      }

      const mockMorningCheckIn = {
        id: 'checkin-morning',
        userId: mockUserId,
        ...morningCheckIn,
        tsUtc: new Date('2024-01-15T08:00:00Z'),
        timeEntries: [{ hours: 2, categoryId: 'work', category: { id: 'work', label: 'Work' } }]
      }

      mockPrisma.checkIn.create.mockResolvedValue(mockMorningCheckIn)

      const morningRequest = new NextRequest('http://localhost:3000/api/check-ins', {
        method: 'POST',
        body: JSON.stringify(morningCheckIn),
        headers: { 'Content-Type': 'application/json' }
      })

      const morningResponse = await POST(morningRequest)
      expect(morningResponse.status).toBe(200)

      // Create afternoon check-in
      const afternoonCheckIn = {
        window: 'afternoon',
        physical17: 5,
        cognitive17: 7,
        mood17: 6,
        stress17: 2,
        note: 'Productive afternoon',
        timeEntries: [{ hours: 1, categoryId: 'exercise' }]
      }

      const mockAfternoonCheckIn = {
        id: 'checkin-afternoon',
        userId: mockUserId,
        ...afternoonCheckIn,
        tsUtc: new Date('2024-01-15T14:00:00Z'),
        timeEntries: [{ hours: 1, categoryId: 'exercise', category: { id: 'exercise', label: 'Exercise' } }]
      }

      mockPrisma.checkIn.create.mockResolvedValue(mockAfternoonCheckIn)

      const afternoonRequest = new NextRequest('http://localhost:3000/api/check-ins', {
        method: 'POST',
        body: JSON.stringify(afternoonCheckIn),
        headers: { 'Content-Type': 'application/json' }
      })

      const afternoonResponse = await POST(afternoonRequest)
      expect(afternoonResponse.status).toBe(200)

      // Retrieve all check-ins for the day
      const allCheckIns = [mockMorningCheckIn, mockAfternoonCheckIn]
      mockPrisma.checkIn.findMany.mockResolvedValue(allCheckIns)

      const getRequest = new NextRequest(`http://localhost:3000/api/check-ins?date=${testDate}`)
      const getResponse = await GET(getRequest)
      const retrievedData = await getResponse.json()

      expect(getResponse.status).toBe(200)
      expect(retrievedData).toHaveLength(2)
      expect(retrievedData[0].window).toBe('morning')
      expect(retrievedData[1].window).toBe('afternoon')
    })

    it('should handle guest user workflow', async () => {
      const testDate = '2024-01-15'
      
      mockAuth.mockResolvedValue({ userId: null })

      // Create check-in as guest
      const checkInData = {
        window: 'morning',
        physical17: 7,
        cognitive17: 6,
        mood17: 5,
        stress17: 3,
        note: 'Guest check-in',
        timeEntries: []
      }

      const mockCreatedCheckIn = {
        id: 'checkin-guest',
        userId: null,
        ...checkInData,
        tsUtc: new Date('2024-01-15T08:00:00Z'),
        timeEntries: []
      }

      mockPrisma.checkIn.create.mockResolvedValue(mockCreatedCheckIn)

      const createRequest = new NextRequest('http://localhost:3000/api/check-ins', {
        method: 'POST',
        body: JSON.stringify(checkInData),
        headers: { 'Content-Type': 'application/json' }
      })

      const createResponse = await POST(createRequest)
      const createdData = await createResponse.json()

      expect(createResponse.status).toBe(200)
      expect(createdData.userId).toBeNull()

      // Retrieve guest check-ins
      const mockRetrievedCheckIns = [mockCreatedCheckIn]
      mockPrisma.checkIn.findMany.mockResolvedValue(mockRetrievedCheckIns)

      const getRequest = new NextRequest(`http://localhost:3000/api/check-ins?date=${testDate}`)
      const getResponse = await GET(getRequest)
      const retrievedData = await getResponse.json()

      expect(getResponse.status).toBe(200)
      expect(retrievedData).toHaveLength(1)
      expect(retrievedData[0].userId).toBeNull()
    })

    it('should handle check-in with complex time entries', async () => {
      const mockUserId = 'user-123'
      
      mockAuth.mockResolvedValue({ userId: mockUserId })

      const checkInData = {
        window: 'evening',
        physical17: 4,
        cognitive17: 5,
        mood17: 6,
        stress17: 2,
        note: 'Complex day with many activities',
        timeEntries: [
          { hours: 4, categoryId: 'work' },
          { hours: 1.5, categoryId: 'exercise' },
          { hours: 2, categoryId: 'family' },
          { hours: 0.5, categoryId: 'hobby' },
          { hours: 1, categoryId: 'social' },
          { hours: 0.5, categoryId: 'rest' }
        ]
      }

      const mockCreatedCheckIn = {
        id: 'checkin-complex',
        userId: mockUserId,
        ...checkInData,
        tsUtc: new Date('2024-01-15T20:00:00Z'),
        timeEntries: checkInData.timeEntries.map(entry => ({
          ...entry,
          category: { id: entry.categoryId, label: entry.categoryId.charAt(0).toUpperCase() + entry.categoryId.slice(1) }
        }))
      }

      mockPrisma.checkIn.create.mockResolvedValue(mockCreatedCheckIn)

      const request = new NextRequest('http://localhost:3000/api/check-ins', {
        method: 'POST',
        body: JSON.stringify(checkInData),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.timeEntries).toHaveLength(6)
      
      // Verify total hours
      const totalHours = data.timeEntries.reduce((sum: number, entry: any) => sum + entry.hours, 0)
      expect(totalHours).toBe(9.5)
    })

    it('should handle edge case values in check-in', async () => {
      const mockUserId = 'user-123'
      
      mockAuth.mockResolvedValue({ userId: mockUserId })

      const checkInData = {
        window: 'morning',
        physical17: 1, // Minimum value
        cognitive17: 7, // Maximum value
        mood17: 1, // Minimum value
        stress17: 4, // Maximum value
        note: '', // Empty note
        timeEntries: [
          { hours: 0.1, categoryId: 'work' }, // Very small hours
          { hours: 12, categoryId: 'exercise' } // Large hours
        ]
      }

      const mockCreatedCheckIn = {
        id: 'checkin-edge',
        userId: mockUserId,
        ...checkInData,
        tsUtc: new Date('2024-01-15T08:00:00Z'),
        timeEntries: checkInData.timeEntries.map(entry => ({
          ...entry,
          category: { id: entry.categoryId, label: entry.categoryId.charAt(0).toUpperCase() + entry.categoryId.slice(1) }
        }))
      }

      mockPrisma.checkIn.create.mockResolvedValue(mockCreatedCheckIn)

      const request = new NextRequest('http://localhost:3000/api/check-ins', {
        method: 'POST',
        body: JSON.stringify(checkInData),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.physical17).toBe(1)
      expect(data.cognitive17).toBe(7)
      expect(data.mood17).toBe(1)
      expect(data.stress17).toBe(4)
      expect(data.note).toBe('')
      expect(data.timeEntries).toHaveLength(2)
    })
  })
})
