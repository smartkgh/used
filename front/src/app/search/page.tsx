export const runtime = 'edge'

import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import SearchBar from '@/components/SearchBar'
import SiteFilter from '@/components/SiteFilter'
import SortSelect from '@/components/SortSelect'
import ProductCard from '@/components/ProductCard'
import PriceSummary from '@/components/PriceSummary'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import { searchProducts } from '@/lib/api'

interface Props {
  searchParams: Promise<{ q?: string; sites?: string; sort?: string }>
}

async function SearchResults({ q, sites, sort }: { q: string; sites?: string; sort?: string }) {
  try {
    const data = await searchProducts({
      q,
      sites: sites?.split(','),
      sort,
    })

    if (data.results.length === 0) {
      return (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">검색 결과가 없습니다</p>
          <p className="text-sm mt-1">다른 키워드로 검색해보세요</p>
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-6">
        <PriceSummary summary={data.summary} sites={data.sites} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.results.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    )
  } catch {
    return (
      <div className="text-center py-20 text-red-400">
        <p className="text-lg">검색 중 오류가 발생했습니다</p>
        <p className="text-sm mt-1">잠시 후 다시 시도해주세요</p>
      </div>
    )
  }
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams
  const q = params.q

  if (!q?.trim()) redirect('/')

  return (
    <div className="flex flex-col gap-6">
      {/* 검색창 */}
      <Suspense>
        <SearchBar initialValue={q} />
      </Suspense>

      {/* 필터 & 정렬 */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Suspense>
          <SiteFilter />
        </Suspense>
        <Suspense>
          <SortSelect />
        </Suspense>
      </div>

      {/* 검색 결과 */}
      <Suspense fallback={<LoadingSkeleton />}>
        <SearchResults q={q} sites={params.sites} sort={params.sort} />
      </Suspense>
    </div>
  )
}
