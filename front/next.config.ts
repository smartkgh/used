import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'media.bunjang.co.kr' },
      { protocol: 'https', hostname: '*.bunjang.co.kr' },
      { protocol: 'https', hostname: '*.cloudfront.net' },
      { protocol: 'https', hostname: 'img.kr.gcp-karroter.net' }, // 당근마켓 CDN
      { protocol: 'https', hostname: '*.gcp-karroter.net' },
      { protocol: 'https', hostname: 'img.joongna.com' },
      { protocol: 'https', hostname: '*.naver.com' },
    ],
  },
}

export default nextConfig
