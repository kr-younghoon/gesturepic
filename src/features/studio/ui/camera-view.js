'use client'

import { useGesture } from '../model/use-gesture'
import { useCallback } from 'react'
import { useCapture } from '../model/use-capture'

export function CameraView() {
  const {
    capturedImage,
    isCaptureMode,
    isPending,
    handleCapture: onCapture,
    handleRetake,
    handleUpload,
  } = useCapture()

  const handleCapture = useCallback(() => {
    onCapture(videoRef, canvasRef)
  }, [onCapture, videoRef, canvasRef])

  const { videoRef, canvasRef, isTimerRunning, timeLeft } = useGesture({
    onCapture: handleCapture,
  })

  if (!isCaptureMode) {
    return (
      <div className="relative w-full max-w-4xl mx-auto">
        <div className="relative">
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full aspect-video rounded-lg"
          />
          <div className="absolute bottom-4 left-4 right-4 flex gap-4 justify-center">
            <button
              onClick={handleRetake}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              disabled={isPending}
            >
              Retake
            </button>
            <button
              onClick={handleUpload}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              disabled={isPending}
            >
              {isPending ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      </div>
    )
  }

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
