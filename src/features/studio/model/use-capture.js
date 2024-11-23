'use client'

import { useState, useCallback } from 'react'

export function useCapture() {
  const [capturedImage, setCapturedImage] = useState(null)
  const [isPending, setIsPending] = useState(false)

  const handleCapture = useCallback((imageData) => {
    setCapturedImage(imageData)
  }, [])

  const handleRetake = useCallback(() => {
    setCapturedImage(null)
    setIsPending(false)
  }, [])

  const handleUpload = useCallback(async () => {
    if (!capturedImage) return

    setIsPending(true)
    try {
      // Upload logic will be implemented later
      console.log('Upload functionality will be implemented')
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setIsPending(false)
    }
  }, [capturedImage])

  return {
    capturedImage,
    isPending,
    handleCapture,
    handleRetake,
    handleUpload
  }
}
