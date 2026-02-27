import { Hono } from 'hono'
import { Env } from '../types'

const router = new Hono<{ Bindings: Env }>()

// 알림 목록 조회
router.get('/', async (c) => {
  const { results } = await c.env.DB
    .prepare('SELECT * FROM alerts ORDER BY created_at DESC')
    .all()
  return c.json(results)
})

// 알림 등록
router.post('/', async (c) => {
  const body = await c.req.json<{
    keyword: string
    minPrice?: number
    maxPrice?: number
    sites?: string[]
  }>()

  if (!body.keyword?.trim()) {
    return c.json({ error: 'keyword is required' }, 400)
  }

  const id = crypto.randomUUID()
  const createdAt = new Date().toISOString()
  const sites = Array.isArray(body.sites) && body.sites.length > 0
    ? body.sites.join(',')
    : 'daangn,bunjang,joonggonara'

  await c.env.DB
    .prepare(
      'INSERT INTO alerts (id, keyword, min_price, max_price, sites, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    )
    .bind(
      id,
      body.keyword.trim(),
      body.minPrice ?? null,
      body.maxPrice ?? null,
      sites,
      createdAt,
    )
    .run()

  return c.json({ id, keyword: body.keyword, sites: sites.split(','), created_at: createdAt }, 201)
})

// 알림 삭제
router.delete('/:id', async (c) => {
  const id = c.req.param('id')
  const result = await c.env.DB
    .prepare('DELETE FROM alerts WHERE id = ?')
    .bind(id)
    .run()

  if (!result.meta.changes) {
    return c.json({ error: 'Alert not found' }, 404)
  }
  return c.json({ success: true })
})

export default router
