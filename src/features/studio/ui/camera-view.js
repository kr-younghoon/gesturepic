'use client'

import { useRef, useState } from 'react'

export function CameraView() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [error, setError] = useState(null)
  const [capturedImage, setCapturedImage] = useState(null)
  const [isCapturing, setIsCapturing] = useState(false)

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageData);
    } catch (error) {
      setError('Failed to capture image');
      console.error('Capture error:', error);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setError(null);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-900 text-white p-4">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={handleRetake}
            className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        className="hidden"
      />
      {capturedImage && (
        <img
          src={capturedImage}
          alt="Captured"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
        {!capturedImage ? (
          <button
            onClick={handleCapture}
            disabled={isCapturing}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Capture
          </button>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
