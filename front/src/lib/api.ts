import { SearchResponse, Alert } from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787'

export async function searchProducts(params: {
  q: string
  sites?: string[]
  sort?: string
}): Promise<SearchResponse> {
  const url = new URL(`${API_URL}/api/search`)
  url.searchParams.set('q', params.q)
  if (params.sites?.length) url.searchParams.set('sites', params.sites.join(','))
  if (params.sort) url.searchParams.set('sort', params.sort)

  const res = await fetch(url.toString(), { next: { revalidate: 0 } })
  if (!res.ok) throw new Error(`Search failed: ${res.status}`)
  return res.json()
}

export async function getAlerts(): Promise<Alert[]> {
  const res = await fetch(`${API_URL}/api/alerts`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch alerts')
  return res.json()
}

export async function createAlert(data: {
  keyword: string
  minPrice?: number
  maxPrice?: number
  sites?: string[]
}): Promise<Alert> {
  const res = await fetch(`${API_URL}/api/alerts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create alert')
  return res.json()
}

export async function deleteAlert(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/alerts/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete alert')
}
