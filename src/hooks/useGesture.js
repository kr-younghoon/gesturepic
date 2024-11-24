'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { GestureRecognizer, FilesetResolver } from '@mediapipe/tasks-vision';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { HAND_CONNECTIONS } from '@mediapipe/hands';

const GESTURE_CONFIG = {
  modelPath: 'https://storage.googleapis.com/mediapipe-tasks/gesture_recognizer/gesture_recognizer.task',
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
};

export function useGesture({ onGesture }) {
  const [currentGesture, setCurrentGesture] = useState(null);
  const gestureRecognizerRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  const processResults = useCallback((results) => {
    const canvasCtx = canvasRef.current?.getContext('2d');
    if (!canvasCtx || !videoRef.current) return;

    // Ensure video is playing and has valid dimensions
    if (!videoRef.current.videoWidth || !videoRef.current.videoHeight) return;

    // Update canvas dimensions if they don't match video
    if (canvasRef.current.width !== videoRef.current.videoWidth) {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
    }

    // 캔버스 초기화
    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    canvasCtx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

    // 손 랜드마크 시각화
    if (results.landmarks) {
      for (const landmarks of results.landmarks) {
        // 연결선 그리기
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
          color: '#00FF00',
          lineWidth: 3
        });
        // 랜드마크 포인트 그리기
        drawLandmarks(canvasCtx, landmarks, {
          color: '#FF0000',
          lineWidth: 1,
          radius: 3
        });
      }
    }

    // 제스처 감지 및 처리
    if (results.gestures?.length > 0) {
      const gesture = results.gestures[0][0];
      if (gesture.score > GESTURE_CONFIG.minDetectionConfidence) {
        setCurrentGesture(gesture.categoryName);
        onGesture?.();
      }
    } else {
      setCurrentGesture(null);
    }
  }, [onGesture]);

  const detectGesture = useCallback(async () => {
    if (!videoRef.current || !gestureRecognizerRef.current) return;
    
    // Skip if video dimensions are not ready
    if (!videoRef.current.videoWidth || !videoRef.current.videoHeight) {
      animationFrameRef.current = requestAnimationFrame(detectGesture);
      return;
    }

    try {
      const results = await gestureRecognizerRef.current.recognizeForVideo(
        videoRef.current,
        Date.now()
      );
      processResults(results);
    } catch (error) {
      console.error('Gesture detection error:', error);
    }

    animationFrameRef.current = requestAnimationFrame(detectGesture);
  }, [processResults]);

  const start = useCallback(async () => {
    if (gestureRecognizerRef.current) return;
  
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );
  
      gestureRecognizerRef.current = await GestureRecognizer.createFromOptions(
        vision,
        {
          baseOptions: { modelAssetPath: GESTURE_CONFIG.modelPath },
          runningMode: 'VIDEO',
          numHands: 2,
        }
      );
  
      if (videoRef.current?.readyState >= 2) {
        detectGesture();
      } else {
        videoRef.current?.addEventListener('loadeddata', detectGesture);
      }
    } catch (err) {
      console.error('GestureRecognizer initialization error:', err);
    }
  }, [detectGesture]);
  

  const stop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (gestureRecognizerRef.current) {
      gestureRecognizerRef.current.close();
      gestureRecognizerRef.current = null;
    }

    setCurrentGesture(null);
  }, []);

  useEffect(() => {
    return () => {
      stop();
      videoRef.current?.removeEventListener('loadeddata', detectGesture);
    };
  }, [stop, detectGesture]);

  return {
    currentGesture,
    start,
    stop,
    videoRef,
    canvasRef,
  };
}
