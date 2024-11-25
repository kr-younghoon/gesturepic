'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision';
import GestureEffects from '../Effect/GestureEffects';

const VALID_GESTURES = ['Victory', 'Closed_Fist'];

const GestureRecognizerComponent = ({ stream, onCapture, onGestureDetected }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const gestureRecognizerRef = useRef(null);
  const lastVideoTime = useRef(-1);
  const [currentGesture, setCurrentGesture] = useState(null);
  const [gestureStartTime, setGestureStartTime] = useState(null);
  const [gestureConfidence, setGestureConfidence] = useState(0);
  const isCapturing = useRef(false);
  const effectCanvasRef = useRef(null);
  const captureTimeoutRef = useRef(null);
  const [lastValidGesture, setLastValidGesture] = useState(null);
  const gestureTimeoutRef = useRef(null);

  const handleEffectRender = useCallback((effectCanvas) => {
    effectCanvasRef.current = effectCanvas;
  }, []);

  const resetGesture = useCallback(() => {
    setCurrentGesture(null);
    setGestureStartTime(null);
    setGestureConfidence(0);
    if (captureTimeoutRef.current) {
      clearTimeout(captureTimeoutRef.current);
      captureTimeoutRef.current = null;
    }
  }, []);

  const handleGestureChange = useCallback((detectedGesture, confidence) => {
    // 현재 감지된 제스처가 유효하고 신뢰도가 높은 경우
    if (VALID_GESTURES.includes(detectedGesture) && confidence > 0.7) {
      // 이전 타임아웃이 있다면 취소
      if (gestureTimeoutRef.current) {
        clearTimeout(gestureTimeoutRef.current);
        gestureTimeoutRef.current = null;
      }
      
      // 새로운 제스처가 감지되면 바로 알림
      if (lastValidGesture !== detectedGesture) {
        setLastValidGesture(detectedGesture);
        onGestureDetected?.(detectedGesture);
      }
    } else {
      // 제스처가 감지되지 않은 경우
      if (lastValidGesture && !gestureTimeoutRef.current) {
        // 1초 동안 기다린 후 제스처를 null로 설정
        gestureTimeoutRef.current = setTimeout(() => {
          // 타임아웃 시점에 다시 한번 체크
          if (!VALID_GESTURES.includes(detectedGesture) || confidence <= 0.7) {
            setLastValidGesture(null);
            onGestureDetected?.(null);
          }
          gestureTimeoutRef.current = null;
        }, 1000);
      }
    }
  }, [onGestureDetected, lastValidGesture]);

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
          numHands: 2,  // 두 손 인식
          runningMode: "VIDEO"
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
      const canvas = canvasRef.current;
      if (!video.videoWidth || !canvas) {
        animationFrameId = requestAnimationFrame(predictWebcam);
        return;
      }

      // 비디오가 재생 중이고 새로운 프레임이 있는 경우에만 처리
      if (video.currentTime !== lastVideoTime.current) {
        lastVideoTime.current = video.currentTime;
        
        // 캔버스에 현재 비디오 프레임 그리기
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          animationFrameId = requestAnimationFrame(predictWebcam);
          return;
        }
        
        // 캔버스 크기를 424x565로 고정
        const targetWidth = 424;
        const targetHeight = 565;
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
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
        
        try {
          // 비디오 프레임을 캔버스에 그리기
          ctx.fillStyle = 'black';
          ctx.fillRect(0, 0, targetWidth, targetHeight);
          ctx.drawImage(
            video,
            sx, sy, sWidth, sHeight,
            0, 0, targetWidth, targetHeight
          );

          // Three.js 효과가 있다면 합성
          if (effectCanvasRef.current) {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.drawImage(
              effectCanvasRef.current,
              0, 0, effectCanvasRef.current.width, effectCanvasRef.current.height,
              0, 0, targetWidth, targetHeight
            );
            ctx.restore();
          }

          const results = await gestureRecognizerRef.current.recognizeForVideo(video, performance.now());
          
          // 랜드마크 그리기
          if (results.landmarks) {
            // 스케일 계수 계산
            const scaleX = targetWidth / video.videoWidth;
            const scaleY = targetHeight / video.videoHeight;
            
            results.landmarks.forEach((landmarks) => {
              // 각 랜드마크 포인트 그리기
              landmarks.forEach((landmark) => {
                const x = (landmark.x * video.videoWidth - sx) * (targetWidth / sWidth);
                const y = (landmark.y * video.videoHeight - sy) * (targetHeight / sHeight);
                
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, 2 * Math.PI);
                ctx.fillStyle = '#00FF00';
                ctx.fill();
              });
              
              // 랜드마크 연결선 그리기
              ctx.beginPath();
              ctx.strokeStyle = '#00FF00';
              ctx.lineWidth = 2;
              
              // 손가락 연결
              const fingerConnections = [
                [0, 1], [1, 2], [2, 3], [3, 4], // 엄지
                [0, 5], [5, 6], [6, 7], [7, 8], // 검지
                [0, 9], [9, 10], [10, 11], [11, 12], // 중지
                [0, 13], [13, 14], [14, 15], [15, 16], // 약지
                [0, 17], [17, 18], [18, 19], [19, 20], // 소지
              ];
              
              fingerConnections.forEach(([i, j]) => {
                const x1 = (landmarks[i].x * video.videoWidth - sx) * (targetWidth / sWidth);
                const y1 = (landmarks[i].y * video.videoHeight - sy) * (targetHeight / sHeight);
                const x2 = (landmarks[j].x * video.videoWidth - sx) * (targetWidth / sWidth);
                const y2 = (landmarks[j].y * video.videoHeight - sy) * (targetHeight / sHeight);
                
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
              });
              
              ctx.stroke();
            });
          }

          if (results.gestures?.length > 0) {
            const gesture = results.gestures[0][0];
            const detectedGesture = gesture.categoryName;
            const confidence = gesture.score;

            handleGestureChange(detectedGesture, confidence);
            
            if (VALID_GESTURES.includes(detectedGesture) && confidence > 0.7) {
              setGestureConfidence(confidence);
              
              if (currentGesture === detectedGesture) {
                const currentTime = Date.now();
                if (gestureStartTime && !isCapturing.current) {
                  // 제스처가 감지되면 부모 컴포넌트에 알림
                  onGestureDetected?.(detectedGesture);
                  
                  if (currentTime - gestureStartTime >= 3000) {
                    isCapturing.current = true; // 캡처 중 플래그 설정
                    
                    // 캡처 작업을 비동기로 처리
                    const captureImage = async () => {
                      try {
                        const imageData = canvas.toDataURL('image/png');
                        await onCapture(imageData);
                      } finally {
                        // 캡처 완료 후 1초 뒤에 상태 초기화
                        captureTimeoutRef.current = setTimeout(() => {
                          isCapturing.current = false;
                          resetGesture();
                        }, 1000);
                      }
                    };
                    
                    captureImage();
                  }
                }
              } else if (!isCapturing.current) {
                setCurrentGesture(detectedGesture);
                setGestureStartTime(Date.now());
              }
            } else if (!isCapturing.current) {
              resetGesture();
            }
          } else if (!isCapturing.current) {
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
  }, [isInitialized, videoRef, onCapture, currentGesture, gestureStartTime, onGestureDetected]);

  useEffect(() => {
    let mounted = true;
    
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err => {
        if (mounted) {
          console.error("비디오 재생 실패:", err);
        }
      });
    }

    return () => {
      mounted = false;
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      }
    };
  }, [stream]);

  useEffect(() => {
    return () => {
      if (captureTimeoutRef.current) {
        clearTimeout(captureTimeoutRef.current);
      }
      if (gestureRecognizerRef.current) {
        gestureRecognizerRef.current.close();
      }
    };
  }, []);

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
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        className="absolute top-0 left-0 w-full h-full object-cover invisible"
        playsInline
        autoPlay
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full object-contain"
      />
      <GestureEffects gesture={currentGesture} onRender={handleEffectRender} />
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
