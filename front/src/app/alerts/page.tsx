'use client'

import { useEffect, useState } from 'react'
import { Alert, SITE_LABEL, Site } from '@/lib/types'
import { getAlerts, createAlert, deleteAlert } from '@/lib/api'

const ALL_SITES: Site[] = ['daangn', 'bunjang', 'joonggonara']

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [keyword, setKeyword] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [selectedSites, setSelectedSites] = useState<Site[]>([...ALL_SITES])

  useEffect(() => {
    getAlerts()
      .then(setAlerts)
      .finally(() => setLoading(false))
  }, [])

  function toggleSite(site: Site) {
    setSelectedSites((prev) =>
      prev.includes(site)
        ? prev.filter((s) => s !== site)
        : [...prev, site],
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!keyword.trim() || selectedSites.length === 0) return

    setSubmitting(true)
    try {
      const created = await createAlert({
        keyword: keyword.trim(),
        minPrice: minPrice ? parseInt(minPrice, 10) : undefined,
        maxPrice: maxPrice ? parseInt(maxPrice, 10) : undefined,
        sites: selectedSites,
      })
      setAlerts((prev) => [created, ...prev])
      setKeyword('')
      setMinPrice('')
      setMaxPrice('')
      setSelectedSites([...ALL_SITES])
    } catch {
      alert('알림 등록에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('알림을 삭제할까요?')) return
    try {
      await deleteAlert(id)
      setAlerts((prev) => prev.filter((a) => a.id !== id))
    } catch {
      alert('삭제에 실패했습니다.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-gray-900">알림 관리</h1>

      {/* 알림 등록 폼 */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4"
      >
        <h2 className="font-semibold text-gray-800">새 알림 등록</h2>

        <div>
          <label className="block text-sm text-gray-600 mb-1">키워드</label>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="예: 아이폰 15"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">최저 가격 (원)</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="0"
              min={0}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">최고 가격 (원)</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="제한 없음"
              min={0}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">검색 사이트</label>
          <div className="flex gap-2 flex-wrap">
            {ALL_SITES.map((site) => (
              <button
                key={site}
                type="button"
                onClick={() => toggleSite(site)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  selectedSites.includes(site)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                }`}
              >
                {SITE_LABEL[site]}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || !keyword.trim() || selectedSites.length === 0}
          className="bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? '등록 중...' : '알림 등록'}
        </button>
      </form>

      {/* 알림 목록 */}
      <div className="flex flex-col gap-3">
        <h2 className="font-semibold text-gray-800">등록된 알림 ({alerts.length}개)</h2>

        {loading ? (
          <div className="text-center py-10 text-gray-400">불러오는 중...</div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-gray-200">
            등록된 알림이 없습니다
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between"
            >
              <div className="flex flex-col gap-1">
                <span className="font-medium text-gray-900">{alert.keyword}</span>
                <div className="flex gap-2 text-xs text-gray-400">
                  {alert.min_price && <span>최저 {alert.min_price.toLocaleString()}원</span>}
                  {alert.max_price && <span>최고 {alert.max_price.toLocaleString()}원</span>}
                  <span>{alert.sites.split(',').map((s) => SITE_LABEL[s as Site] ?? s).join(' · ')}</span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(alert.id)}
                className="text-red-400 hover:text-red-600 text-sm ml-4 shrink-0"
              >
                삭제
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
