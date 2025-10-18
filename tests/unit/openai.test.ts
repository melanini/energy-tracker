/**
 * Unit tests for OpenAI utility functions
 */
import { generateInsight, generateChartExplanation, generateDailyInsight, generateWeeklySummary } from '@/utils/openai'

// Mock OpenAI
const mockCreate = jest.fn()
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate
        }
      }
    }))
  }
})

describe('OpenAI Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreate.mockClear()
  })

  describe('generateInsight', () => {
    it('should generate insight successfully', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Test insight response'
          }
        }]
      }

      mockCreate.mockResolvedValue(mockResponse)

      const result = await generateInsight('Test prompt')
      
      expect(result).toBe('Test insight response')
    })

    it('should handle OpenAI API errors gracefully', async () => {
      mockCreate.mockRejectedValue(new Error('API Error'))

      const result = await generateInsight('Test prompt')
      
      expect(result).toBe('Unable to generate insight at this time.')
    })

    it('should handle empty response content', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: null
          }
        }]
      }

      mockCreate.mockResolvedValue(mockResponse)

      const result = await generateInsight('Test prompt')
      
      expect(result).toBe('Unable to generate insight.')
    })

    it('should call OpenAI with correct parameters', async () => {
      mockCreate.mockResolvedValue({
        choices: [{
          message: {
            content: 'Test response'
          }
        }]
      })

      await generateInsight('Test prompt')

      expect(mockCreate).toHaveBeenCalledWith({
        messages: [
          {
            role: "system",
            content: "You are an expert in analyzing energy and wellness data. Provide clear, actionable insights in a friendly, encouraging tone. Keep explanations to 2-3 sentences."
          },
          {
            role: "user",
            content: "Test prompt"
          }
        ],
        model: "gpt-3.5-turbo",
      })
    })
  })

  describe('generateChartExplanation', () => {
    it('should generate history chart explanation', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'History chart explanation'
          }
        }]
      }

      mockCreate.mockResolvedValue(mockResponse)

      const result = await generateChartExplanation('history', { data: 'test' })
      
      expect(result).toBe('History chart explanation')
    })

    it('should generate correlation chart explanation', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Correlation chart explanation'
          }
        }]
      }

      mockCreate.mockResolvedValue(mockResponse)

      const result = await generateChartExplanation('correlation', { data: 'test' })
      
      expect(result).toBe('Correlation chart explanation')
    })

    it('should generate time breakdown chart explanation', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Time breakdown explanation'
          }
        }]
      }

      mockCreate.mockResolvedValue(mockResponse)

      const result = await generateChartExplanation('timeBreakdown', { data: 'test' })
      
      expect(result).toBe('Time breakdown explanation')
    })

    it('should generate summary chart explanation', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Summary explanation'
          }
        }]
      }

      mockCreate.mockResolvedValue(mockResponse)

      const result = await generateChartExplanation('summary', { data: 'test' })
      
      expect(result).toBe('Summary explanation')
    })

    it('should handle invalid chart type', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Default explanation'
          }
        }]
      }

      mockCreate.mockResolvedValue(mockResponse)

      const result = await generateChartExplanation('invalid' as any, { data: 'test' })
      
      expect(result).toBe('Default explanation')
    })
  })

  describe('generateDailyInsight', () => {
    it('should generate daily insight with user data', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Daily insight based on user data'
          }
        }]
      }

      mockCreate.mockResolvedValue(mockResponse)

      const userData = { energy: 7, mood: 'happy' }
      const result = await generateDailyInsight(userData)
      
      expect(result).toBe('Daily insight based on user data')
    })
  })

  describe('generateWeeklySummary', () => {
    it('should generate weekly summary with week data', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Weekly summary of trends'
          }
        }]
      }

      mockCreate.mockResolvedValue(mockResponse)

      const weekData = { trends: 'upward', achievements: 'good' }
      const result = await generateWeeklySummary(weekData)
      
      expect(result).toBe('Weekly summary of trends')
    })
  })

  describe('Error handling', () => {
    it('should handle network errors', async () => {
      mockCreate.mockRejectedValue(new Error('Network error'))

      const result = await generateInsight('Test prompt')
      
      expect(result).toBe('Unable to generate insight at this time.')
    })

    it('should handle timeout errors', async () => {
      mockCreate.mockRejectedValue(new Error('Timeout'))

      const result = await generateInsight('Test prompt')
      
      expect(result).toBe('Unable to generate insight at this time.')
    })

    it('should handle malformed responses', async () => {
      const mockResponse = {
        choices: [] // Empty choices array
      }

      mockCreate.mockResolvedValue(mockResponse)

      const result = await generateInsight('Test prompt')
      
      expect(result).toBe('Unable to generate insight.')
    })
  })
})
