import { SearchResult } from '../types'

type RawItem = Record<string, unknown>

function extractId(item: RawItem): string {
  const id = item.pid ?? item.id ?? item.product_id ?? item.no
  return String(id ?? Math.random())
}

function extractTitle(item: RawItem): string {
  return String(item.name ?? item.title ?? item.product_name ?? '')
}

function extractPrice(item: RawItem): number {
  const raw = item.price ?? item.sell_price ?? item.sale_price ?? 0
  return parseInt(String(raw), 10) || 0
}

function extractImage(item: RawItem): string {
  const img = item.product_image ?? item.image ?? item.thumbnail ?? item.img ?? ''
  if (!img) return ''
  const s = String(img)
    .replace('{res}', '480')   // find_v2.json 이미지 URL의 해상도 플레이스홀더
  if (s.startsWith('http')) return s
  if (s.startsWith('//')) return `https:${s}`
  return `https://media.bunjang.co.kr/product/${s}`
}

function extractDate(item: RawItem): string {
  const t = item.update_time ?? item.updated_at ?? item.created_at ?? item.reg_date
  if (!t) return new Date().toISOString()
  const n = Number(t)
  // Unix timestamp (초 단위)이면 변환
  if (!isNaN(n) && n < 9999999999) return new Date(n * 1000).toISOString()
  if (!isNaN(n)) return new Date(n).toISOString()
  return String(t)
}

function mapItem(item: RawItem, idx: number): SearchResult {
  const id = extractId(item)
  const productUrl = String(item.outlink_url ?? item.app_url ?? `https://bunjang.co.kr/products/${id}`)
  return {
    id: `bunjang-${id}-${idx}`,    // idx로 중복 방지
    site: 'bunjang',
    title: extractTitle(item),
    price: extractPrice(item),
    imageUrl: extractImage(item),
    productUrl,
    location: String(item.location ?? item.region ?? ''),
    createdAt: extractDate(item),
  }
}

export async function searchBunjang(keyword: string): Promise<SearchResult[]> {
  try {
    const requestId = Date.now()
    const url = `https://api.bunjang.co.kr/api/1/find_v2.json?q=${encodeURIComponent(keyword)}&order=date&page=0&n=100&stat_device=w&stat_category_required=1&req_ref=search&version=5&request_id=${requestId}`

    const res = await fetch(url, {
      headers: {
        'Referer': 'https://m.bunjang.co.kr/',
        'Origin': 'https://m.bunjang.co.kr',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
      },
    })

    console.log(`[Bunjang] status: ${res.status}`)
    if (!res.ok) return []

    const data = await res.json() as Record<string, unknown>
    const list = (data.list ?? data.products ?? data.result ?? []) as RawItem[]
    console.log(`[Bunjang] items: ${list.length}`)

    if (list.length > 0) {
      console.log(`[Bunjang] first item keys: ${Object.keys(list[0])}`)
      console.log(`[Bunjang] first item: ${JSON.stringify(list[0]).slice(0, 300)}`)
    }

    return list.map((item, idx) => mapItem(item, idx))
  } catch (err) {
    console.error('[Bunjang] exception:', err)
    return []
  }
}
