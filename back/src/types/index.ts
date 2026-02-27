export interface SearchResult {
  id: string
  site: 'daangn' | 'bunjang' | 'joonggonara'
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

export interface Env {
  SEARCH_CACHE: KVNamespace
  DB: D1Database
  NAVER_CLIENT_ID: string
  NAVER_CLIENT_SECRET: string
  ALLOWED_ORIGIN: string
}
