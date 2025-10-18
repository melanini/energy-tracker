/**
 * Unit tests for QuickActions component
 */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QuickActions } from '@/components/home/quick-actions'

// Mock fetch
global.fetch = jest.fn()

describe('QuickActions Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  it('should render quick actions buttons', () => {
    render(<QuickActions />)
    
    expect(screen.getByText('Work Timer')).toBeInTheDocument()
    expect(screen.getByText('Happy Moment')).toBeInTheDocument()
  })

  it('should open pomodoro dialog when work timer is clicked', () => {
    render(<QuickActions />)
    
    const pomodoroButton = screen.getByText('Work Timer')
    fireEvent.click(pomodoroButton)
    
    expect(screen.getByText('Start Pomodoro Timer')).toBeInTheDocument()
    expect(screen.getByText('Select duration for your focused work session')).toBeInTheDocument()
  })

  it('should open happy moment dialog when record moment is clicked', () => {
    render(<QuickActions />)
    
    const happyMomentButton = screen.getByText('Record Moment')
    fireEvent.click(happyMomentButton)
    
    expect(screen.getByText('Capture a Happy Moment')).toBeInTheDocument()
    expect(screen.getByText('What made you smile today?')).toBeInTheDocument()
  })

  it('should update pomodoro duration when button is clicked', () => {
    render(<QuickActions />)
    
    const pomodoroButton = screen.getByText('Work Timer')
    fireEvent.click(pomodoroButton)
    
    const durationButton = screen.getByText('25m')
    fireEvent.click(durationButton)
    
    expect(durationButton).toHaveClass('bg-primary')
  })

  it('should update happy moment note when textarea is changed', () => {
    render(<QuickActions />)
    
    const happyMomentButton = screen.getByText('Record Moment')
    fireEvent.click(happyMomentButton)
    
    const noteTextarea = screen.getByPlaceholderText('Describe your happy moment...')
    fireEvent.change(noteTextarea, { target: { value: 'Had a great workout!' } })
    
    expect(noteTextarea).toHaveValue('Had a great workout!')
  })

  it('should start pomodoro session successfully', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'pomodoro-1', duration: 25 })
    })

    render(<QuickActions />)
    
    const pomodoroButton = screen.getByText('Work Timer')
    fireEvent.click(pomodoroButton)
    
    const startButton = screen.getByText('Start Timer')
    fireEvent.click(startButton)
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/pomodoro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          durationMin: 20,
          completed: false
        })
      })
    })
  })

  it('should save happy moment successfully', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'moment-1', note: 'Great day!' })
    })

    render(<QuickActions />)
    
    const happyMomentButton = screen.getByText('Record Moment')
    fireEvent.click(happyMomentButton)
    
    const noteTextarea = screen.getByPlaceholderText('Describe your happy moment...')
    fireEvent.change(noteTextarea, { target: { value: 'Great day!' } })
    
    const saveButton = screen.getByText('Save Moment')
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/happy-moments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note: 'Great day!',
          mood: 7
        })
      })
    })
  })

  it('should not save happy moment with empty note', async () => {
    render(<QuickActions />)
    
    const happyMomentButton = screen.getByText('Record Moment')
    fireEvent.click(happyMomentButton)
    
    const saveButton = screen.getByText('Save Moment')
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled()
    })
  })

  it('should handle pomodoro API error', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'))

    render(<QuickActions />)
    
    const pomodoroButton = screen.getByText('Work Timer')
    fireEvent.click(pomodoroButton)
    
    const startButton = screen.getByText('Start Timer')
    fireEvent.click(startButton)
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })
    
    // Dialog should still be open after error
    expect(screen.getByText('Start Pomodoro Timer')).toBeInTheDocument()
  })

  it('should handle happy moment API error', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'))

    render(<QuickActions />)
    
    const happyMomentButton = screen.getByText('Record Moment')
    fireEvent.click(happyMomentButton)
    
    const noteTextarea = screen.getByPlaceholderText('Describe your happy moment...')
    fireEvent.change(noteTextarea, { target: { value: 'Great day!' } })
    
    const saveButton = screen.getByText('Save Moment')
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })
    
    // Dialog should still be open after error
    expect(screen.getByText('Capture a Happy Moment')).toBeInTheDocument()
  })

  it('should close pomodoro dialog after successful start', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'pomodoro-1', duration: 25 })
    })

    render(<QuickActions />)
    
    const pomodoroButton = screen.getByText('Work Timer')
    fireEvent.click(pomodoroButton)
    
    expect(screen.getByText('Start Pomodoro Timer')).toBeInTheDocument()
    
    const startButton = screen.getByText('Start Timer')
    fireEvent.click(startButton)
    
    await waitFor(() => {
      expect(screen.queryByText('Start Pomodoro Timer')).not.toBeInTheDocument()
    })
  })

  it('should close happy moment dialog after successful save', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'moment-1', note: 'Great day!' })
    })

    render(<QuickActions />)
    
    const happyMomentButton = screen.getByText('Record Moment')
    fireEvent.click(happyMomentButton)
    
    expect(screen.getByText('Capture a Happy Moment')).toBeInTheDocument()
    
    const noteTextarea = screen.getByPlaceholderText('Describe your happy moment...')
    fireEvent.change(noteTextarea, { target: { value: 'Great day!' } })
    
    const saveButton = screen.getByText('Save Moment')
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(screen.queryByText('Capture a Happy Moment')).not.toBeInTheDocument()
    })
  })

  it('should reset happy moment note after successful save', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'moment-1', note: 'Great day!' })
    })

    render(<QuickActions />)
    
    const happyMomentButton = screen.getByText('Record Moment')
    fireEvent.click(happyMomentButton)
    
    const noteTextarea = screen.getByPlaceholderText('Describe your happy moment...')
    fireEvent.change(noteTextarea, { target: { value: 'Great day!' } })
    
    const saveButton = screen.getByText('Save Moment')
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(screen.queryByText('Capture a Happy Moment')).not.toBeInTheDocument()
    })
    
    // Open dialog again to check if note is reset
    fireEvent.click(happyMomentButton)
    const newNoteTextarea = screen.getByPlaceholderText('Describe your happy moment...')
    expect(newNoteTextarea).toHaveValue('')
  })

  it('should show loading state during pomodoro submission', async () => {
    ;(global.fetch as jest.Mock).mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ id: 'pomodoro-1', duration: 25 })
      }), 100))
    )

    render(<QuickActions />)
    
    const pomodoroButton = screen.getByText('Work Timer')
    fireEvent.click(pomodoroButton)
    
    const startButton = screen.getByText('Start Timer')
    fireEvent.click(startButton)
    
    // Should show loading state
    expect(screen.getByText('Starting...')).toBeInTheDocument()
    
    await waitFor(() => {
      expect(screen.queryByText('Starting...')).not.toBeInTheDocument()
    })
  })

  it('should show loading state during happy moment submission', async () => {
    ;(global.fetch as jest.Mock).mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ id: 'moment-1', note: 'Great day!' })
      }), 100))
    )

    render(<QuickActions />)
    
    const happyMomentButton = screen.getByText('Record Moment')
    fireEvent.click(happyMomentButton)
    
    const noteTextarea = screen.getByPlaceholderText('Describe your happy moment...')
    fireEvent.change(noteTextarea, { target: { value: 'Great day!' } })
    
    const saveButton = screen.getByText('Save Moment')
    fireEvent.click(saveButton)
    
    // Should show loading state
    expect(screen.getByText('Saving...')).toBeInTheDocument()
    
    await waitFor(() => {
      expect(screen.queryByText('Saving...')).not.toBeInTheDocument()
    })
  })

  it('should handle cancel button in pomodoro dialog', () => {
    render(<QuickActions />)
    
    const pomodoroButton = screen.getByText('Work Timer')
    fireEvent.click(pomodoroButton)
    
    expect(screen.getByText('Start Pomodoro Timer')).toBeInTheDocument()
    
    // Close dialog by clicking outside or pressing escape
    fireEvent.keyDown(document, { key: 'Escape' })
    
    expect(screen.queryByText('Start Pomodoro Timer')).not.toBeInTheDocument()
  })

  it('should handle cancel button in happy moment dialog', () => {
    render(<QuickActions />)
    
    const happyMomentButton = screen.getByText('Record Moment')
    fireEvent.click(happyMomentButton)
    
    expect(screen.getByText('Capture a Happy Moment')).toBeInTheDocument()
    
    // Close dialog by clicking outside or pressing escape
    fireEvent.keyDown(document, { key: 'Escape' })
    
    expect(screen.queryByText('Capture a Happy Moment')).not.toBeInTheDocument()
  })
})
