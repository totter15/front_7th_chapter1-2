# 🧭 Issue: 반복 일정 표시

## 🎯 목적 (Goal)

캘린더 뷰에서 반복 일정을 아이콘으로 구분해 사용자가 한눈에 식별할 수 있게 한다.

---

## 📋 요구사항 (Requirements)

- 캘린더 뷰에서 반복 일정에는 반복 아이콘이 표시된다.
- 단일(비반복) 일정에는 아이콘이 표시되지 않는다.
- 아이콘은 접근성 속성으로 `aria-label` 또는 `title`에 "반복 일정"을 제공한다.
- 테스트 자동화를 위해 식별 가능한 `data-testid` 또는 역할/이름 쿼리가 가능해야 한다.
- 아이콘 표시는 반복 생성/계산 로직을 변경하지 않는다(표시 전용).
- 다크/라이트 모드에서 아이콘 가시성이 확보되어야 한다(충분한 대비).

---

## 🧩 맥락 & 범위 (Context & Scope)

- Impacted Areas: UI | Hooks | Tests
- Out of Scope:
  - 반복 일정 생성/편집/계산 로직 변경
  - 아이콘 클릭 시 추가 동작(툴팁/모달/메뉴) 구현
  - 일정 겹침 처리/알림 로직

---

## 🧪 테스트 계획 요약 (Test Plan Summary)

### 테스트 시나리오 개요 (Scenario Overview)

- SC-01: 월/주 캘린더 뷰에서 반복 일정에만 "반복 일정" 아이콘이 표시된다.
- SC-02: 비반복 일정에는 아이콘이 표시되지 않는다(월/주 뷰 모두 동일).
- SC-03: 아이콘은 접근성 속성 `aria-label="반복 일정"`을 가진다(쿼리 가능).
- SC-04: 테스트 자동화를 위한 `data-testid="recurring-icon"` 속성이 부여된다.
- SC-05: 아이콘 표시는 이벤트 수·정렬·필터 결과에 영향을 주지 않는다(표시 전용).
- SC-06: 다크/라이트 모드 가시성은 시각 리그레션 또는 수동 점검으로 확인한다.

#### 테스트 계획 요약

- **테스트 유형**: Integration 중심(App 렌더링 후 상호작용) + 경량 UI 단위 검증
- **대상 뷰**: `month-view`, `week-view`의 일자 셀 이벤트 아이템
- **식별자/접근성**:
  - 기본 쿼리: `getByLabelText(/반복 일정/)`
  - 백업 쿼리: `getByTestId('recurring-icon')`
- **시나리오 구현 가이드**:
  1. 폼을 통해 비반복 일정 1건과 반복 일정(예: type: 'daily') 1건을 추가한다.
  2. 현재 달/주에 포함되도록 날짜를 설정한다.
  3. 각 뷰에서 반복 일정에만 아이콘이 노출되는지 확인한다.
  4. 검색/필터 변경 시 아이콘 유무가 논리 데이터에 영향 주지 않음을 확인한다.
- **예상 영향 파일**: `src/__tests__/medium.integration.spec.tsx` 또는 신규 `src/__tests__/medium/recurringIcon.integration.spec.tsx`
- **비고**: 다크/라이트 대비는 시각적 요구사항으로, 자동 테스트는 라벨/존재성 검증에 집중하고, 대비는 수동 체크리스트로 병행한다.

### 테스트 케이스 상세 (Test Case Detail)

