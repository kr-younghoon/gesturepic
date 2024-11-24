/**
 * 제스처 데이터를 처리합니다.
 * @param {string} gesture - 감지된 제스처 이름 (예: "Victory", "Fist").
 * @returns {boolean} - 유효한 제스처인지 여부.
 */
export const processGesture = (gesture) => {
    const validGestures = ['Victory', 'Fist'];
    if (validGestures.includes(gesture)) {
      console.log('Valid Gesture:', gesture);
      return true;
    }
    console.log('Invalid Gesture:', gesture);
    return false;
  };
  
  /**
   * 제스처 이름에 따른 동작 수행.
   * @param {string} gesture - 감지된 제스처 이름.
   */
  export const handleGestureAction = (gesture) => {
    switch (gesture) {
      case 'Victory':
        console.log('Victory gesture detected: Triggering action...');
        // Victory 제스처에 따른 동작
        break;
      case 'Fist':
        console.log('Fist gesture detected: Triggering action...');
        // Fist 제스처에 따른 동작
        break;
      default:
        console.log('Unknown gesture');
        break;
    }
  };
  