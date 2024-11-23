/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Strict Mode 비활성화
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kaipqjktuazebdqqmcjs.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
}

module.exports = nextConfig
