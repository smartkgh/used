# 태스크 목록

## 프로젝트 폴더 구조

```
/                               # 모노레포 루트
├── front/                      # Next.js 프론트엔드 모듈
│   ├── src/
│   │   ├── app/                # App Router (페이지만)
│   │   │   ├── page.tsx        # 메인 검색 페이지
│   │   │   ├── search/
│   │   │   │   └── page.tsx    # 검색 결과 페이지
│   │   │   ├── alerts/
│   │   │   │   └── page.tsx    # 알림 관리 페이지
│   │   │   └── layout.tsx
│   │   ├── components/         # UI 컴포넌트
│   │   └── hooks/              # 커스텀 훅
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   └── package.json
│
├── back/                       # Cloudflare Workers 백엔드 모듈 (Hono.js)
│   ├── src/
│   │   ├── routes/             # API 라우트
│   │   │   ├── search.ts       # GET /api/search
│   │   │   └── alerts.ts       # CRUD /api/alerts
│   │   ├── scrapers/           # 사이트별 검색 어댑터
│   │   │   ├── bunjang.ts
│   │   │   ├── daangn.ts
│   │   │   └── joonggonara.ts
│   │   ├── types/              # 공유 타입 정의
│   │   │   └── index.ts
│   │   └── index.ts            # Hono 앱 엔트리
│   ├── wrangler.toml
│   └── package.json
│
├── pnpm-workspace.yaml
└── package.json                # 루트 (공통 스크립트)
```

---

## Phase 1: 프로젝트 셋업

### TASK-001: 모노레포 초기화
- **작업**: pnpm 워크스페이스 기반 모노레포 구성
- **의존성**: 없음
- **완료 기준**:
  - 루트 `pnpm-workspace.yaml` 설정 (`front/`, `back/` 포함)
  - 루트 `package.json` 공통 스크립트 설정 (`dev`, `build`, `deploy`)
  - Node.js 버전 `.nvmrc` 또는 `engines` 필드 명시

### TASK-002: front 모듈 초기화
- **작업**: Cloudflare Pages용 Next.js 14 프로젝트 생성
- **의존성**: TASK-001
- **완료 기준**:
  - `front/` 에 `create-next-app` 실행 (TypeScript, Tailwind, App Router)
  - `@cloudflare/next-on-pages` 설치 및 `next.config.ts` 설정
  - `front/wrangler.toml` 기본 설정
  - `pnpm --filter front dev` 실행 확인

### TASK-003: back 모듈 초기화
- **작업**: Hono.js 기반 Cloudflare Workers 백엔드 초기화
- **의존성**: TASK-001
- **완료 기준**:
  - `back/` 에 Hono.js + TypeScript 설정
  - `back/wrangler.toml` 설정 (D1, KV 바인딩 포함)
  - `pnpm --filter back dev` (wrangler dev) 실행 확인

### TASK-004: Cloudflare 리소스 생성
- **작업**: D1 데이터베이스 및 KV 네임스페이스 생성
- **의존성**: TASK-003
- **완료 기준**:
  - `wrangler d1 create used-market-db` 실행
  - `wrangler kv:namespace create search-cache` 실행
  - `back/wrangler.toml`에 바인딩 ID 등록
  - `back/src/db/migrations/0001_alerts.sql` 마이그레이션 파일 작성

---

## Phase 2: 백엔드 (back 모듈)

### TASK-005: 공유 타입 정의
- **작업**: SearchResult, Alert 인터페이스 정의
- **의존성**: TASK-003
- **완료 기준**:
  - `back/src/types/index.ts` 에 SearchResult, Alert 타입 정의
  - front에서 참조할 수 있도록 타입 export

### TASK-006: 번개장터 검색 어댑터
- **작업**: 번개장터 API 연동 모듈 개발
- **의존성**: TASK-005
- **완료 기준**:
  - `back/src/scrapers/bunjang.ts` 구현
  - 키워드 검색 → SearchResult[] 반환
  - 에러 시 빈 배열 반환 (독립 실패 처리)

### TASK-007: 당근마켓 검색 어댑터
- **작업**: 당근마켓 API 연동 모듈 개발
- **의존성**: TASK-005
- **완료 기준**:
  - `back/src/scrapers/daangn.ts` 구현
  - 키워드 검색 → SearchResult[] 반환
  - 에러 시 빈 배열 반환

