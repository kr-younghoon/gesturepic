/**
 * 이미지 데이터를 저장합니다.
 * @param {string} imageData - 캔버스에서 추출된 이미지 데이터 (Base64 문자열).
 */
export const saveImage = (imageData) => {
    // 로컬 스토리지에 저장하거나 API 호출로 서버에 전송
    console.log('Image saved:', imageData);
    localStorage.setItem(`image-${Date.now()}`, imageData);
  };
  
  /**
   * 네컷 이미지를 합성합니다.
   * @param {string[]} images - 네컷 사진 배열 (Base64 문자열).
   * @returns {string} - 합성된 이미지의 Base64 데이터.
   */
  export const mergeImages = (images) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
  
    // 캔버스 크기 설정 (예: 네컷 사진 크기)
    const size = 200; // 한 이미지당 크기
    canvas.width = size * 2; // 가로 2칸
    canvas.height = size * 2; // 세로 2칸
  
    images.forEach((image, index) => {
      const img = new Image();
      img.src = image;
  
      img.onload = () => {
        const x = (index % 2) * size; // x 좌표
        const y = Math.floor(index / 2) * size; // y 좌표
        context.drawImage(img, x, y, size, size);
      };
    });
  
    return canvas.toDataURL('image/png'); // 합성된 이미지의 Base64 데이터 반환
  };
  