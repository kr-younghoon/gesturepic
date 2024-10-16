This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

-   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
-   [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# gesturepic

프로젝트 파일 구조
다음과 같이 폴더 구조를 구성하여 코드를 관리합니다.

```
/src
  /app
    /photo
      /page.js       # 메인 촬영 페이지
      /edit.js       # 사진 편집 페이지
      /share.js      # QR 코드 공유 페이지
    /api
      /graphql       # GraphQL API 서버리스 함수
      /photo         # 사진 데이터 관련 API
  /components        # 재사용 가능한 UI 컴포넌트들
  /graphql           # GraphQL 관련 코드
  /hooks             # Tanstack Query 및 Zustand 관련 커스텀 훅
  /services          # Supabase와 통신하는 서비스 로직
  /store             # Zustand 상태 관리
  /styles            # 전역 스타일 및 테마
  /utils             # 유틸리티 함수들
```
