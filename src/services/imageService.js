/**
 * 이미지 데이터를 저장합니다.
 * @param {string} imageData - 캔버스에서 추출된 이미지 데이터 (Base64 문자열).
 */
export const saveImage = (imageData) => {
  // 로컬 스토리지에 이미지 저장
  const savedImages = JSON.parse(localStorage.getItem('capturedImages') || '[]');
  savedImages.push(imageData);
  localStorage.setItem('capturedImages', JSON.stringify(savedImages));
  return savedImages;
};

/**
 * 네컷 이미지를 합성합니다.
 * @param {string[]} images - 네컷 사진 배열 (Base64 문자열).
 * @returns {string} - 합성된 이미지의 Base64 데이터.
 */
export const mergeImages = async (images) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const numImages = images.length;
    
    // 4컷 사진 레이아웃을 위한 캔버스 크기 설정
    canvas.width = 800;  // 전체 너비
    canvas.height = 1200; // 전체 높이
    
    // 배경을 흰색으로 설정
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 각 이미지를 로드하고 캔버스에 그리기
    let loadedImages = 0;
    const imgElements = images.map((src) => {
      const img = new Image();
      img.src = src;
      return new Promise((resolve) => {
        img.onload = () => {
          loadedImages++;
          resolve(img);
          
          // 모든 이미지가 로드되면 캔버스에 그리기
          if (loadedImages === numImages) {
            const imageWidth = canvas.width;
            const imageHeight = canvas.height / 2;
            
            imgElements.forEach((imgPromise, index) => {
              imgPromise.then(img => {
                const row = Math.floor(index / 2);
                const col = index % 2;
                
                const x = col * (imageWidth / 2);
                const y = row * (imageHeight / 2);
                
                // 이미지를 캔버스에 그리기
                ctx.drawImage(
                  img,
                  x,
                  y,
                  imageWidth / 2,
                  imageHeight / 2
                );
              });
            });
            
            // 최종 이미지 URL 반환
            resolve(canvas.toDataURL('image/jpeg', 0.8));
          }
        };
      });
    });
  });
};

/**
 * 저장된 이미지를 불러옵니다.
 * @returns {string[]} - 저장된 이미지 데이터 배열 (Base64 문자열).
 */
export const loadSavedImages = () => {
  // 로컬 스토리지에서 이미지 불러오기
  return JSON.parse(localStorage.getItem('capturedImages') || '[]');
};