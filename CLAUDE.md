# CLAUDE.md

이 파일은 Claude Code(claude.ai/code)가 이 저장소에서 작업할 때 참고하는 가이드입니다.

## 명령어

```bash
npm run dev      # 개발 서버 실행 (http://localhost:3000)
npm run build    # 프로덕션 빌드 (TypeScript 타입 검사 + ESLint 포함)
npm run lint     # ESLint만 실행
npm run start    # 프로덕션 빌드 서빙
```

테스트 환경은 아직 구성되지 않았습니다.

## 아키텍처

### 데이터 흐름 (Phase 1 — 더미 데이터)

모든 데이터는 `src/data/dummy.json` 단일 파일에서 가져옵니다. 이 파일은 `src/lib/data.ts`에서 한 번 임포트된 뒤, 타입이 지정된 접근 함수들(`getMaterials`, `getVendorById`, `getVendorsForMaterial` 등)로 재내보내집니다. **서버 컴포넌트는 이 함수들을 직접 호출하며 fetch나 async가 없습니다.** 추후 Supabase를 도입할 때는 `src/lib/data.ts`만 교체하면 됩니다.

마감재와 업체 간의 M:N 관계는 `material_vendor_links` 배열로 해소하며, 이는 향후 SQL 조인 테이블과 동일한 구조입니다.

### 렌더링 패턴

`src/app/` 하위 페이지는 **기본적으로 Server Component**입니다. 렌더 시점에 `src/lib/data.ts`를 호출하고 결과를 props로 전달합니다. 검색 입력이나 드롭다운 같은 인터랙티브 필터링은 `src/components/{domain}/` 하위의 전용 `"use client"` 컴포넌트로 분리되어 있습니다.

- `MaterialsFilter.tsx` — 서버에서 전체 목록을 받아 브라우저에서 `useMemo`로 필터링
- `VendorsFilter.tsx` — 동일한 패턴

클라이언트 번들을 작게 유지하기 위해 전역 상태 라이브러리는 사용하지 않습니다.

### 테마

디자인 토큰은 `src/app/globals.css`의 `@layer base` 안에 CSS 커스텀 속성(`--primary`, `--muted-foreground` 등)으로 정의합니다. Tailwind v4의 `@theme inline`이 이 변수들을 `--color-*` 토큰으로 매핑하므로 `bg-primary`, `text-muted-foreground` 같은 시맨틱 유틸리티 클래스가 정상 동작합니다. **`@tailwind base/components/utilities` 디렉티브를 사용하지 마세요** — Tailwind v4에서는 `@import "tailwindcss"`를 사용합니다.

PostCSS 플러그인은 `tailwindcss`가 아닌 `@tailwindcss/postcss`이며, `postcss.config.mjs`에 설정되어 있습니다.

### UI 컴포넌트

shadcn/ui 컴포넌트는 `src/components/ui/`에 직접 작성되어 있습니다 — **`npx shadcn-ui add`를 실행하지 마세요.** CLI가 구버전 Tailwind를 타겟으로 하기 때문입니다. 새 프리미티브를 추가할 때는 기존 패턴을 따르세요: Radix UI 프리미티브를 `cn()`으로 className을 병합하고 `cva`로 variant를 관리합니다.

`src/lib/utils.ts`는 코드베이스 전반에서 사용되는 두 가지 헬퍼를 내보냅니다.
- `cn(...inputs)` — `clsx` + `twMerge`
- `formatPrice(price)` — `Intl.NumberFormat`을 `ko-KR` / `KRW`로 포맷

### 타입

모든 도메인 타입은 `src/types/index.ts`에 있습니다. `CAT1_LIST`와 `CAT2_MAP`은 2단계 카테고리 계층 구조의 단일 진실 소스(Single Source of Truth)입니다 — UI 필터와 향후 유효성 검사 모두에서 이 상수를 사용하세요.

`Material.vendors`는 더미 데이터 형태에서 이어받은 비정규화된 string 배열(vendor ID 목록)입니다. 정식 관계는 `material_vendor_links`입니다. 쿼리 로직을 추가할 때 `Material.vendors`를 직접 읽기보다 `getMaterialsForVendor` / `getVendorsForMaterial`을 사용하는 것을 권장합니다.

### 라우팅

| 라우트 | 타입 | 설명 |
|---|---|---|
| `/` | Static | 대시보드 — 전체 데이터 집계 |
| `/materials` | Static | 목록 페이지, 필터는 클라이언트 사이드 |
| `/materials/[id]` | Dynamic | 서버 렌더링 상세 페이지 |
| `/vendors` | Static | 카드 그리드, 필터는 클라이언트 사이드 |
| `/vendors/[id]` | Dynamic | 서버 렌더링 상세 페이지 |
| `/projects` | Static | 카드 그리드 |
| `/projects/[id]` | Dynamic | 스펙북 테이블 |

사이드바(`src/components/layout/Sidebar.tsx`)는 너비 240px의 fixed 포지션이며, `<main>`은 이를 보정하기 위해 `ml-60`을 적용합니다. 새로운 최상위 섹션을 추가할 때는 해당 파일의 `navItems` 배열에 항목을 추가하세요.

## 주의사항

- ESLint 9 flat config를 사용합니다(`eslint.config.mjs`). 이 버전에서는 기존 `.eslintrc.*` 형식이 조용히 실패합니다.
- `next.config.ts`와 `next.config.mjs` 모두 지원됩니다. 현재 프로젝트는 `next.config.mjs`를 사용합니다.
- React 19 및 `@types/react` v19가 함께 설치되어 있습니다.
