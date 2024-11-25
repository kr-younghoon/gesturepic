'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { mergeImages, loadSavedImages } from '../../services/imageService';
import { saveResult } from '@/lib/supabase';

const ResultPage = () => {
  const router = useRouter();
  const [mergedImage, setMergedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    const loadImages = async () => {
      try {
        setLoading(true);
        const savedImages = loadSavedImages();
        console.log('Loaded images:', savedImages);
        
        if (!savedImages || savedImages.length !== 4) {
          setError('저장된 사진이 없거나 불완전합니다.');
          return;
        }

        const merged = await mergeImages(savedImages);
        setMergedImage(merged);

        // Save result to Supabase
        setIsSaving(true);
        const { error: saveErr } = await saveResult({
          mergedImage: merged,
          originalImages: savedImages,
          timestamp: new Date().toISOString()
        });
        
        if (saveErr) {
          console.error('Failed to save to Supabase:', saveErr);
          setSaveError(saveErr.message);
        }
      } catch (error) {
        console.error('이미지 로드 실패:', error);
        setError('이미지를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
        setIsSaving(false);
      }
    };

    loadImages();
  }, []);

  const handleRetake = () => {
    localStorage.removeItem('capturedImages');
    router.push('/');
  };

  const handleDownload = () => {
    if (!mergedImage) return;

    const link = document.createElement('a');
    link.href = mergedImage;
    link.download = `four-cut-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">이미지를 처리중입니다...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-xl text-red-500 mb-4">{error}</div>
        <button
          onClick={handleRetake}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          다시 촬영하기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">네컷 사진 결과</h1>
        
        {isSaving && (
          <div className="text-blue-500 text-center mb-4">
            결과를 저장하는 중...
          </div>
        )}

        {saveError && (
          <div className="text-red-500 text-center mb-4">
            저장 중 오류 발생: {saveError}
          </div>
        )}
        
        {mergedImage ? (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="aspect-[2/3] mb-6">
              <img
                src={mergedImage}
                alt="네컷 사진"
                className="w-full h-full object-contain"
              />
            </div>
            
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDownload}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                다운로드
              </button>
              <button
                onClick={handleRetake}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                다시 촬영하기
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ResultPage;
