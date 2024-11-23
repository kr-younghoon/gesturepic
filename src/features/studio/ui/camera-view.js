'use client'

import { useRef, useState, useEffect } from 'react'
import { useGesture } from '../model/use-gesture'
import { useCapture } from '../model/use-capture'
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'
import { HAND_CONNECTIONS } from '@mediapipe/hands'

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
    videoRef: gestureVideoRef,
    onHandsResults
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

  // 캔버스 크기 설정
  useEffect(() => {
    if (videoRef.current && canvasRef.current) {
      const setCanvasSize = () => {
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
      }
      videoRef.current.addEventListener('loadedmetadata', setCanvasSize)
      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('loadedmetadata', setCanvasSize)
        }
      }
    }
  }, [])

  // 손 감지 결과 처리
  const handleResults = (results) => {
    if (!canvasRef.current || !results) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    // 캔버스 초기화
    ctx.save()
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 카메라 피드 그리기
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height)

    // 손 스켈레톤 그리기
    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        // 연결선 그리기
        drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
          color: '#00FF00',
          lineWidth: 5
        })
        // 랜드마크 포인트 그리기
        drawLandmarks(ctx, landmarks, {
          color: '#FF0000',
          lineWidth: 2,
          radius: 4
        })
      }
    }

    ctx.restore()
    
    // 원래의 결과 처리기 호출
    onHandsResults?.(results)
  }

  // 카메라 초기화
  useEffect(() => {
    const initializeCamera = async () => {
      if (!mountedRef.current) return

      try {
        console.log('Starting camera initialization...')
        await startCamera(handleResults)
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
  }, []) // 빈 의존성 배열로 변경

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
      const remaining = Math.ceil((TIMER_DURATION - elapsed / 1000))
      
      if (remaining <= 0) {
        clearInterval(interval)
        setRemainingTime(null)
      } else {
        setRemainingTime(remaining)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [gestureStartTime])

  if (capturedImage) {
    return (
      <div className="relative w-full h-full">
        <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
        <button
          onClick={handleRetake}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          다시 찍기
        </button>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          className="hidden"
          playsInline
          autoPlay
          muted
          style={{ width: 0 }}
        />
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />
      </div>
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded-lg">
            <p className="text-red-500">{error}</p>
            <button
              onClick={restartCamera}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
            >
              다시 시도
            </button>
          </div>
        </div>
      )}
      {remainingTime && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-6xl text-white font-bold">{remainingTime}</div>
        </div>
      )}
      {isProcessing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white">카메라 초기화 중...</div>
        </div>
      )}
    </div>
  )
}
