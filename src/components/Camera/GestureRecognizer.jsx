'use client';

import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision';

const VALID_GESTURES = ['Victory', 'Closed_Fist'];

const GestureRecognizerComponent = ({ stream, onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const gestureRecognizerRef = useRef(null);
  const lastVideoTime = useRef(-1);
  const [currentGesture, setCurrentGesture] = useState(null);
  const [gestureStartTime, setGestureStartTime] = useState(null);
  const [gestureConfidence, setGestureConfidence] = useState(0);

  useEffect(() => {
    const initializeGestureRecognizer = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );

        gestureRecognizerRef.current = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        setIsInitialized(true);
        console.log("GestureRecognizer initialized successfully");
      } catch (error) {
        console.error("GestureRecognizer 초기화 실패:", error);
      }
    };

    initializeGestureRecognizer();

    return () => {
      if (gestureRecognizerRef.current) {
        gestureRecognizerRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (!isInitialized || !videoRef.current) return;

    const video = videoRef.current;
    let animationFrameId;

    const predictWebcam = async () => {
      if (!video.videoWidth) {
        animationFrameId = requestAnimationFrame(predictWebcam);
        return;
      }

      // 비디오가 재생 중이고 새로운 프레임이 있는 경우에만 처리
      if (video.currentTime !== lastVideoTime.current) {
        lastVideoTime.current = video.currentTime;
        
        // 캔버스에 현재 비디오 프레임 그리기
        const ctx = canvasRef.current.getContext('2d');
        
        // 캔버스 크기를 424x565로 고정
        const targetWidth = 424;
        const targetHeight = 565;
        canvasRef.current.width = targetWidth;
        canvasRef.current.height = targetHeight;
        
        // 비디오 비율 계산
        const videoAspect = video.videoWidth / video.videoHeight;
        const targetAspect = targetWidth / targetHeight;
        
        let sx = 0, sy = 0, sWidth = video.videoWidth, sHeight = video.videoHeight;
        
        if (videoAspect > targetAspect) {
          // 비디오가 더 넓은 경우
          sWidth = video.videoHeight * targetAspect;
          sx = (video.videoWidth - sWidth) / 2;
        } else {
          // 비디오가 더 높은 경우
          sHeight = video.videoWidth / targetAspect;
          sy = (video.videoHeight - sHeight) / 2;
        }
        
        // 비디오 프레임을 캔버스에 그리기
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        ctx.drawImage(
          video,
          sx, sy, sWidth, sHeight,
          0, 0, targetWidth, targetHeight
        );
        
        try {
          const results = await gestureRecognizerRef.current.recognizeForVideo(video, performance.now());
          if (results.gestures?.length > 0) {
            const gesture = results.gestures[0][0];
            const detectedGesture = gesture.categoryName;
            const confidence = gesture.score;

            // 유효한 제스처인지 확인
            if (VALID_GESTURES.includes(detectedGesture) && confidence > 0.7) {
              setGestureConfidence(confidence);
              
              if (currentGesture === detectedGesture) {
                const currentTime = Date.now();
                if (
                  gestureStartTime &&
                  currentTime - gestureStartTime >= 3000 // 3초 유지 확인
                ) {
                  const imageData = canvasRef.current.toDataURL('image/png');
                  onCapture(imageData); // 이미지 캡처 데이터 전달
                  resetGesture(); // 상태 초기화
                }
              } else {
                setCurrentGesture(detectedGesture);
                setGestureStartTime(Date.now());
              }
            } else {
              resetGesture();
            }
          } else {
            resetGesture();
          }
        } catch (error) {
          console.error("Gesture recognition error:", error);
        }
      }

      animationFrameId = requestAnimationFrame(predictWebcam);
    };

    predictWebcam();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isInitialized, videoRef, onCapture, currentGesture, gestureStartTime]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err => {
        console.error("비디오 재생 실패:", err);
      });
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [stream]);

  // 제스처 초기화
  const resetGesture = () => {
    setCurrentGesture(null);
    setGestureStartTime(null);
    setGestureConfidence(0);
  };

  const getGestureDisplayName = (gesture) => {
    switch (gesture) {
      case 'Victory':
        return '브이';
      case 'Closed_Fist':
        return '주먹';
      default:
        return gesture;
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        autoPlay
        muted
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full object-contain"
      />
      {currentGesture && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
          {getGestureDisplayName(currentGesture)} ({Math.round(gestureConfidence * 100)}%)
        </div>
      )}
      <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded text-center">
        브이(✌️) 또는 주먹(✊)을 3초간 유지해주세요
      </div>
    </div>
  );
};

export default GestureRecognizerComponent;
