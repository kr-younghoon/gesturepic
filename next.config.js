/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    domains: ['kaipqjktuazebdqqmcjs.supabase.co'],
  },
  distDir: 'dist',
}

module.exports = nextConfig
