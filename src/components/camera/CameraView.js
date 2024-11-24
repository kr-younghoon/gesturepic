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
      setCapturedPhotos(prev =>
        prev.length >= 4 ? [...prev.slice(1), imageData] : [...prev, imageData]
      );
    }
  }

  useEffect(() => {
    let mounted = true;
    let stream = null;

    async function setupCamera() {
      try {
        setIsLoading(true);
        setError(null);

        if (videoRef.current && videoRef.current.srcObject) {
          return; // 이미 스트림 초기화됨
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
        });

        if (!mounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => videoRef.current.play();

        start();
      } catch (err) {
        console.error('Camera setup error:', err);
        setError(err.message);
      } finally {
        if (mounted) setIsLoading(false);
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
    return <div>카메라 오류: {error}</div>;
  }

  return (
    <div>
      {isLoading && <p>카메라 연결 중...</p>}
      <video ref={videoRef} autoPlay playsInline muted />
      <canvas ref={canvasRef} />
      {capturedPhotos.map((photo, index) => (
        <img key={index} src={photo} alt={`Captured ${index}`} />
      ))}
    </div>
  );
}
