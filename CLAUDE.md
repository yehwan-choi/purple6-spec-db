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

### 데이터 흐름 (Phase 2 — Supabase)

모든 데이터는 Supabase PostgreSQL에서 가져옵니다. `src/lib/supabase.ts`에서 클라이언트를 초기화하고, `src/lib/data.ts`에서 타입이 지정된 비동기 쿼리 함수들(`getMaterials`, `getDistributorById`, `getDistributorsForMaterial` 등)을 내보냅니다. **서버 컴포넌트는 이 함수들을 `await`으로 호출합니다.**

데이터 변경(생성·수정·삭제)은 모두 `src/lib/actions.ts`의 **Server Action**으로 처리합니다. 각 Action은 Supabase 쿼리를 수행한 뒤 `revalidatePath()`로 캐시를 무효화합니다.

마감재와 업체 간의 M:N 관계는 `material_distributor_links` 조인 테이블로 해소합니다.

### 렌더링 패턴

`src/app/` 하위 페이지는 **기본적으로 Server Component**입니다. 렌더 시점에 `src/lib/data.ts`를 `await`로 호출하고 결과를 props로 전달합니다. 검색 입력이나 드롭다운 같은 인터랙티브 필터링은 `src/components/{domain}/` 하위의 전용 `"use client"` 컴포넌트로 분리되어 있습니다.

- `MaterialsFilter.tsx` — 서버에서 전체 목록을 받아 브라우저에서 `useMemo`로 필터링
- `DistributorsFilter.tsx` — 동일한 패턴

클라이언트 번들을 작게 유지하기 위해 전역 상태 라이브러리는 사용하지 않습니다.

### Server Actions (`src/lib/actions.ts`)

모든 뮤테이션은 이 파일의 Server Action으로 처리합니다. 주요 함수:

| 도메인 | 함수 |
|---|---|
| 마감재 | `createMaterial`, `updateMaterial`, `deleteMaterial` |
| 카테고리 | `createMaterialCategory`, `updateMaterialCategory`, `deleteMaterialCategory` |
| 업체 | `createDistributor`, `updateDistributorInfo`, `deleteDistributor` |
| 담당자 | `createDistributorContact(distributorId, id, data)`, `updateDistributorContact(id, distributorId, data)`, `deleteDistributorContact(id, distributorId)` |
| 마감재↔업체 | `addMaterialToDistributor`, `removeMaterialFromDistributor` |
| 프로젝트 | `createProject`, `updateProjectStatus`, `deleteProject` |
| 스펙 | `addProjectSpec`, `updateProjectSpec`, `deleteProjectSpec` |
| 업체 유형 | `createDistributorType`, `updateDistributorType`, `deleteDistributorType` |

이미지 업로드(`createMaterial`)는 Supabase Storage `material-images` 버킷에 저장하고, `material_image` 컬럼에 공개 URL을 기록합니다.

### 데이터베이스 스키마 (Supabase)

핵심 테이블 (`supabase/schema.sql` 및 마이그레이션 파일 참조):

| 테이블 | 주요 컬럼 |
|---|---|
| `material_categories` | id, category_eng, category_kor, code_prefix |
| `materials` | id, category_id, material_item, material_finish, material_size, material_image |
| `distributors` | id, distributor_type, company_name, address, note, homepage |
| `distributor_contacts` | id, distributor_id, name, role, phone, email |
| `distributor_types` | id, label_kor, sort_order, is_material |
| `material_distributor_links` | material_id, distributor_id |
| `projects` | id, project_name, project_client, project_year, status("draft"\|"completed") |
| `project_specs` | id, project_id, material_id, distributor_id, contact_id, code_suffix, quantity, area, location, description, price, delivery, memo |

RLS(Row-Level Security)가 활성화되어 있으며, anon 키로 읽기·쓰기·삭제 모두 허용됩니다(`supabase/rls_insert.sql`, `supabase/add_missing_update_policies.sql`).

### 테마

디자인 토큰은 `src/app/globals.css`의 `@layer base` 안에 CSS 커스텀 속성(`--primary`, `--muted-foreground` 등)으로 정의합니다. Tailwind v4의 `@theme inline`이 이 변수들을 `--color-*` 토큰으로 매핑하므로 `bg-primary`, `text-muted-foreground` 같은 시맨틱 유틸리티 클래스가 정상 동작합니다. **`@tailwind base/components/utilities` 디렉티브를 사용하지 마세요** — Tailwind v4에서는 `@import "tailwindcss"`를 사용합니다.

PostCSS 플러그인은 `tailwindcss`가 아닌 `@tailwindcss/postcss`이며, `postcss.config.mjs`에 설정되어 있습니다.

