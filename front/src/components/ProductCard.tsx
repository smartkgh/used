import Image from 'next/image'
import { SearchResult, SITE_LABEL, SITE_COLOR } from '@/lib/types'

interface Props {
  item: SearchResult
}

function formatPrice(price: number): string {
  if (price === 0) return '가격 없음'
  return price.toLocaleString('ko-KR') + '원'
}

function formatDate(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}분 전`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  return `${days}일 전`
}

export default function ProductCard({ item }: Props) {
  return (
    <a
      href={item.productUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all overflow-hidden flex flex-col"
    >
      {/* 이미지 */}
      <div className="relative w-full aspect-square bg-gray-100">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
            이미지 없음
          </div>
        )}
      </div>

      {/* 정보 */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <span className={`self-start text-xs font-medium px-2 py-0.5 rounded-full ${SITE_COLOR[item.site]}`}>
          {SITE_LABEL[item.site]}
        </span>
        <p className="text-sm text-gray-800 font-medium line-clamp-2">{item.title}</p>
        <p className="text-base font-bold text-gray-900 mt-auto">{formatPrice(item.price)}</p>
        <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
          {item.location && <span>{item.location}</span>}
          <span className="ml-auto">{formatDate(item.createdAt)}</span>
        </div>
      </div>
    </a>
  )
}