### TASK-008: 중고나라 검색 어댑터
- **작업**: 중고나라(Naver) API 연동 모듈 개발
- **의존성**: TASK-005
- **완료 기준**:
  - `back/src/scrapers/joonggonara.ts` 구현
  - Naver Search API 또는 직접 API 연동
  - 키워드 검색 → SearchResult[] 반환
  - 에러 시 빈 배열 반환

### TASK-009: 통합 검색 API
- **작업**: `GET /api/search` 엔드포인트 개발
- **의존성**: TASK-006, TASK-007, TASK-008
- **완료 기준**:
  - `back/src/routes/search.ts` 구현
  - `GET /api/search?q=키워드&sites=daangn,bunjang,joonggonara`
  - 3개 어댑터 병렬 실행 (Promise.allSettled)
  - KV 캐싱 (캐시 키: `search:{keyword}:{sites}`, TTL 5분)
  - 결과 정렬 (최신순/가격순) 쿼리 파라미터 지원

### TASK-010: 알림 API (CRUD)
- **작업**: 알림 구독 관리 API 개발
- **의존성**: TASK-004
- **완료 기준**:
  - `back/src/routes/alerts.ts` 구현
  - `POST /api/alerts` - 알림 등록
  - `GET /api/alerts` - 알림 목록 조회
  - `DELETE /api/alerts/:id` - 알림 삭제
  - D1 바인딩 사용

---

## Phase 3: 프론트엔드 (front 모듈)

### TASK-011: 레이아웃 및 공통 컴포넌트
- **작업**: 앱 레이아웃, 헤더, 공통 UI 컴포넌트 개발
- **의존성**: TASK-002
- **완료 기준**:
  - `front/src/app/layout.tsx` - 헤더, 네비게이션 포함
  - `front/src/components/SearchBar.tsx`
  - `front/src/components/SiteFilter.tsx` (체크박스)
  - `front/src/components/SortSelect.tsx`
  - 반응형 레이아웃 (모바일/데스크탑)

### TASK-012: 검색 결과 페이지
- **작업**: 메인 검색 및 결과 표시 페이지
- **의존성**: TASK-009, TASK-011
- **완료 기준**:
  - `front/src/app/page.tsx` - 검색창 메인 페이지
  - `front/src/app/search/page.tsx` - 결과 페이지
  - `front/src/components/ProductCard.tsx` (이미지, 제목, 가격, 사이트 배지, 링크)
  - 로딩 스켈레톤 UI
  - 에러 상태 처리
  - 가격 요약 (최저/평균/최고) 표시

### TASK-013: 알림 관리 페이지
- **작업**: 알림 키워드 등록/조회/삭제 UI
- **의존성**: TASK-010, TASK-011
- **완료 기준**:
  - `front/src/app/alerts/page.tsx` 구현
  - 키워드 등록 폼 (키워드, 가격 범위, 사이트 선택)
  - 등록된 알림 목록 표시
  - 알림 삭제 기능

---

## Phase 4: 배포 및 최적화

### TASK-014: Cloudflare 배포 설정
- **작업**: front/back 각각 Cloudflare 배포 설정
- **의존성**: 모든 Phase 완료
- **완료 기준**:
  - `back/` → Cloudflare Workers 배포 (`wrangler deploy`)
  - `front/` → Cloudflare Pages 배포 (GitHub 연동)
  - 환경 변수 (BACK_API_URL 등) 설정
  - Production / Preview 환경 분리

### TASK-015: 성능 최적화
- **작업**: 검색 성능 및 UX 최적화
- **의존성**: TASK-012
- **완료 기준**:
  - 이미지 최적화 (next/image)
  - 검색 디바운싱 적용
  - 무한 스크롤 또는 페이지네이션
  - Core Web Vitals 측정 및 LCP < 2.5s 달성

---

## 우선순위 순서

```
TASK-001
├── TASK-002 (front 초기화)
│   └── TASK-011 → TASK-012, TASK-013
└── TASK-003 (back 초기화)
    ├── TASK-004 (CF 리소스)
    │   └── TASK-010 → TASK-013
    └── TASK-005 (타입 정의)
        ├── TASK-006, TASK-007, TASK-008 (병렬)
        └── TASK-009 → TASK-012

TASK-014 → TASK-015
```
