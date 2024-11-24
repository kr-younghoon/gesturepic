import React, { useState } from 'react';
import GestureRecognizer from './GestureRecognizer';
import useCamera from '../../hooks/useCamera';
import { saveImage, mergeImages } from '../../services/imageService';

const FourCutCamera = ({ onComplete }) => {
  const { isCameraReady, stream, error } = useCamera();
  const [currentFrame, setCurrentFrame] = useState(0);
  const [capturedImages, setCapturedImages] = useState([]);

  const handleGestureCapture = (imageData) => {
    // 이미지 저장
    saveImage(imageData);
    setCapturedImages((prev) => [...prev, imageData]);

    if (currentFrame < 3) {
      setCurrentFrame((prev) => prev + 1);
    } else {
      // 네컷 촬영 완료
      const combinedImage = mergeImages(capturedImages);
      console.log('합성된 네컷 이미지:', combinedImage);
      if (onComplete) onComplete(combinedImage);
    }
  };

  if (error) return <p>Error: {error}</p>;
  if (!isCameraReady) return <p>카메라를 준비 중입니다...</p>;

  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-2 gap-2">
        {[0, 1, 2, 3].map((frame) => (
          <div
            key={frame}
            className={`w-40 h-40 border ${
              frame === currentFrame ? 'border-blue-500' : 'border-gray-300'
            }`}
          >
            {capturedImages[frame] && (
              <img
                src={capturedImages[frame]}
                alt={`Captured Frame ${frame}`}
                className="w-full h-full"
              />
            )}
          </div>
        ))}
      </div>

      <GestureRecognizer stream={stream} onCapture={handleGestureCapture} />

      {currentFrame === 3 && (
        <button
          onClick={() => console.log('네컷 사진 결과 보기')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          네컷 결과 보기
        </button>
      )}
    </div>
  );
};

export default FourCutCamera;
