'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { SITE_LABEL, Site } from '@/lib/types'

const SITES: Site[] = ['daangn', 'bunjang', 'joonggonara']

export default function SiteFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeSites = (searchParams.get('sites') ?? 'daangn,bunjang,joonggonara').split(',')

  function toggle(site: Site) {
    const next = activeSites.includes(site)
      ? activeSites.filter((s) => s !== site)
      : [...activeSites, site]

    if (next.length === 0) return // 최소 1개 선택 유지

    const params = new URLSearchParams(searchParams.toString())
    params.set('sites', next.join(','))
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {SITES.map((site) => {
        const active = activeSites.includes(site)
        return (
          <button
            key={site}
            onClick={() => toggle(site)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              active
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
            }`}
          >
            {SITE_LABEL[site]}
          </button>
        )
      })}
    </div>
  )
}
