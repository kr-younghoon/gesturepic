'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLocation } from 'react-router-dom';

const ResultPage = () => {
  const router = useRouter();
  const location = useLocation();

  // 전달된 이미지 데이터를 가져옴
  const images = location.state?.images || [];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-6">네컷 사진 결과</h1>
      <div className="grid grid-cols-2 gap-2">
        {images.map((src, index) => (
          <div key={index} className="w-40 h-40 border border-gray-300">
            <img src={src} alt={`Frame ${index + 1}`} className="w-full h-full" />
          </div>
        ))}
      </div>
      <button
        onClick={() => router.push('/')}
        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded"
      >
        다시 촬영하기
      </button>
    </div>
  );
};

export default ResultPage;
