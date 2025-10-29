## 캘린더 앱 아키텍처

### 개요

React + Vite + TypeScript 기반의 단일 페이지 앱. 상태는 커스텀 훅으로 모듈화하고, 서버와는 REST API로 통신한다. 개발/테스트는 MSW 또는 로컬 Express 서버(JSON 파일)로 모킹한다.

### 구성도(텍스트)

```
UI(App.tsx, MUI)
  ├─ 훅: useEventForm (폼 상태/검증)
  ├─ 훅: useEventOperations (CRUD + 서버 통신)
  ├─ 훅: useCalendarView (뷰/현재 날짜/공휴일)
  ├─ 훅: useSearch (검색어 → 필터링)
  └─ 훅: useNotifications (주기적 알림)

유틸
  ├─ dateUtils (주/월 계산, 포맷)
  ├─ eventUtils (검색/기간 필터)
  ├─ eventOverlap (겹침 판단)
  ├─ notificationUtils (알림 대상/문구)
  └─ timeValidation (시간 유효성)

API
  ├─ /api/events (GET/POST/PUT/DELETE)
  └─ (개발용) Express 서버 or MSW
```

### 데이터 흐름(요약)

1. 사용자 입력 → `useEventForm` 상태 업데이트 및 시간 검증
2. 저장/수정/삭제 → `useEventOperations` → API 호출 → 성공 시 목록 재조회 → UI 반영
3. 뷰 전환/현재 날짜 변경 → `useCalendarView` → 공휴일 로드 → 주/월 뷰 렌더
4. 검색어 변경 → `useSearch` → `eventUtils.getFilteredEvents` → 리스트/뷰 반영
5. 알림 타이머(1초) → `useNotifications` → `notificationUtils.getUpcomingEvents` → 토스트 표시

### 상태 관리 전략

- 로컬 컴포넌트 상태(커스텀 훅) 중심
- 서버 데이터는 저장/수정/삭제 후 항상 재조회로 일관성 확보

### 서버/스토리지

- 개발: `server.js`(Express)에서 `src/__mocks__/response/*.json` 파일을 읽고/쓰기
- 테스트: MSW로 API 핸들러 모킹

### 에러/토스트 정책

- 네트워크/서버 오류 시 notistack로 에러 토스트 노출
- 성공/정보 액션에 성공/정보 토스트 노출

### 빌드/런타임

- Vite 개발 서버, Material UI 컴포넌트, TypeScript 엄격 모드 권장
