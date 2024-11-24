'use client';

import { useState, useCallback } from 'react';

export function useCapture() {
  const [capturedImage, setCapturedImage] = useState(null);

  const handleCapture = useCallback((videoRef, canvasRef) => {
    if (!videoRef?.current || !canvasRef?.current) {
      console.error('Video or Canvas reference is not available');
      return null;
    }

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // 캔버스 크기를 비디오 크기와 동기화
      if (canvas.width !== video.videoWidth) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('Failed to get 2D context');
        return null;
      }

      // 현재 캔버스 상태 저장
      ctx.save();

      // 셀카 모드를 위한 좌우 반전
      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);

      // 비디오 프레임을 캔버스에 그리기
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // 캔버스 상태 복원
      ctx.restore();

      // 이미지 데이터 생성
      const imageData = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(imageData);

      return imageData;
    } catch (error) {
      console.error('Error capturing image:', error);
      return null;
    }
  }, []);

  const clearCapture = useCallback(() => {
    setCapturedImage(null);
  }, []);

  return {
    capturedImage,
    handleCapture,
    clearCapture,
  };
}
