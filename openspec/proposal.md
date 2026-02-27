# 중고마켓 통합 검색 웹앱 - 프로젝트 제안서

## 개요

당근마켓, 중고나라, 번개장터 3개 플랫폼의 중고 물품을 **한 곳에서 검색**하고,
**가격을 비교**하며, 원하는 키워드의 신규 매물을 **알림**으로 받을 수 있는 웹앱.

---

## 목표 (Goals)

- 3개 중고거래 사이트의 상품을 단일 검색창에서 통합 조회
- 동일/유사 물품의 사이트별 가격을 한눈에 비교
- 키워드 기반 알림 구독으로 신규 매물 즉시 파악
- Cloudflare Edge에서 동작하는 빠른 응답 속도

## 비목표 (Non-goals)

- 실제 구매/거래 기능 (각 사이트로 링크 이동만 제공)
- 사용자 계정/로그인 시스템 (MVP에서 제외)
- 3개 이외 사이트 지원 (세티즌, 에누리 등은 추후 검토)
- 모바일 앱 (웹앱만, 반응형 지원)

---

## 기능 요구사항

### 1. 통합 검색
- 키워드 입력 시 3개 사이트 동시 검색 (병렬 fetch)
- 결과를 최신순 / 가격순으로 정렬
- 사이트별 필터링 가능
- 검색 결과 카드: 이미지, 제목, 가격, 사이트, 등록시간, 링크

### 2. 가격 비교
- 검색 결과 내 동일 키워드 물품의 사이트별 최저가 표시
- 가격 분포 요약 (최저/평균/최고)

### 3. 알림 기능
- 키워드 등록 (D1 저장)
- 알림 목록 조회 및 삭제
- 신규 매물 자동 감지는 추후 스코프 (현재 MVP 제외)

---

## 비기능 요구사항

### 성능
- 검색 결과 응답: 3초 이내 (병렬 처리)
- 검색 결과 KV 캐싱: 5분
- Core Web Vitals LCP < 2.5s

### 보안
- 서버사이드에서만 외부 사이트 fetch (클라이언트 직접 요청 금지)
- Rate Limiting: IP당 분당 30회 검색 제한
- CORS 설정으로 자체 도메인만 허용

### Cloudflare 제약사항
- Edge Runtime: Node.js 내장 모듈 사용 불가 (`fs`, `path`, `crypto` 등)
- CPU 시간 제한: Workers Free 10ms / Paid 30s
- `@cloudflare/next-on-pages` 어댑터 사용
- `runtime = 'edge'` 명시 필요한 Route Handlers

---

## 모듈 구조

```
/
├── front/    # Next.js 14 (Cloudflare Pages 배포)
└── back/     # Hono.js on Cloudflare Workers 배포)
```

## 시스템 아키텍처

```
┌────────────────────────┐     ┌────────────────────────────────┐
│   Cloudflare Pages     │     │     Cloudflare Workers         │
│                        │     │                                │
│   front/               │     │   back/                        │
│   ┌────────────────┐   │     │   ┌──────────────────────┐    │
│   │  Next.js App   │──────▶  │   │  Hono.js API         │    │
│   │  (UI only)     │   │     │   │  GET /api/search      │    │
│   └────────────────┘   │     │   │  CRUD /api/alerts     │    │
│                        │     │   └──────────┬───────────┘    │
└────────────────────────┘     │              │                 │
                               │   ┌──────────▼───────────┐    │
                               │   │  Cloudflare Services  │    │
                               │   │  KV: 검색결과 캐시    │    │
                               │   │  D1: 알림 데이터      │    │
                               │   └───────────────────────┘    │
                               └────────────────────────────────┘
                                              │
                           ┌──────────────────┼──────────────────┐
                           ▼                  ▼                  ▼
                     당근마켓 API        번개장터 API       중고나라(Naver)
```

---

## 데이터 모델

### SearchResult
```typescript
interface SearchResult {
  id: string
  site: 'daangn' | 'bunjang' | 'joonggonara'
  title: string
  price: number
  imageUrl: string
  productUrl: string
  location?: string       // 당근마켓 지역
  condition?: string      // 상품 상태
  createdAt: string       // ISO 8601
}
```

### Alert (D1)
```typescript
interface Alert {
  id: string
  keyword: string
  minPrice?: number
  maxPrice?: number
  sites: string[]         // 알림 받을 사이트
  notifyEmail?: string
  lastCheckedAt: string
  createdAt: string
}
```

---

## 외부 API 조사

| 사이트 | 방법 | 비고 |
|--------|------|------|
| 번개장터 | 비공개 API (JSON) | `api.bunjang.co.kr/api/1/find_products` |
| 당근마켓 | 비공개 API (JSON) | `api.당근.com` 분석 필요 |
| 중고나라 | Naver Cafe API / 스크래핑 | Naver Search API 활용 가능 |

---

## 기술 스택 상세

| 영역 | 기술 |
|------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v3 |
| Deployment | Cloudflare Pages |
| Runtime | @cloudflare/next-on-pages |
| DB | Cloudflare D1 |
| Cache | Cloudflare KV |
| Backend Framework | Hono.js |
| Package Manager | pnpm (워크스페이스) |
