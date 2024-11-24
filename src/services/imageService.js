/**
 * 이미지 데이터를 저장합니다.
 * @param {string} imageData - 캔버스에서 추출된 이미지 데이터 (Base64 문자열).
 */
const STORAGE_KEY = 'capturedImages';

export const saveImage = (imageData) => {
  try {
    const savedImages = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    savedImages.push(imageData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedImages));
    return savedImages;
  } catch (error) {
    console.error('이미지 저장 실패:', error);
    throw error;
  }
};

/**
 * 네컷 이미지를 합성합니다.
 * @param {string[]} images - 네컷 사진 배열 (Base64 문자열).
 * @returns {string} - 합성된 이미지의 Base64 데이터.
 */
export const mergeImages = async (images) => {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // 4컷 사진 레이아웃을 위한 캔버스 크기 설정
      canvas.width = 800;  // 전체 너비
      canvas.height = 1200; // 전체 높이
      
      // 배경을 흰색으로 설정
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 각 이미지를 로드하고 캔버스에 그리기
      let loadedImages = 0;
      const imgElements = images.map((src) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            resolve(img);
          };
          img.onerror = () => {
            console.error('이미지 로드 실패:', src);
            resolve(null); // 이미지 로드 실패 시 null 반환
          };
          img.src = src;
        });
      });

      // 모든 이미지가 로드되면 캔버스에 그리기
      Promise.all(imgElements).then((loadedImgs) => {
        const validImages = loadedImgs.filter(img => img !== null);
        
        if (validImages.length !== 4) {
          reject(new Error('일부 이미지를 로드할 수 없습니다.'));
          return;
        }

        validImages.forEach((img, index) => {
          const row = Math.floor(index / 2);
          const col = index % 2;
          
          const x = col * (canvas.width / 2);
          const y = row * (canvas.height / 2);
          
          // 이미지를 캔버스에 그리기
          ctx.drawImage(
            img,
            x,
            y,
            canvas.width / 2,
            canvas.height / 2
          );
        });

        // 최종 이미지 URL 반환
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      }).catch(reject);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * 저장된 이미지를 불러옵니다.
 * @returns {string[]} - 저장된 이미지 데이터 배열 (Base64 문자열).
 */
export const loadSavedImages = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch (error) {
    console.error('저장된 이미지 로드 실패:', error);
    return [];
  }
};