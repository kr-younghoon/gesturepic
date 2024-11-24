import { useState, useEffect } from 'react';

const useCamera = () => {
  const [isCameraReady, setIsCameraReady] = useState(false); // 카메라 상태 관리
  const [stream, setStream] = useState(null); // 카메라 스트림 관리
  const [error, setError] = useState(null); // 에러 상태 관리

  useEffect(() => {
    const initCamera = async () => {
      try {
        // 사용자 권한 요청 및 스트림 가져오기
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });

        setStream(videoStream); // 스트림 저장
        setIsCameraReady(true); // 카메라 준비 완료
      } catch (err) {
        console.error('카메라 초기화 실패:', err);
        setError(err.message); // 에러 저장
      }
    };

    initCamera();

    return () => {
      // 컴포넌트 언마운트 시 스트림 정리
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []); // 컴포넌트 마운트 시 한 번 실행

  return { isCameraReady, stream, error }; // 상태 및 스트림 반환
};

export default useCamera;
