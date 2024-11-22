'use client'

import { useCallback, useState } from 'react'
import { useUploadPhoto } from '@/features/photos/model/use-photos'
import { useRouter } from 'next/navigation'

export function useCapture() {
  const [capturedImage, setCapturedImage] = useState(null)
  const [isCaptureMode, setIsCaptureMode] = useState(true)
  const { mutateAsync: uploadPhoto, isPending } = useUploadPhoto()
  const router = useRouter()

  const handleCapture = useCallback((videoRef, canvasRef) => {
    const canvas = canvasRef.current
    const video = videoRef.current
    const context = canvas.getContext('2d')

    // Flip horizontally to mirror the video
    context.scale(-1, 1)
    context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height)
    // Reset transform
    context.setTransform(1, 0, 0, 1, 0, 0)

    const imageData = canvas.toDataURL('image/jpeg', 0.8)
    setCapturedImage(imageData)
    setIsCaptureMode(false)
  }, [])

  const handleRetake = useCallback(() => {
    setCapturedImage(null)
    setIsCaptureMode(true)
  }, [])

  const handleUpload = useCallback(async () => {
    if (!capturedImage) return

    try {
      // Convert base64 to blob
      const response = await fetch(capturedImage)
      const blob = await response.blob()

      // Create a File object
      const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' })

      await uploadPhoto(file)
      router.push('/gallery')
    } catch (error) {
      console.error('Failed to upload photo:', error)
    }
  }, [capturedImage, uploadPhoto, router])

  return {
    capturedImage,
    isCaptureMode,
    isPending,
    handleCapture,
    handleRetake,
    handleUpload,
  }
}
