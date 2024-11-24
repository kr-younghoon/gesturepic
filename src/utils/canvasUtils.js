/**
 * 4개의 이미지를 캔버스에 합성합니다.
 * @param {string[]} images - Base64 이미지 배열.
 * @returns {string} - 합성된 이미지의 Base64 데이터.
 */
export const mergeImages = (images) => {
    if (images.length !== 4) {
      throw new Error('4개의 이미지가 필요합니다.');
    }
  
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
  
    // 캔버스 크기 설정 (예: 200x200 이미지를 기준으로 2x2 배열)
    const size = 200;
    canvas.width = size * 2; // 가로 2칸
    canvas.height = size * 2; // 세로 2칸
  
    images.forEach((image, index) => {
      const img = new Image();
      img.src = image;
  
      // 이미지가 로드되면 캔버스에 그리기
      img.onload = () => {
        const x = (index % 2) * size; // x 좌표
        const y = Math.floor(index / 2) * size; // y 좌표
        ctx.drawImage(img, x, y, size, size);
      };
    });
  
    return canvas.toDataURL('image/png'); // 합성된 이미지의 Base64 데이터 반환
  };
  