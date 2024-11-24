'use client';

import React from 'react';
import FourCutCamera from '../components/Camera/FourCutCamera';
import { useRouter } from 'next/navigation';

const Page = () => {
  const router = useRouter();

  const handleComplete = (capturedImages) => {
    // 네컷 촬영 완료 후 결과 페이지로 이동
    router.push('/result', { state: { images: capturedImages } });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-6">네컷 사진 촬영</h1>
      <FourCutCamera onComplete={handleComplete} />
    </div>
  );
};

export default Page;
