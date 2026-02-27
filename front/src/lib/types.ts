export type Site = 'daangn' | 'bunjang' | 'joonggonara'

export interface SearchResult {
  id: string
  site: Site
  title: string
  price: number
  imageUrl: string
  productUrl: string
  location?: string
  createdAt: string
}

export interface SearchResponse {
  results: SearchResult[]
  summary: {
    total: number
    minPrice: number
    maxPrice: number
    avgPrice: number
  }
  sites: {
    daangn: number
    bunjang: number
    joonggonara: number
  }
}

export interface Alert {
  id: string
  keyword: string
  min_price: number | null
  max_price: number | null
  sites: string
  created_at: string
}

export const SITE_LABEL: Record<Site, string> = {
  daangn: '당근마켓',
  bunjang: '번개장터',
  joonggonara: '중고나라',
}

export const SITE_COLOR: Record<Site, string> = {
  daangn: 'bg-orange-100 text-orange-700',
  bunjang: 'bg-blue-100 text-blue-700',
  joonggonara: 'bg-green-100 text-green-700',
}
