'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Hands } from '@mediapipe/hands'

// 제스처 감지를 위한 상수
const GESTURE_CONFIDENCE_THRESHOLD = 0.7
const TIMER_DURATION = 3000 // 3초
const MIN_VIDEO_DIMENSIONS = { width: 640, height: 480 }
const MAX_INIT_ATTEMPTS = 5

export function useGesture({ onGesture }) {
  const [isActive, setIsActive] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [gestureStartTime, setGestureStartTime] = useState(null)
  const [initAttempts, setInitAttempts] = useState(0)
  const [initError, setInitError] = useState(null)
  
  const handsRef = useRef(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const mountedRef = useRef(true)
  const processingRef = useRef(false)
  const canvasRef = useRef(null)
  const glContextRef = useRef(null)

  // WebGL 컨텍스트 초기화
  const initWebGL = useCallback(() => {
    try {
      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas')
      }
      
      const gl = canvasRef.current.getContext('webgl2', {
        antialias: true,
        preserveDrawingBuffer: true,
        premultipliedAlpha: true,
        powerPreference: 'high-performance'
      })

      if (!gl) {
        throw new Error('WebGL2 컨텍스트를 생성할 수 없습니다.')
      }

      glContextRef.current = gl
      return gl
    } catch (error) {
      console.error('WebGL 초기화 오류:', error)
      throw error
    }
  }, [])

  // MediaPipe Hands 초기화
  const initHands = useCallback(async () => {
    if (handsRef.current) {
      try {
        await handsRef.current.close()
      } catch (error) {
        console.warn('기존 MediaPipe Hands 종료 오류:', error)
      }
      handsRef.current = null
    }

    try {
      console.log('MediaPipe Hands 초기화 중...')
      
      // WebGL 컨텍스트 초기화
      const gl = initWebGL()
      
      const hands = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        }
      })

      // MediaPipe 설정 최적화
      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
        selfieMode: true
      })

      // 제스처 감지 결과 처리
      hands.onResults((results) => {
        if (!mountedRef.current || !videoRef.current || processingRef.current) return

        if (!results.multiHandLandmarks?.length || !results.multiHandedness?.length) {
          setGestureStartTime(null)
          return
        }

        const landmarks = results.multiHandLandmarks[0]
        const handedness = results.multiHandedness[0]

        if (isFistGesture(landmarks) && handedness.score > GESTURE_CONFIDENCE_THRESHOLD) {
          if (!gestureStartTime) {
            console.log('주먹 제스처 감지 시작')
            setGestureStartTime(Date.now())
          } else if (Date.now() - gestureStartTime >= TIMER_DURATION) {
            console.log('사진 촬영!')
            onGesture?.()
            setGestureStartTime(null)
          }
        } else {
          if (gestureStartTime) {
            console.log('제스처 취소')
          }
          setGestureStartTime(null)
        }
      })

      await hands.initialize()
      handsRef.current = hands
      console.log('MediaPipe Hands 초기화 완료')
    } catch (error) {
      console.error('MediaPipe Hands 초기화 실패:', error)
      throw error
    }
  }, [gestureStartTime, onGesture, initWebGL])

  // 카메라 정지
  const stopCamera = useCallback(async () => {
    console.log('카메라 정지 중...')
    processingRef.current = false
    
    if (handsRef.current) {
      try {
        await handsRef.current.close()
        console.log('MediaPipe Hands 종료됨')
      } catch (error) {
        console.warn('MediaPipe Hands 종료 오류:', error)
      }
      handsRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop()
        console.log('카메라 트랙 정지됨')
      })
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    // WebGL 리소스 정리
    if (glContextRef.current) {
      glContextRef.current.getExtension('WEBGL_lose_context')?.loseContext()
      glContextRef.current = null
    }

    if (canvasRef.current) {
      canvasRef.current = null
    }

    setIsActive(false)
    setGestureStartTime(null)
    console.log('카메라 정리 완료')
  }, [])

  // 비디오 프레임 처리
  const processVideoFrame = useCallback(async () => {
    if (!mountedRef.current || !videoRef.current || !handsRef.current || processingRef.current) return
    
    try {
      processingRef.current = true
      await handsRef.current.send({ image: videoRef.current })
    } catch (error) {
      console.error('프레임 처리 오류:', error)
    } finally {
      processingRef.current = false
      if (mountedRef.current) {
        requestAnimationFrame(processVideoFrame)
      }
    }
  }, [])

  // 카메라 시작
  const startCamera = useCallback(async () => {
    if (!mountedRef.current) return
    if (streamRef.current) return
    if (initAttempts >= MAX_INIT_ATTEMPTS) {
      setInitError('최대 초기화 시도 횟수에 도달했습니다')
      return
    }

    try {
      setInitError(null)
      setIsProcessing(true)
      setInitAttempts(prev => prev + 1)

      console.log(`카메라 초기화 시도 ${initAttempts + 1}/${MAX_INIT_ATTEMPTS}`)
      
      // 1. 카메라 접근
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { min: MIN_VIDEO_DIMENSIONS.width, ideal: 1280 },
          height: { min: MIN_VIDEO_DIMENSIONS.height, ideal: 720 },
          facingMode: 'user',
          frameRate: { ideal: 30 }
        }
      })

      if (!mountedRef.current) {
        stream.getTracks().forEach(track => track.stop())
        return
      }

      // 2. 비디오 스트림 설정
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.width = videoRef.current.videoWidth
            videoRef.current.height = videoRef.current.videoHeight
            console.log('비디오 크기:', {
              width: videoRef.current.width,
              height: videoRef.current.height
            })
            resolve()
          }
        })

        await videoRef.current.play()
        console.log('비디오 재생 시작')
      }

      // 3. MediaPipe 초기화
      await initHands()

      // 4. 프레임 처리 시작
      requestAnimationFrame(processVideoFrame)

      setIsActive(true)
      setInitAttempts(0)
      console.log('카메라 설정 완료')
    } catch (error) {
      console.error('카메라 초기화 오류:', error)
      if (mountedRef.current) {
        await stopCamera()
        
        let errorMessage = '알 수 없는 오류가 발생했습니다'
        if (error.name === 'NotAllowedError') {
          errorMessage = '카메라 접근이 거부되었습니다. 카메라 접근을 허용해주세요.'
        } else if (error.name === 'NotFoundError') {
          errorMessage = '카메라를 찾을 수 없습니다. 카메라 연결을 확인해주세요.'
        } else if (error.name === 'NotReadableError') {
          errorMessage = '카메라가 다른 애플리케이션에서 사용 중입니다.'
        } else {
          errorMessage = error.message || '카메라 초기화 실패'
        }
        
        setInitError(errorMessage)
        throw new Error(`카메라 오류: ${errorMessage}`)
      }
    } finally {
      if (mountedRef.current) {
        setIsProcessing(false)
      }
    }
  }, [initAttempts, initHands, processVideoFrame, stopCamera])

  // 카메라 재시작
  const restartCamera = useCallback(async () => {
    await stopCamera()
    setInitAttempts(0)
    setInitError(null)
    await startCamera()
  }, [stopCamera, startCamera])

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      stopCamera()
    }
  }, [stopCamera])

  return {
    isActive,
    isProcessing,
    gestureStartTime,
    startCamera,
    stopCamera,
    restartCamera,
    initError,
    initAttempts,
    videoRef
  }
}

// 주먹 제스처 감지 함수
function isFistGesture(landmarks) {
  if (!landmarks) return false

  // 손가락 끝점 인덱스
  const fingerTips = [8, 12, 16, 20] // 검지, 중지, 약지, 소지
  const fingerBases = [5, 9, 13, 17] // 각 손가락의 base 관절

  // 엄지손가락은 따로 처리 (4: 끝점, 3: 중간관절)
  const thumbTip = landmarks[4]
  const thumbIp = landmarks[3]

  // 엄지손가락이 접혔는지 확인
  const isThumbClosed = thumbTip.y > thumbIp.y

  // 다른 손가락들이 접혔는지 확인
  const areFingersClosed = fingerTips.every((tipIdx, i) => {
    const baseIdx = fingerBases[i]
    return landmarks[tipIdx].y > landmarks[baseIdx].y
  })

  return isThumbClosed && areFingersClosed
}