| TC ID | 목적                                  | 전제조건                                                         | 입력/행동                     | 기대결과                                                                                                         | 고려사항                                                 |
| ----- | ------------------------------------- | ---------------------------------------------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| TC-01 | 월 뷰: 반복 일정 아이콘 표시 확인     | 반복 일정 1건 존재 (repeat.type ≠ 'none'), 해당 월에 날짜 포함   | App 렌더 → `month-view` 노출  | 해당 이벤트 아이템에 아이콘 존재, `getByLabelText(/반복 일정/)` 또는 `getByTestId('recurring-icon')`로 조회 가능 | 아이콘 위치는 이벤트 아이템 내부 어느 곳이든 허용        |
| TC-02 | 월 뷰: 비반복 일정 아이콘 미표시 확인 | 비반복 일정 1건 존재 (repeat.type = 'none'), 해당 월에 날짜 포함 | App 렌더 → `month-view` 노출  | 해당 이벤트 아이템에 아이콘 없음                                                                                 | 동일 날짜에 반복/비반복이 섞여 있어도 규칙 유지          |
| TC-03 | 주 뷰: 반복 일정 아이콘 표시 확인     | 반복 일정 1건 존재, 해당 주에 날짜 포함                          | App 렌더 → `week-view` 전환   | 해당 이벤트 아이템에 아이콘 존재, 접근성/테스트 식별자로 조회 가능                                               | 주 뷰 렌더링 로직과 무관하게 동일 규칙 적용              |
| TC-04 | 주 뷰: 비반복 일정 아이콘 미표시 확인 | 비반복 일정 1건 존재, 해당 주에 날짜 포함                        | App 렌더 → `week-view` 전환   | 해당 이벤트 아이템에 아이콘 없음                                                                                 |                                                          |
| TC-05 | 접근성 속성 검증(라벨)                | 반복 일정 1건 존재                                               | 해당 아이콘 요소 선택         | `aria-label="반복 일정"` 속성 보유                                                                               | 지역화 문자열 고정(정확 매치)                            |
| TC-06 | 자동화 식별자 검증(data-testid)       | 반복 일정 1건 존재                                               | 해당 아이콘 요소 선택         | `data-testid="recurring-icon"` 속성 보유                                                                         | 테스트 안정성 보장을 위해 필수                           |
| TC-07 | 표시 전용 동작 보장(검색/필터 독립)   | 반복/비반복 일정 각 1건 존재, 서로 다른 제목                     | 검색어를 비반복 제목으로 설정 | 리스트/뷰에 비반복만 남고, 그 아이템에는 아이콘이 없음. 검색 전후 이벤트 개수/정렬 로직 변화 없음                | 아이콘 유무는 표시 전용이며 데이터/정렬/필터에 영향 없음 |
| TC-08 | 다크/라이트 모드 가시성(수동)         | 테마 전환 가능 환경                                              | 다크/라이트 모드 토글         | 두 모드에서 아이콘이 주변 대비와 충분히 구분됨                                                                   | 수동 체크리스트 또는 시각 리그레션 도구로 보조 검증      |

---

## 🔁 TDD 사이클 (Red → Green → Refactor)

- [ ] Red: 실패하는 테스트 추가 (Test Code Agent)
- [ ] Green: 최소 구현으로 통과 (Implementation Agent)
- [ ] Refactor: 동작 동일, 구조/가독성 개선 (Refactoring Agent)

---

## 🧠 에이전트 작업 로그 (Agent Work Log)

### 🧩 테스트 설계 에이전트 (Test Design)

- Inputs: Story/AC, Context
- Actions: 테스트 유형/파일 배치 설계, 모킹 전략 수립
- Outputs: 테스트 계획 요약/시나리오/케이스 상세 업데이트
- Artifacts: (별도 문서 없음)
  <!-- TEST_DESIGN_START -->

  Inputs:

  - Issue 목적/요구사항/범위
  - 현 코드의 이벤트 구조(`repeat.type`), 캘린더 뷰(App의 month/week 렌더링)

  Actions:

  - 반복 일정 표시 요구사항을 테스트 가능 항목으로 분해
  - 접근성/식별자(`aria-label`, `data-testid`) 기준 정의
  - 월/주 뷰 공통 시나리오 설계, 자동/수동 검증 구분

  Outputs:

  - SC-01 ~ SC-06 구체화
  - 테스트 케이스 상세(TC-01 ~ TC-08) 작성
  - 테스트 구현 가이드/대상 파일 제안

  Artifacts:

  - (N/A) — 코드 변경 전 단계, 테스트 계획만 수립
  <!-- TEST_DESIGN_END -->

