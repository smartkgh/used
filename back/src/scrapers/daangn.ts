import { SearchResult } from '../types'

type RawArticle = Record<string, unknown>

function parsePrice(raw: unknown): number {
  if (typeof raw === 'number') return raw
  if (typeof raw === 'string') return parseInt(raw.replace(/[^0-9]/g, ''), 10) || 0
  return 0
}

function extractTitle(item: RawArticle): string {
  // 직접 필드 시도
  const direct = item.name ?? item.title ?? item.content ?? item.subject
  if (direct) return String(direct)
  // href 슬러그에서 제목 추출: /kr/buy-sell/아이폰-15-abc123/ → 아이폰 15
  const href = String(item.href ?? item.id ?? '')
  const slug = href.split('/').filter(Boolean).pop() ?? ''
  // 마지막 -랜덤ID 제거 후 하이픈 → 공백
  return slug.replace(/-[a-z0-9]{8,}$/, '').replace(/-/g, ' ').trim()
}

function mapArticle(item: RawArticle, idx: number): SearchResult {
  const href = String(item.href ?? '')
  const rawId = String(item.id ?? href ?? idx)
  return {
    id: `daangn-${rawId}-${idx}`,
    site: 'daangn',
    title: extractTitle(item),
    price: parsePrice(item.price ?? item.priceLabel ?? item.priceString),
    imageUrl: String(item.thumbnail ?? item.thumbnailUrl ?? item.image ?? item.imageUrl ?? ''),
    productUrl: href || `https://www.daangn.com${rawId}`,
    location: String(item.region ?? item.regionName ?? item.location ?? ''),
    createdAt: String(item.created_at ?? item.publishedAt ?? item.createdAt ?? new Date().toISOString()),
  }
}

// allPage.fleamarketArticles 직접 추출
function extractFleamarketArticles(data: unknown): RawArticle[] {
  if (!data || typeof data !== 'object') return []
  const root = data as Record<string, unknown>

  // allPage.fleamarketArticles 경로 직접 시도
  const allPage = root.allPage as Record<string, unknown> | undefined
  const direct = allPage?.fleamarketArticles
  if (Array.isArray(direct) && direct.length > 0) return direct as RawArticle[]

  // 재귀 탐색 (다른 구조일 경우 대비)
  for (const val of Object.values(root)) {
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      const nested = val as Record<string, unknown>
      for (const key of ['fleamarketArticles', 'articles', 'list', 'items']) {
        if (Array.isArray(nested[key]) && (nested[key] as unknown[]).length > 0) {
          return nested[key] as RawArticle[]
        }
      }
    }
  }
  return []
}

export async function searchDaangn(keyword: string): Promise<SearchResult[]> {
  // routes/kr.buy-sell.s 가 실제 검색 결과를 반환하는 것으로 확인됨
  const url = `https://www.daangn.com/kr/buy-sell/s/?search=${encodeURIComponent(keyword)}&_data=routes%2Fkr.buy-sell.s`
  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'ko-KR,ko;q=0.9',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.daangn.com/',
      },
    })

    console.log(`[Daangn] status: ${res.status}`)
    if (!res.ok) return []

    const data = await res.json() as unknown
    const articles = extractFleamarketArticles(data)
    console.log(`[Daangn] articles: ${articles.length}`)

    if (articles.length > 0) {
      console.log(`[Daangn] first article keys: ${Object.keys(articles[0])}`)
      console.log(`[Daangn] first article: ${JSON.stringify(articles[0]).slice(0, 500)}`)
    }

    return articles.map((item, idx) => mapArticle(item, idx))
  } catch (err) {
    console.error('[Daangn] exception:', err)
    return []
  }
}
