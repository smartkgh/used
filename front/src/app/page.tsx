export const runtime = 'edge'

import { Suspense } from 'react'
import SearchBar from '@/components/SearchBar'

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">중고마켓 통합 검색</h1>
        <p className="text-gray-500">당근마켓 · 번개장터 · 중고나라를 한번에</p>
      </div>
      <div className="w-full max-w-xl">
        <Suspense>
          <SearchBar />
        </Suspense>
      </div>
      <div className="flex gap-6 text-sm text-gray-400">
        <span>🥕 당근마켓</span>
        <span>⚡ 번개장터</span>
        <span>🛒 중고나라</span>
      </div>
    </div>
  )
}
