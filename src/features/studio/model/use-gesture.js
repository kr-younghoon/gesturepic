import { useEffect, useRef, useState, useCallback } from 'react'
import { Camera } from '@mediapipe/camera_utils'
import { Hands } from '@mediapipe/hands'
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'

const TIMER_DURATION = 3 // seconds

export function useGesture({ onCapture }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION)
  const timerRef = useRef(null)
  const cameraRef = useRef(null)
  const lastGestureRef = useRef(null)
  const gestureTimeoutRef = useRef(null)

  // 제스처 감지 함수
  const detectGesture = useCallback((landmarks) => {
    if (!landmarks || landmarks.length === 0) return null

    // 손가락 끝점들의 y 좌표
    const fingerTips = [
      landmarks[4], // 엄지
      landmarks[8], // 검지
      landmarks[12], // 중지
      landmarks[16], // 약지
      landmarks[20], // 소지
    ]

    // 손가락 중간 마디의 y 좌표
    const fingerMids = [
      landmarks[3], // 엄지
      landmarks[7], // 검지
      landmarks[11], // 중지
      landmarks[15], // 약지
      landmarks[19], // 소지
    ]

    // 주먹 감지: 모든 손가락 끝이 중간 마디보다 위에 있는지 확인
    const isFist = fingerTips.every((tip, i) => tip.y > fingerMids[i].y)

    // 손바닥 감지: 모든 손가락 끝이 중간 마디보다 아래에 있는지 확인
    const isPalm = fingerTips.every((tip, i) => tip.y < fingerMids[i].y)

    if (isFist) return 'fist'
    if (isPalm) return 'palm'
    return null
  }, [])

  // 제스처에 따른 동작 처리
  const handleGesture = useCallback((gesture) => {
    if (gesture === lastGestureRef.current) return
    lastGestureRef.current = gesture

    // 이전 제스처 타임아웃 취소
    if (gestureTimeoutRef.current) {
      clearTimeout(gestureTimeoutRef.current)
    }

    // 1초 후 제스처 초기화
    gestureTimeoutRef.current = setTimeout(() => {
      lastGestureRef.current = null
    }, 1000)

    if (gesture === 'fist' && !isTimerRunning) {
      setIsTimerRunning(true)
      setTimeLeft(TIMER_DURATION)
    } else if (gesture === 'palm' && !isTimerRunning) {
      onCapture()
    }
  }, [isTimerRunning, onCapture])

  // 타이머 효과
  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (isTimerRunning && timeLeft === 0) {
      setIsTimerRunning(false)
      onCapture()
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [isTimerRunning, timeLeft, onCapture])

  // MediaPipe 초기화
  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return

    const hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      }
    })

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    })

    hands.onResults((results) => {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      
      // 캔버스 초기화
      ctx.save()
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height)

      // 손 감지 결과 그리기
      if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
          drawConnectors(ctx, landmarks, Hands.HAND_CONNECTIONS, {
            color: '#00FF00',
            lineWidth: 5
          })
          drawLandmarks(ctx, landmarks, {
            color: '#FF0000',
            lineWidth: 2
          })

          // 제스처 감지 및 처리
          const gesture = detectGesture(landmarks)
          if (gesture) {
            handleGesture(gesture)
          }
        }
      }

      ctx.restore()
    })

    // 카메라 설정
    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        await hands.send({ image: videoRef.current })
      },
      width: 1280,
      height: 720
    })

    camera.start()
    cameraRef.current = camera

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop()
      }
      hands.close()
    }
  }, [detectGesture, handleGesture])

  return {
    videoRef,
    canvasRef,
    isTimerRunning,
    timeLeft,
  }
}