---

### 🧪 테스트 코드 작성 에이전트 (Test Code)

- Inputs: Test Plan, Matrix
- Actions: 스캐폴딩/테스트 구현(단계적), 실패 확인
- Outputs: 커밋/PR 링크, 주요 테스트 스니펫
- Artifacts: `src/__tests__/*`
  <!-- TEST_CODE_START -->

  Inputs:

  - 테스트 케이스: TC-01 ~ TC-07
  - 초기 이벤트 데이터(msw): 반복 1건(daily), 비반복 1건(none)

  Actions:

  - 통합 테스트 신규 추가(`month`/`week` 뷰)
  - 접근성 쿼리(`getByLabelText('반복 일정')`) 및 `data-testid('recurring-icon')` 검증
  - 검색어 적용 시 아이콘 비노출(표시 전용 보장) 확인

  Outputs:

  - 새로운 통합 테스트 파일 추가 및 TC-01~TC-07 구현(RED 예상)

  Artifacts:

  - 생성 파일: `src/__tests__/integration/recurringIcon.integration.spec.tsx`

  <!-- TEST_CODE_END -->

---

### 💻 코드 작성 에이전트 (Implementation)

- Inputs: 실패 테스트
- Actions: 최소 구현(Green)
- Outputs: 변경 파일/주요 변경 요약
- Artifacts: 소스 코드 경로
  <!-- IMPLEMENTATION_START -->

  Inputs:

  - 실패 테스트: `src/__tests__/integration/recurringIcon.integration.spec.tsx` (TC-01,03,05,06)
  - 요구사항 핵심: 반복 일정에만 아이콘 표시, `aria-label="반복 일정"`, `data-testid="recurring-icon"`

  Actions:

  - `src/App.tsx`
    - 월/주 뷰의 이벤트 항목에 반복 아이콘 요소 추가: `<span role="img" aria-label="반복 일정" data-testid="recurring-icon">🔁</span>` (반복 일정에만 노출)

  Outputs:

  - 모든 테스트 GREEN (recurringIcon 스위트 포함)

  Artifacts:

  - 변경 파일: `src/App.tsx`
  <!-- IMPLEMENTATION_END -->

---

### 🔧 리팩토링 에이전트 (Refactoring)

- Inputs: Green 상태
- Actions: 중복 제거/구조 개선/명명 개선(동작 동일)
- Outputs: 리팩토링 포인트/전후 비교
- Safeguard: 모든 테스트 Green 유지
  <!-- REFACTORING_START -->

  Inputs:

  - Green 상태의 구현 (`src/App.tsx`)
  - 월/주 뷰 모두에서 반복 아이콘 마크업이 중복되어 존재

  Actions:

  - 반복 여부 판단 로직 추출: `isRecurringEvent(event)` 헬퍼 추가
  - 아이콘 마크업 추출: `RecurringIcon` 컴포넌트 추가(접근성 라벨/테스트 ID 유지)
  - 월/주 뷰에서 중복 마크업을 헬퍼/컴포넌트로 대체(동작/레이아웃 동일)
  - 린트 확인: 신규 오류 없음

  Outputs:

  - 중복 제거 및 가독성 향상, 접근성/테스트 안정성 유지
  - 행위 불변(표시 조건/속성 동일)

  Artifacts:

  - 변경 파일: `src/App.tsx`
  <!-- REFACTORING_END -->

---

## 🧾 요약 (Summary)

- 상태: `코드 작성(Green) 완료`
- 마지막 수정 에이전트: 코드 작성 에이전트(Nova)
- 주요 변경사항 요약: 월/주 뷰에 반복 아이콘 표시 요소 추가(접근성 라벨/테스트ID), 모든 테스트 GREEN
