import { SearchResponse } from '@/lib/types'

interface Props {
  summary: SearchResponse['summary']
  sites: SearchResponse['sites']
}

function formatPrice(price: number): string {
  if (price === 0) return '-'
  return price.toLocaleString('ko-KR') + '원'
}

export default function PriceSummary({ summary, sites }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">최저가</p>
          <p className="text-lg font-bold text-blue-600">{formatPrice(summary.minPrice)}</p>
        </div>
        <div className="text-center border-x border-gray-100">
          <p className="text-xs text-gray-500 mb-1">평균가</p>
          <p className="text-lg font-bold text-gray-700">{formatPrice(summary.avgPrice)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">최고가</p>
          <p className="text-lg font-bold text-gray-500">{formatPrice(summary.maxPrice)}</p>
        </div>
      </div>
      <div className="flex gap-3 justify-center text-sm text-gray-500 border-t border-gray-100 pt-3">
        <span>총 {summary.total}개</span>
        <span>·</span>
        <span>당근 {sites.daangn}개</span>
        <span>·</span>
        <span>번개 {sites.bunjang}개</span>
        <span>·</span>
        <span>중고나라 {sites.joonggonara}개</span>
      </div>
    </div>
  )
}
