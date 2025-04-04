# GesturePic 📸

**손 제스처를 인식해 네 컷 사진을 자동 촬영하고, 하나의 콜라주로 합성해주는 웹 애플리케이션**  
이 프로젝트는 **사용자 경험**에 중점을 두어, 카메라 앞에서 특정 포즈(Victory 등)를 일정 시간 유지하면 자동으로 사진이 촬영됩니다. 촬영된 4장의 사진은 하나의 콜라주 이미지로 합성되며, 이때 다양한 파티클 이펙트를 통해 재미있는 연출이 가능합니다.

<br/>

## 개요 (Project Overview)

- **기간**: 2024.11 (약 3일간, AI 협업으로 MVP 개발)
- **목표**: 간단한 손 제스처 인식 기술을 이용해 신속하고 직관적인 사진 촬영 경험 제공
- **핵심 기능**
  - 실시간 손동작(제스처) 인식 및 이펙트 렌더링
  - 네 컷 자동 촬영 후 콜라주 합성
  - Supabase를 통한 촬영 결과 저장 및 관리
- **성과**
  - 카메라 제어부터 데이터베이스 연동까지 **프론트엔드 전 과정을 WindSurf, Cursor와 같은 AI 코드 편집기로 개발**
  - MediaPipe & Three.js로 **인터랙티브 UI** 구축
  - 간단한 손동작만으로 촬영을 제어하여 UX 향상

<br/>

## 주요 기능 (Features)

1. **손 제스처 인식**  
   - MediaPipe @mediapipe/tasks-vision 라이브러리를 사용해 브라우저에서 실시간 손동작 감지  
   - Victory, Closed Fist 등의 제스처를 일정 시간 유지 시 촬영 트리거 발생

2. **네 컷 사진 자동 촬영 & 콜라주**  
   - 한 장씩 자동 촬영을 4번 반복 후 콜라주 형태로 합성  
   - 합성된 최종 이미지를 **즉시 미리보기** 및 다운로드/재촬영 가능

3. **3D 이펙트 연출**  
   - Three.js 기반 파티클(눈송이·불꽃 등)을 렌더링해 시각적 재미 제공  
   - 손동작 감지 시 이펙트를 활성화/비활성화하여 인터랙티브 UI 구현

4. **데이터 저장/관리**  
   - Supabase DB에 사진 URL 및 결과 메타데이터 기록  
   - React Query로 비동기 요청 상태를 관리, 필요 시 캐싱/재검증 가능

<br/>

## 기술 스택 (Tech Stack)

- **Frontend**:  
  - [Next.js (React)](https://nextjs.org/)  
  - [Tailwind CSS](https://tailwindcss.com/)  
  - [Three.js](https://threejs.org/)  
  - [MediaPipe (@mediapipe/tasks-vision)](https://developers.google.com/mediapipe)

- **Backend / DB**:  
  - [Supabase](https://supabase.com/) (Database & Auth)  
  - Firebase, Node, etc. (필요 시 추가 가능)

- **기타 도구**:  
  - [React Query](https://tanstack.com/query/latest) (비동기 상태 관리)  
  - Git, GitHub (소스 버전 관리)

<br/>

## 프로젝트 구조 (Project Structure)

예시:

```
├─ app/
│   ├─ page.js          // 메인 페이지(카메라 뷰 & 제스처 인식 로직)
│   ├─ result/page.jsx  // 촬영 결과 콜라주 합성 & 표시
│   └─ ...
├─ components/
│   ├─ GestureRecognizer.jsx
│   ├─ GestureEffects.jsx
│   └─ ...
├─ hooks/
│   └─ useCamera.js
├─ services/
│   ├─ imageService.js
│   └─ supabaseClient.js
├─ utils/
│   └─ mergeImages.js
├─ public/
├─ package.json
├─ tailwind.config.js
└─ ...
```

- `app/page.js`: 메인 화면에서 웹캠 허용 요청 → 제스처 인식 → 자동 촬영 플로우 관리  
- `app/result/page.jsx`: 4컷 이미지를 합성 및 결과 페이지 표시, 다운로드 기능 제공  
- `GestureRecognizer.jsx`: MediaPipe 모델 로딩 & 손동작 실시간 추론  
- `GestureEffects.jsx`: Three.js로 파티클 이펙트 생성 및 렌더링  
- `useCamera.js`: 카메라 스트림 획득 및 Canvas 그리기 로직  
- `mergeImages.js`: 4컷 이미지를 하나의 Canvas에 합성하는 유틸 함수  

<br/>

## 사용 방법 (Usage)

1. **메인 페이지 진입** → 카메라 권한 허용  
2. **손 제스처 취하기**(예: Victory ✌️) → 3초 정도 유지 시 자동 촬영  
3. **4컷 모두 촬영** 완료 시 자동으로 결과 페이지 이동  
4. **결과 이미지**(콜라주) 확인 및 다운로드 가능  
5. **다시 촬영하기**로 재도전 가능

<br/>
