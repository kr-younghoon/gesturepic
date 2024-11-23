'use client'

import { useRef, useState, useEffect } from 'react'
import { useGesture } from '../model/use-gesture'
import { useCapture } from '../model/use-capture'

const TIMER_DURATION = 3 // seconds

export function CameraView() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [error, setError] = useState(null)
  const [remainingTime, setRemainingTime] = useState(null)
  const mountedRef = useRef(true)

  const { capturedImage, handleCapture, handleRetake } = useCapture()
  
  const { 
    isActive,
    isProcessing,
    gestureStartTime,
    startCamera,
    stopCamera,
    restartCamera,
    initError,
    initAttempts,
    videoRef: gestureVideoRef
  } = useGesture({
    onGesture: () => {
      if (videoRef.current && canvasRef.current) {
        handleCapture(videoRef, canvasRef)
      }
    }
  })

  // 비디오 참조 동기화
  useEffect(() => {
    if (videoRef.current) {
      gestureVideoRef.current = videoRef.current
      console.log('Video reference synchronized')
    }
  }, [gestureVideoRef])

  // 카메라 초기화
  useEffect(() => {
    const initializeCamera = async () => {
      if (!mountedRef.current) return

      try {
        console.log('Starting camera initialization...')
        await startCamera()
        if (mountedRef.current) {
          console.log('Camera initialized successfully')
          setError(null)
        }
      } catch (err) {
        console.error('Camera initialization failed:', err)
        if (mountedRef.current) {
          setError(`Camera error: ${err.message}`)
        }
      }
    }

    initializeCamera()

    return () => {
      console.log('Cleaning up camera...')
      mountedRef.current = false
      stopCamera()
    }
  }, []) // Remove dependencies to prevent re-initialization

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  // 남은 시간 업데이트
  useEffect(() => {
    if (!gestureStartTime) {
      setRemainingTime(null)
      return
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - gestureStartTime
      const remaining = Math.ceil((TIMER_DURATION - elapsed) / 1000)
      
      if (remaining <= 0) {
        clearInterval(interval)
        setRemainingTime(null)
      } else {
        setRemainingTime(remaining)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [gestureStartTime])

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-900 text-white p-4">
        <div className="text-center max-w-md">
          <div className="bg-red-500 bg-opacity-10 p-4 rounded-lg mb-4">
            <p className="text-red-500 font-medium mb-2">Camera Error</p>
            <p className="text-sm text-gray-300">{error}</p>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-gray-400">
              Common solutions:
              <ul className="list-disc text-left pl-4 mt-2 space-y-1">
                <li>Check if camera permissions are granted in your browser settings</li>
                <li>Make sure no other application is using your camera</li>
                <li>Try refreshing the page</li>
              </ul>
            </p>
            <button
              onClick={() => {
                console.log('Retrying camera initialization...')
                setError(null)
                startCamera()
              }}
              className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <div className="relative w-full h-full bg-black">
        {/* 비디오 컨테이너 */}
        <div className="relative w-full h-full">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />
          {/* 캡처용 캔버스 */}
          <canvas
            ref={canvasRef}
            className="hidden"
          />
          {/* 캡처된 이미지 */}
          {capturedImage && (
            <img
              src={capturedImage}
              alt="Captured"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </div>
      </div>
      
      {/* 상태 표시 UI */}
      <div className="absolute inset-x-0 top-4 flex justify-center">
        {isProcessing ? (
          <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-full">
            Initializing camera...
          </div>
        ) : remainingTime ? (
          <div className="bg-black bg-opacity-50 text-white px-6 py-3 rounded-full text-2xl">
            {remainingTime}
          </div>
        ) : isActive && !capturedImage ? (
          <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-full">
            Make a fist to start timer ✊
          </div>
        ) : null}
      </div>

      {/* 에러 메시지 및 재시작 버튼 */}
      {initError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 p-4">
          <p className="text-white text-center mb-4">{initError}</p>
          <button
            onClick={restartCamera}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            disabled={isProcessing}
          >
            {isProcessing ? 'Restarting...' : 'Restart Camera'}
          </button>
        </div>
      )}

      {/* 컨트롤 버튼 */}
      {capturedImage && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
          <button
            onClick={handleRetake}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Retake
          </button>
          <button
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Save
          </button>
        </div>
      )}
    </div>
  )
}