### UI 컴포넌트

shadcn/ui 컴포넌트는 `src/components/ui/`에 직접 작성되어 있습니다 — **`npx shadcn-ui add`를 실행하지 마세요.** CLI가 구버전 Tailwind를 타겟으로 하기 때문입니다. 새 프리미티브를 추가할 때는 기존 패턴을 따르세요: Radix UI 프리미티브를 `cn()`으로 className을 병합하고 `cva`로 variant를 관리합니다.

`src/lib/utils.ts`는 코드베이스 전반에서 사용되는 두 가지 헬퍼를 내보냅니다.
- `cn(...inputs)` — `clsx` + `twMerge`
- `formatPrice(price)` — `Intl.NumberFormat`을 `ko-KR` / `KRW`로 포맷

### 타입

모든 도메인 타입은 `src/types/index.ts`에 있습니다. 데이터베이스 스키마와 1:1로 대응합니다.

주요 타입: `Material`, `MaterialCategory`, `Distributor`, `DistributorContact`, `DistributorType`, `Project`, `ProjectSpec`

### 라우팅

| 라우트 | 타입 | 설명 |
|---|---|---|
| `/` | Static | 대시보드 — 전체 데이터 집계 |
| `/materials` | Static | 목록 페이지, 필터는 클라이언트 사이드 |
| `/materials/[id]` | Dynamic | 서버 렌더링 상세 페이지 (탭: 기본정보·업체·프로젝트) |
| `/materials/categories` | Static | 카테고리 CRUD 관리 |
| `/distributors` | — | `/distributors/material` 또는 `/distributors/other`로 리다이렉트 |
| `/distributors/material` | Static | 마감재 업체 목록, 필터는 클라이언트 사이드 |
| `/distributors/other` | Static | 기타 업체 목록 |
| `/distributors/types` | Static | 업체 유형 CRUD 관리 |
| `/distributors/[id]` | Dynamic | 서버 렌더링 상세 페이지 (인라인 편집, 담당자·마감재 CRUD, 참여 프로젝트 읽기 전용) |
| `/projects` | — | `/projects/draft`로 리다이렉트 |
| `/projects/draft` | Static | 진행 중 프로젝트 목록 |
| `/projects/completed` | Static | 완료 프로젝트 목록 |
| `/projects/[id]` | Dynamic | 스펙북 테이블 |
| `/specbook` | Static | 스펙북 전체 보기 |

사이드바(`src/components/layout/Sidebar.tsx`)는 너비 288px의 sticky 포지션이며 접이식 하위 메뉴를 지원합니다. 새로운 최상위 섹션을 추가할 때는 해당 파일의 `navItems` 배열에 항목을 추가하세요.

## 환경 변수

`.env.local`에 다음 두 값이 필요합니다:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## 컴포넌트 설계 규칙

### 업체↔프로젝트 관계
업체와 프로젝트의 관계는 `project_specs` 테이블에서 파생됩니다. **별도로 관리하지 않습니다.**
- 업체 상세(`/distributors/[id]`)의 "참여 프로젝트" 섹션은 읽기 전용입니다.
- 스펙에 업체를 지정하면 자동으로 연결이 형성됩니다.
- `project_specs`에 직접 삽입해서 업체↔프로젝트 관계를 만들지 마세요 — 데이터 파괴 위험이 있습니다.

### 스펙 폼 공유 컴포넌트
`src/components/projects/spec-form-helpers.tsx`에 `SearchCombobox`, `Field`, `InfoRow`가 정의되어 있습니다. `AddSpecModal`과 `EditSpecModal` 모두 이 파일에서 import합니다. 스펙 폼에 UI 요소를 추가할 때 이 파일을 먼저 확인하세요.

### 담당자 CRUD 시그니처
담당자 관련 Server Action은 `revalidatePath`를 위해 `distributorId`를 명시적으로 받습니다:
- `createDistributorContact(distributorId, id, data)`
- `updateDistributorContact(id, distributorId, data)`
- `deleteDistributorContact(id, distributorId)`

## 주의사항

- ESLint 9 flat config를 사용합니다(`eslint.config.mjs`). 이 버전에서는 기존 `.eslintrc.*` 형식이 조용히 실패합니다.
- `next.config.ts`와 `next.config.mjs` 모두 지원됩니다. 현재 프로젝트는 `next.config.mjs`를 사용합니다.
- React 19 및 `@types/react` v19가 함께 설치되어 있습니다.
- 스키마 변경 시 `supabase/` 하위에 새 마이그레이션 SQL 파일을 추가하고, `src/types/index.ts`와 `src/lib/data.ts`도 함께 업데이트하세요.
