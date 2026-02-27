import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { Env } from './types'
import searchRouter from './routes/search'
import alertsRouter from './routes/alerts'

const app = new Hono<{ Bindings: Env }>()

// CORS: front 도메인만 허용
app.use('*', async (c, next) => {
  const allowedOrigin = c.env.ALLOWED_ORIGIN ?? 'http://localhost:3000'
  return cors({
    origin: allowedOrigin,
    allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
  })(c, next)
})

app.route('/api/search', searchRouter)
app.route('/api/alerts', alertsRouter)

app.get('/health', (c) => c.json({ status: 'ok' }))

export default app
