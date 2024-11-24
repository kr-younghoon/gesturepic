import React, { useEffect, useRef, useState } from 'react';
import { processGesture } from '../../services/gestureService';

const GestureRecognizer = ({ stream, onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const gestureRecognizerRef = useRef(null); // gestureRecognizerRef 선언
  const [currentGesture, setCurrentGesture] = useState(null);
  const [gestureStartTime, setGestureStartTime] = useState(null);

  useEffect(() => {
    const initializeGestureRecognizer = async () => {
      try {
        const { GestureRecognizer } = await import('@mediapipe/tasks-vision');

        // Mediapipe GestureRecognizer 초기화
        const gestureRecognizer = new GestureRecognizer({
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer.task',
          },
          runningMode: 'VIDEO',
        });

        gestureRecognizerRef.current = gestureRecognizer;

        // 비디오 스트림 설정
        videoRef.current.srcObject = stream;
        videoRef.current.play();

        // 프레임 처리
        const processFrame = async () => {
          if (!gestureRecognizerRef.current || videoRef.current.paused) return;

          const results = await gestureRecognizerRef.current.recognize(
            videoRef.current
          );

          processResults(results);
          requestAnimationFrame(processFrame); // 반복 호출
        };

        videoRef.current.addEventListener('play', processFrame);
      } catch (err) {
        console.error('GestureRecognizer 초기화 실패:', err);
      }
    };

    initializeGestureRecognizer();

    return () => {
      if (gestureRecognizerRef.current) {
        gestureRecognizerRef.current.close();
        gestureRecognizerRef.current = null; // 리소스 정리
      }
    };
  }, [stream]);

  // 결과 처리
  const processResults = (results) => {
    if (results.gestures && results.gestures.length > 0) {
      const topGesture = results.gestures[0].categoryName;

      // 유효한 제스처인지 확인
      if (processGesture(topGesture)) {
        if (currentGesture === topGesture) {
          const currentTime = Date.now();
          if (gestureStartTime && currentTime - gestureStartTime >= 3000) {
            const imageData = canvasRef.current.toDataURL('image/png');
            onCapture(imageData);
            resetGesture();
          }
        } else {
          setCurrentGesture(topGesture);
          setGestureStartTime(Date.now());
        }
      } else {
        resetGesture();
      }
    } else {
      resetGesture();
    }
  };

  // 제스처 초기화
  const resetGesture = () => {
    setCurrentGesture(null);
    setGestureStartTime(null);
  };

  return (
    <div className="relative">
      <video ref={videoRef} className="hidden" playsInline muted />
      <canvas ref={canvasRef} className="w-full h-64 border border-gray-300" />
    </div>
  );
};

export default GestureRecognizer;
