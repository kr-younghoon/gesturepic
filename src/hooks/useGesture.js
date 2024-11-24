import { useState, useEffect } from 'react';
import * as mp from '@mediapipe/tasks-vision';

const useGesture = (videoElement, onGestureDetected) => {
  const [currentGesture, setCurrentGesture] = useState(null);
  const [gestureStartTime, setGestureStartTime] = useState(null);
  const [gestureRecognizer, setGestureRecognizer] = useState(null);

  useEffect(() => {
    if (!videoElement) return;

    const initializeGestureRecognizer = async () => {
      const gestureRecognizer = await mp.GestureRecognizer.create({
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer.task',
        },
        runningMode: 'VIDEO',
      });
      setGestureRecognizer(gestureRecognizer);

      const processFrame = async () => {
        if (!gestureRecognizer || videoElement.paused || videoElement.ended) return;

        const results = await gestureRecognizer.recognize(videoElement);
        processResults(results);

        requestAnimationFrame(processFrame);
      };

      videoElement.addEventListener('play', processFrame);
    };

    initializeGestureRecognizer();

    return () => {
      if (gestureRecognizer) {
        gestureRecognizer.close();
      }
    };
  }, [videoElement]);

  const processResults = (results) => {
    if (results.gestures && results.gestures.length > 0) {
      const topGesture = results.gestures[0].categoryName;

      if (topGesture === 'Victory' || topGesture === 'Fist') {
        if (currentGesture === topGesture) {
          const currentTime = Date.now();
          if (
            gestureStartTime &&
            currentTime - gestureStartTime >= 3000 // 3초 유지
          ) {
            onGestureDetected(topGesture); // 부모 컴포넌트로 전달
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

  const resetGesture = () => {
    setCurrentGesture(null);
    setGestureStartTime(null);
  };

  return { currentGesture };
};

export default useGesture;
