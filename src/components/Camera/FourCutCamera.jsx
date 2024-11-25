'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GestureRecognizer from './GestureRecognizer';
import useCamera from '../../hooks/useCamera';
import { saveImage } from '../../services/imageService';
import GestureEffects from '../Effect/GestureEffects';

const FourCutCamera = ({ onComplete }) => {
  const router = useRouter();
  const [capturedImages, setCapturedImages] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [gesture, setGesture] = useState(null);

  const { stream, error } = useCamera();

  const handleCapture = (imageData) => {
    const newImages = [...capturedImages, imageData];
    setCapturedImages(newImages);
    saveImage(imageData); // 이미지를 로컬 스토리지에 저장
    setCurrentStep((prev) => prev + 1);
  };

  const handleGesture = (detectedGesture) => {
    setGesture(detectedGesture);
    setTimeout(() => setGesture(null), 5000); // 5초 후 효과 제거
  };

  useEffect(() => {
    if (currentStep === 4) {
      router.push('/result');
    }
  }, [currentStep, router]);

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        카메라를 사용할 수 없습니다. 카메라 권한을 확인해주세요.
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="mb-4 text-center">
        <h2 className="text-xl font-semibold">
          {currentStep < 4 ? `${currentStep + 1}번째 사진 촬영` : '촬영 완료!'}
        </h2>
        <p className="text-gray-600 mt-2">
          {currentStep < 4
            ? '손을 3초간 유지하면 자동으로 촬영됩니다'
            : '모든 사진이 촬영되었습니다.'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {capturedImages.map((image, index) => (
          <div 
            key={index} 
            className="aspect-[3/4] relative bg-gray-100 rounded-lg overflow-hidden"
          >
            <img
              src={image}
              alt={`Captured ${index + 1}`}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        ))}
        {currentStep < 4 && stream && (
          <div className="aspect-[3/4] bg-black rounded-lg overflow-hidden relative">
            <GestureRecognizer
              stream={stream}
              onCapture={handleCapture}
              onGestureDetected={handleGesture}
            />
            {gesture && (
              <div className="absolute inset-0 z-10">
                <GestureEffects gesture={gesture} />
              </div>
            )}
          </div>
        )}
        {currentStep < 4 && Array(3 - currentStep).fill(null).map((_, index) => (
          <div 
            key={`empty-${index}`} 
            className="aspect-[3/4] bg-gray-100 rounded-lg flex items-center justify-center"
          >
            <span className="text-gray-400">
              {currentStep + index + 2}번째 사진
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FourCutCamera;
