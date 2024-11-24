'use client';

import { useRef, useEffect, useState } from 'react';
import { useGesture } from '@/hooks/useGesture';
import { useCapture } from '@/hooks/useCapture';

export function CameraView() {
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { currentGesture, start, stop, videoRef, canvasRef } = useGesture({
    onGesture: handleCapture,
  });
  const { handleCapture: capturePhoto } = useCapture();

  function handleCapture() {
    const imageData = capturePhoto(videoRef, canvasRef);
    if (imageData) {
      setCapturedPhotos(prev => [...prev.slice(-3), imageData]);
    }
  }

  useEffect(() => {
    let mounted = true;
    let stream = null;

    async function setupCamera() {
      try {
        setIsLoading(true);
        setError(null);
        
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user',
            aspectRatio: 4/3
          } 
        });
        
        if (!mounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await new Promise((resolve) => {
            videoRef.current.onloadedmetadata = () => {
              if (canvasRef.current) {
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
              }
              videoRef.current.play();
            };
            videoRef.current.onloadeddata = () => {
              resolve();
            };
          });
          start();
        }
      } catch (err) {
        if (mounted) {
          console.error('Error accessing camera:', err);
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    setupCamera();

    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      stop();
    };
  }, [start, stop]);

  if (error) {
    return (
      <div className="camera-error">
        <p>카메라 접근 오류: {error}</p>
        <p>카메라 권한을 확인해주세요.</p>
      </div>
    );
  }

  return (
    <div className="camera-view">
      <div className="video-container">
        {isLoading && (
          <div className="loading-overlay">
            <p>카메라 연결 중...</p>
          </div>
        )}
        <video ref={videoRef} className="video-feed" autoPlay playsInline muted />
        <canvas ref={canvasRef} className="video-canvas" />
        <div className="gesture-guide">
          {currentGesture 
            ? `${currentGesture} detected!` 
            : 'Show your gesture to take a photo'}
        </div>
      </div>
      {capturedPhotos.length > 0 && (
        <div className="photo-preview">
          {capturedPhotos.map((photo, index) => (
            <img 
              key={index} 
              src={photo} 
              alt={`Captured ${index + 1}`}
              onClick={() => window.open(photo)}
              className="preview-image"
            />
          ))}
        </div>
      )}
      <style jsx>{`
        .camera-view {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background-color: #f8f8f8;
        }
        .video-container {
          position: relative;
          width: 640px;
          height: 480px;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .video-feed,
        .video-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          font-size: 18px;
          z-index: 20;
        }
        .camera-error {
          text-align: center;
          padding: 20px;
          background: #fee;
          border-radius: 10px;
          color: #c00;
        }
        .gesture-guide {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 10px 20px;
          border-radius: 20px;
          font-size: 16px;
          z-index: 10;
        }
        .photo-preview {
          display: flex;
          gap: 10px;
          margin-top: 20px;
          padding: 10px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .preview-image {
          width: 100px;
          height: 100px;
          border-radius: 8px;
          object-fit: cover;
          transition: transform 0.2s;
          cursor: pointer;
        }
        .preview-image:hover {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
}
