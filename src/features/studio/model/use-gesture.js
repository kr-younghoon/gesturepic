'use client'

import { useState, useCallback } from 'react'

export function useGesture() {
  const [isActive, setIsActive] = useState(false)

  const startCamera = useCallback(async () => {
    try {
      setIsActive(true)
    } catch (error) {
      console.error('Failed to start camera:', error)
      throw error
    }
  }, [])

  const stopCamera = useCallback(() => {
    setIsActive(false)
  }, [])

  return {
    isActive,
    startCamera,
    stopCamera
  }
}
