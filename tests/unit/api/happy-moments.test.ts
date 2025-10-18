/**
 * Unit tests for happy-moments API route
 */
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/happy-moments/route'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    happyMoment: {
      create: jest.fn()
    }
  }
}))

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn()
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockAuth = auth as jest.MockedFunction<typeof auth>

describe('/api/happy-moments', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/happy-moments', () => {
    it('should create happy moment for authenticated user', async () => {
      const mockUserId = 'user-123'
      const mockFormData = new FormData()
      mockFormData.append('photo', new File(['test'], 'test.jpg', { type: 'image/jpeg' }))
      mockFormData.append('tsUtc', '2024-01-01T12:00:00Z')
      mockFormData.append('note', 'Great day!')

      const mockCreatedMoment = {
        id: 'moment-1',
        userId: mockUserId,
        tsUtc: new Date('2024-01-01T12:00:00Z'),
        note: 'Great day!',
        mediaRef: 'placeholder_url',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      }

      mockAuth.mockResolvedValue({ userId: mockUserId })
      mockPrisma.happyMoment.create.mockResolvedValue(mockCreatedMoment)

      const request = new NextRequest('http://localhost:3000/api/happy-moments', {
        method: 'POST',
        body: mockFormData
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockCreatedMoment)
      expect(mockPrisma.happyMoment.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          tsUtc: new Date('2024-01-01T12:00:00Z'),
          note: 'Great day!',
          mediaRef: 'placeholder_url'
        }
      })
    })

    it('should create happy moment without note', async () => {
      const mockUserId = 'user-123'
      const mockFormData = new FormData()
      mockFormData.append('photo', new File(['test'], 'test.jpg', { type: 'image/jpeg' }))
      mockFormData.append('tsUtc', '2024-01-01T12:00:00Z')

      const mockCreatedMoment = {
        id: 'moment-1',
        userId: mockUserId,
        tsUtc: new Date('2024-01-01T12:00:00Z'),
        note: null,
        mediaRef: 'placeholder_url',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      }

      mockAuth.mockResolvedValue({ userId: mockUserId })
      mockPrisma.happyMoment.create.mockResolvedValue(mockCreatedMoment)

      const request = new NextRequest('http://localhost:3000/api/happy-moments', {
        method: 'POST',
        body: mockFormData
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockCreatedMoment)
      expect(mockPrisma.happyMoment.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          tsUtc: new Date('2024-01-01T12:00:00Z'),
          note: null,
          mediaRef: 'placeholder_url'
        }
      })
    })

    it('should return 401 for unauthenticated user', async () => {
      mockAuth.mockResolvedValue({ userId: null })

      const mockFormData = new FormData()
      mockFormData.append('photo', new File(['test'], 'test.jpg', { type: 'image/jpeg' }))
      mockFormData.append('tsUtc', '2024-01-01T12:00:00Z')
      mockFormData.append('note', 'Great day!')

      const request = new NextRequest('http://localhost:3000/api/happy-moments', {
        method: 'POST',
        body: mockFormData
      })

      const response = await POST(request)

      expect(response.status).toBe(401)
      expect(await response.text()).toBe('Unauthorized')
      expect(mockPrisma.happyMoment.create).not.toHaveBeenCalled()
    })

    it('should return 400 for missing photo', async () => {
      mockAuth.mockResolvedValue({ userId: 'user-123' })

      const mockFormData = new FormData()
      mockFormData.append('tsUtc', '2024-01-01T12:00:00Z')
      mockFormData.append('note', 'Great day!')

      const request = new NextRequest('http://localhost:3000/api/happy-moments', {
        method: 'POST',
        body: mockFormData
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      expect(await response.text()).toBe('Missing required fields')
      expect(mockPrisma.happyMoment.create).not.toHaveBeenCalled()
    })

    it('should return 400 for missing tsUtc', async () => {
      mockAuth.mockResolvedValue({ userId: 'user-123' })

      const mockFormData = new FormData()
      mockFormData.append('photo', new File(['test'], 'test.jpg', { type: 'image/jpeg' }))
      mockFormData.append('note', 'Great day!')

      const request = new NextRequest('http://localhost:3000/api/happy-moments', {
        method: 'POST',
        body: mockFormData
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      expect(await response.text()).toBe('Missing required fields')
      expect(mockPrisma.happyMoment.create).not.toHaveBeenCalled()
    })

    it('should return 400 for missing both photo and tsUtc', async () => {
      mockAuth.mockResolvedValue({ userId: 'user-123' })

      const mockFormData = new FormData()
      mockFormData.append('note', 'Great day!')

      const request = new NextRequest('http://localhost:3000/api/happy-moments', {
        method: 'POST',
        body: mockFormData
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      expect(await response.text()).toBe('Missing required fields')
      expect(mockPrisma.happyMoment.create).not.toHaveBeenCalled()
    })

    it('should handle database errors', async () => {
      mockAuth.mockResolvedValue({ userId: 'user-123' })
      mockPrisma.happyMoment.create.mockRejectedValue(new Error('Database error'))

      const mockFormData = new FormData()
      mockFormData.append('photo', new File(['test'], 'test.jpg', { type: 'image/jpeg' }))
      mockFormData.append('tsUtc', '2024-01-01T12:00:00Z')
      mockFormData.append('note', 'Great day!')

      const request = new NextRequest('http://localhost:3000/api/happy-moments', {
        method: 'POST',
        body: mockFormData
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
      expect(await response.text()).toBe('Internal Server Error')
    })

    it('should handle invalid date format', async () => {
      mockAuth.mockResolvedValue({ userId: 'user-123' })

      const mockFormData = new FormData()
      mockFormData.append('photo', new File(['test'], 'test.jpg', { type: 'image/jpeg' }))
      mockFormData.append('tsUtc', 'invalid-date')
      mockFormData.append('note', 'Great day!')

      const request = new NextRequest('http://localhost:3000/api/happy-moments', {
        method: 'POST',
        body: mockFormData
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
      expect(await response.text()).toBe('Internal Server Error')
    })

    it('should handle empty form data', async () => {
      mockAuth.mockResolvedValue({ userId: 'user-123' })

      const mockFormData = new FormData()

      const request = new NextRequest('http://localhost:3000/api/happy-moments', {
        method: 'POST',
        body: mockFormData
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      expect(await response.text()).toBe('Missing required fields')
    })

    it('should handle different file types', async () => {
      const mockUserId = 'user-123'
      const mockFormData = new FormData()
      mockFormData.append('photo', new File(['test'], 'test.png', { type: 'image/png' }))
      mockFormData.append('tsUtc', '2024-01-01T12:00:00Z')
      mockFormData.append('note', 'Great day!')

      const mockCreatedMoment = {
        id: 'moment-1',
        userId: mockUserId,
        tsUtc: new Date('2024-01-01T12:00:00Z'),
        note: 'Great day!',
        mediaRef: 'placeholder_url',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      }

      mockAuth.mockResolvedValue({ userId: mockUserId })
      mockPrisma.happyMoment.create.mockResolvedValue(mockCreatedMoment)

      const request = new NextRequest('http://localhost:3000/api/happy-moments', {
        method: 'POST',
        body: mockFormData
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockCreatedMoment)
    })

    it('should handle large file uploads', async () => {
      const mockUserId = 'user-123'
      const mockFormData = new FormData()
      // Create a larger file (simulate)
      const largeFile = new File(['x'.repeat(1000000)], 'large.jpg', { type: 'image/jpeg' })
      mockFormData.append('photo', largeFile)
      mockFormData.append('tsUtc', '2024-01-01T12:00:00Z')
      mockFormData.append('note', 'Great day!')

      const mockCreatedMoment = {
        id: 'moment-1',
        userId: mockUserId,
        tsUtc: new Date('2024-01-01T12:00:00Z'),
        note: 'Great day!',
        mediaRef: 'placeholder_url',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      }

      mockAuth.mockResolvedValue({ userId: mockUserId })
      mockPrisma.happyMoment.create.mockResolvedValue(mockCreatedMoment)

      const request = new NextRequest('http://localhost:3000/api/happy-moments', {
        method: 'POST',
        body: mockFormData
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockCreatedMoment)
    })
  })
})
