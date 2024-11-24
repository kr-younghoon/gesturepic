import React, { useEffect, useRef } from 'react';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

const HandGesture = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((results) => {
      const canvasCtx = canvasRef.current.getContext('2d');
      canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      // 드로잉 스켈레톤
      canvasCtx.drawImage(
        results.image,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
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
    });

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        await hands.send({ image: videoRef.current });
      },
      width: 1280,
      height: 720,
    });
    camera.start();
  }, []);

  return (
    <div className="relative">
      <video
        ref={videoRef}
        className="absolute top-0 left-0 w-full h-full"
        style={{ display: 'none' }}
      />
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ position: 'absolute' }}
      />
    </div>
  );
};

export default HandGesture;
