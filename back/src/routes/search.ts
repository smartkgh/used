import { Hono } from 'hono'
import { Env, SearchResult, SearchResponse } from '../types'
import { searchBunjang } from '../scrapers/bunjang'
import { searchDaangn } from '../scrapers/daangn'
import { searchJoonggonara } from '../scrapers/joonggonara'

const router = new Hono<{ Bindings: Env }>()

router.get('/', async (c) => {
  const q = c.req.query('q')
  const sitesParam = c.req.query('sites') ?? 'daangn,bunjang,joonggonara'
  const sort = c.req.query('sort') ?? 'date'

  if (!q?.trim()) {
    return c.json({ error: 'q parameter is required' }, 400)
  }

  const sites = sitesParam.split(',').map((s) => s.trim())
  const cacheKey = `search:${q}:${[...sites].sort().join(',')}:${sort}`

  // KV 캐시 확인 (5분)
  const cached = await c.env.SEARCH_CACHE.get(cacheKey)
  if (cached) {
    return c.json(JSON.parse(cached))
  }

  // 3개 사이트 병렬 검색
  const [daangnResults, bunjangResults, joonggonara] = await Promise.allSettled([
    sites.includes('daangn') ? searchDaangn(q) : Promise.resolve([]),
    sites.includes('bunjang') ? searchBunjang(q) : Promise.resolve([]),
    sites.includes('joonggonara')
      ? searchJoonggonara(q, c.env.NAVER_CLIENT_ID, c.env.NAVER_CLIENT_SECRET)
      : Promise.resolve([]),
  ])

  const allResults: SearchResult[] = [
    ...(daangnResults.status === 'fulfilled' ? daangnResults.value : []),
    ...(bunjangResults.status === 'fulfilled' ? bunjangResults.value : []),
    ...(joonggonara.status === 'fulfilled' ? joonggonara.value : []),
  ]

  // 정렬
  if (sort === 'price_asc') {
    allResults.sort((a, b) => a.price - b.price)
  } else if (sort === 'price_desc') {
    allResults.sort((a, b) => b.price - a.price)
  } else {
    allResults.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  // 가격 요약
  const prices = allResults.filter((r) => r.price > 0).map((r) => r.price)
  const summary = {
    total: allResults.length,
    minPrice: prices.length ? Math.min(...prices) : 0,
    maxPrice: prices.length ? Math.max(...prices) : 0,
    avgPrice: prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0,
  }

  const response: SearchResponse = {
    results: allResults,
    summary,
    sites: {
      daangn: allResults.filter((r) => r.site === 'daangn').length,
      bunjang: allResults.filter((r) => r.site === 'bunjang').length,
      joonggonara: allResults.filter((r) => r.site === 'joonggonara').length,
    },
  }

  // KV 캐싱 (5분)
  await c.env.SEARCH_CACHE.put(cacheKey, JSON.stringify(response), {
    expirationTtl: 300,
  })

  return c.json(response)
})

export default router
