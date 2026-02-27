import { SearchResult } from '../types'

// 중고나라는 Naver Cafe API를 통해 검색합니다.
// 중고나라 네이버 카페 ID: 10050146
const JOONGGONARA_CAFE_ID = '10050146'

interface NaverCafeItem {
  title: string
  link: string
  description: string
  pubDate: string
}

interface NaverSearchResponse {
  total: number
  start: number
  display: number
  items: NaverCafeItem[]
}

// 제목/설명에서 가격 추출 (예: "50만원", "500,000원", "50만")
function extractPrice(text: string): number {
  const clean = text.replace(/<[^>]+>/g, '')

  // "500,000원" 패턴
  const fullMatch = clean.match(/(\d{1,3}(?:,\d{3})+)\s*원/)
  if (fullMatch) return parseInt(fullMatch[1].replace(/,/g, ''), 10)

  // "50만원" 또는 "50만" 패턴
  const manMatch = clean.match(/(\d+(?:\.\d+)?)\s*만\s*원?/)
  if (manMatch) return Math.round(parseFloat(manMatch[1]) * 10000)

  // "50000원" 패턴
  const plainMatch = clean.match(/(\d{4,7})\s*원/)
  if (plainMatch) return parseInt(plainMatch[1], 10)

  return 0
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
}

export async function searchJoonggonara(
  keyword: string,
  clientId: string,
  clientSecret: string,
): Promise<SearchResult[]> {
  try {
    const params = new URLSearchParams({
      query: keyword,
      cafeId: JOONGGONARA_CAFE_ID,
      display: '50',
      sort: 'date',
    })

    const res = await fetch(
      `https://openapi.naver.com/v1/search/cafearticle.json?${params}`,
      {
        headers: {
          'X-Naver-Client-Id': clientId,
          'X-Naver-Client-Secret': clientSecret,
        },
      },
    )

    if (!res.ok) return []

    const data = await res.json() as NaverSearchResponse
    const items = data.items ?? []

    return items.map((item, idx) => {
      const title = stripHtml(item.title)
      const price = extractPrice(title) || extractPrice(item.description)

      return {
        id: `joonggonara-${idx}-${Date.now()}`,
        site: 'joonggonara' as const,
        title,
        price,
        imageUrl: '',   // Naver Cafe API는 이미지 미제공
        productUrl: item.link,
        createdAt: item.pubDate
          ? new Date(item.pubDate).toISOString()
          : new Date().toISOString(),
      }
    })
  } catch {
    return []
  }
}
