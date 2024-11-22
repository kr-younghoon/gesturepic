'use client'

import { useGesture } from '../model/use-gesture'
import { useCallback } from 'react'

export function CameraView() {
  const handleCapture = useCallback(() => {
    // TODO: 캡처 로직 구현
    console.log('Captured!')
  }, [])

  const { videoRef, canvasRef, isTimerRunning, timeLeft } = useGesture({
    onCapture: handleCapture,
  })

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Hidden Video Element */}
      <video
        ref={videoRef}
        className="hidden"
        playsInline
      />

      {/* Canvas for Drawing */}
      <canvas
        ref={canvasRef}
        className="w-full aspect-video rounded-lg bg-black"
        width={1280}
        height={720}
      />

      {/* Timer Overlay */}
      {isTimerRunning && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-9xl font-bold text-white drop-shadow-lg animate-pulse">
            {timeLeft}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-4 rounded-lg">
        <h3 className="font-bold mb-2">Gesture Controls:</h3>
        <ul className="space-y-1">
          <li>✊ Make a fist to start {TIMER_DURATION}-second timer</li>
          <li>✋ Show palm to capture immediately</li>
        </ul>
      </div>
    </div>
  )
}
