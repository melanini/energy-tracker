/**
 * Unit tests for utility functions
 */
import { cn } from '@/lib/utils'

describe('Utils', () => {
  describe('cn function', () => {
    it('should merge class names correctly', () => {
      const result = cn('class1', 'class2')
      expect(result).toBe('class1 class2')
    })

    it('should handle conditional classes', () => {
      const result = cn('base', true && 'conditional', false && 'hidden')
      expect(result).toBe('base conditional')
    })

    it('should handle undefined and null values', () => {
      const result = cn('base', undefined, null, 'valid')
      expect(result).toBe('base valid')
    })

    it('should handle empty strings', () => {
      const result = cn('base', '', 'valid')
      expect(result).toBe('base valid')
    })

    it('should handle arrays of classes', () => {
      const result = cn(['class1', 'class2'], 'class3')
      expect(result).toBe('class1 class2 class3')
    })

    it('should handle objects with boolean values', () => {
      const result = cn({
        'class1': true,
        'class2': false,
        'class3': true
      })
      expect(result).toBe('class1 class3')
    })

    it('should handle mixed input types', () => {
      const result = cn(
        'base',
        ['array1', 'array2'],
        {
          'object1': true,
          'object2': false
        },
        'string',
        undefined,
        null
      )
      expect(result).toBe('base array1 array2 object1 string')
    })

    it('should handle Tailwind class conflicts', () => {
      // This tests that twMerge is working correctly
      const result = cn('p-2', 'p-4')
      expect(result).toBe('p-4') // p-4 should override p-2
    })

    it('should handle complex Tailwind class merging', () => {
      const result = cn('bg-red-500', 'bg-blue-500', 'text-white')
      expect(result).toBe('bg-blue-500 text-white')
    })

    it('should return empty string for no input', () => {
      const result = cn()
      expect(result).toBe('')
    })

    it('should handle only falsy values', () => {
      const result = cn(false, null, undefined, '')
      expect(result).toBe('')
    })
  })
})
