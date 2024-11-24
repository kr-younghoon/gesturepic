"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

let handsInstance = null;

const HandGesture = ({ id }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !videoRef.current || !canvasRef.current || isInitialized) {
      return;
    }

    const initializeHandTracking = async () => {
      try {
        // 기존 인스턴스가 있다면 정리
        if (handsInstance) {
          await handsInstance.close();
          handsInstance = null;
        }

        // 새 인스턴스 생성
        handsInstance = new Hands({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${file}`;
          },
        });

        await handsInstance.initialize();

        handsInstance.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        handsInstance.onResults((results) => {
          const canvas = canvasRef.current;
          if (!canvas) return;

          const canvasCtx = canvas.getContext('2d');
          canvasCtx.save();
          canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

          canvasCtx.drawImage(
            results.image,
            0,
            0,
            canvas.width,
            canvas.height
          );

          if (results.multiHandLandmarks) {
            for (const landmarks of results.multiHandLandmarks) {
              drawConnectors(canvasCtx, landmarks, Hands.HAND_CONNECTIONS, {
                color: '#00FF00',
                lineWidth: 5,
              });
              drawLandmarks(canvasCtx, landmarks, {
                color: '#FF0000',
                lineWidth: 2,
              });
            }
          }
          canvasCtx.restore();
        });

        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current && handsInstance) {
              await handsInstance.send({ image: videoRef.current });
            }
          },
          width: 400,
          height: 400,
        });

        await camera.start();
        setIsInitialized(true);
        console.log(`Camera ${id} initialized successfully`);
      } catch (error) {
        console.error(`Error initializing camera ${id}:`, error);
      }
    };

    initializeHandTracking();

    return () => {
      // cleanup
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
      if (handsInstance) {
        handsInstance.close();
        handsInstance = null;
      }
    };
  }, [id, isInitialized]);

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        className="absolute top-0 left-0 w-full h-full"
        style={{ display: 'none' }}
      />
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        width={400}
        height={400}
      />
    </div>
  );
};

export default HandGesture;
