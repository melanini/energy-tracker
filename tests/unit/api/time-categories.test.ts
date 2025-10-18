/**
 * Unit tests for time-categories API route
 */
import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/time-categories/route'
import { prisma } from '@/lib/prisma'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    timeCategory: {
      findMany: jest.fn(),
      create: jest.fn()
    }
  }
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('/api/time-categories', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/time-categories', () => {
    it('should return custom time categories', async () => {
      const mockCategories = [
        {
          id: 'custom-1',
          label: 'Custom Work',
          icon: 'briefcase',
          isCustom: true,
          createdAt: new Date('2024-01-01T00:00:00Z'),
          updatedAt: new Date('2024-01-01T00:00:00Z')
        },
        {
          id: 'custom-2',
          label: 'Custom Exercise',
          icon: 'dumbbell',
          isCustom: true,
          createdAt: new Date('2024-01-02T00:00:00Z'),
          updatedAt: new Date('2024-01-02T00:00:00Z')
        }
      ]

      mockPrisma.timeCategory.findMany.mockResolvedValue(mockCategories)

      const request = new NextRequest('http://localhost:3000/api/time-categories')
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockCategories)
      expect(mockPrisma.timeCategory.findMany).toHaveBeenCalledWith({
        where: {
          isCustom: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      })
    })

    it('should return empty array when no custom categories exist', async () => {
      mockPrisma.timeCategory.findMany.mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/time-categories')
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual([])
    })

    it('should handle database errors', async () => {
      mockPrisma.timeCategory.findMany.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/time-categories')
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to fetch time categories' })
    })
  })

  describe('POST /api/time-categories', () => {
    it('should create new custom time category', async () => {
      const mockCategoryData = {
        id: 'custom-1',
        label: 'Custom Work',
        icon: 'briefcase'
      }

      const mockCreatedCategory = {
        id: 'custom-1',
        label: 'Custom Work',
        icon: 'briefcase',
        isCustom: true,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      }

      mockPrisma.timeCategory.create.mockResolvedValue(mockCreatedCategory)

      const request = new NextRequest('http://localhost:3000/api/time-categories', {
        method: 'POST',
        body: JSON.stringify(mockCategoryData),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockCreatedCategory)
      expect(mockPrisma.timeCategory.create).toHaveBeenCalledWith({
        data: {
          id: 'custom-1',
          label: 'Custom Work',
          icon: 'briefcase',
          isCustom: true
        }
      })
    })

    it('should create category with minimal data', async () => {
      const mockCategoryData = {
        id: 'minimal',
        label: 'Minimal Category'
      }

      const mockCreatedCategory = {
        id: 'minimal',
        label: 'Minimal Category',
        icon: undefined,
        isCustom: true,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      }

      mockPrisma.timeCategory.create.mockResolvedValue(mockCreatedCategory)

      const request = new NextRequest('http://localhost:3000/api/time-categories', {
        method: 'POST',
        body: JSON.stringify(mockCategoryData),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockCreatedCategory)
      expect(mockPrisma.timeCategory.create).toHaveBeenCalledWith({
        data: {
          id: 'minimal',
          label: 'Minimal Category',
          icon: undefined,
          isCustom: true
        }
      })
    })

    it('should handle database errors', async () => {
      mockPrisma.timeCategory.create.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/time-categories', {
        method: 'POST',
        body: JSON.stringify({
          id: 'custom-1',
          label: 'Custom Work',
          icon: 'briefcase'
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to create time category' })
    })

    it('should handle invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/time-categories', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to create time category' })
    })

    it('should handle missing body', async () => {
      const request = new NextRequest('http://localhost:3000/api/time-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to create time category' })
    })

    it('should handle duplicate ID constraint', async () => {
      mockPrisma.timeCategory.create.mockRejectedValue(new Error('Unique constraint failed'))

      const request = new NextRequest('http://localhost:3000/api/time-categories', {
        method: 'POST',
        body: JSON.stringify({
          id: 'duplicate-id',
          label: 'Duplicate Category',
          icon: 'duplicate'
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to create time category' })
    })

    it('should handle empty category data', async () => {
      const request = new NextRequest('http://localhost:3000/api/time-categories', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to create time category' })
    })

    it('should handle null values in category data', async () => {
      const mockCategoryData = {
        id: null,
        label: null,
        icon: null
      }

      const request = new NextRequest('http://localhost:3000/api/time-categories', {
        method: 'POST',
        body: JSON.stringify(mockCategoryData),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to create time category' })
    })

    it('should handle very long category names', async () => {
      const longLabel = 'A'.repeat(1000)
      const mockCategoryData = {
        id: 'long-category',
        label: longLabel,
        icon: 'long'
      }

      const mockCreatedCategory = {
        id: 'long-category',
        label: longLabel,
        icon: 'long',
        isCustom: true,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      }

      mockPrisma.timeCategory.create.mockResolvedValue(mockCreatedCategory)

      const request = new NextRequest('http://localhost:3000/api/time-categories', {
        method: 'POST',
        body: JSON.stringify(mockCategoryData),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockCreatedCategory)
    })

    it('should handle special characters in category data', async () => {
      const mockCategoryData = {
        id: 'special-chars-!@#$%',
        label: 'Category with émojis 🎯 and symbols',
        icon: '🎨'
      }

      const mockCreatedCategory = {
        id: 'special-chars-!@#$%',
        label: 'Category with émojis 🎯 and symbols',
        icon: '🎨',
        isCustom: true,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      }

      mockPrisma.timeCategory.create.mockResolvedValue(mockCreatedCategory)

      const request = new NextRequest('http://localhost:3000/api/time-categories', {
        method: 'POST',
        body: JSON.stringify(mockCategoryData),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockCreatedCategory)
    })
  })
})
