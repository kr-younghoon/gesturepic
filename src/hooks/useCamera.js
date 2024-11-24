'use client';

import { useState, useEffect } from 'react';

const useCamera = () => {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const initCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
        });

        if (mounted) {
          setStream(mediaStream);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
          console.error('카메라 초기화 실패:', err);
        }
      }
    };

    initCamera();

    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return { stream, error };
};

export default useCamera;
