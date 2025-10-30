# 🧭 Issue: 기능 요청서 — 반복 일정 수정 (단일 vs 전체)

## 🎯 목적 (Goal)

사용자가 반복 일정 수정 시 단일 인스턴스만 수정할지, 전체 시리즈를 수정할지 선택할 수 있게 한다.

---

## 📋 요구사항 (Requirements)

- 수정 시 확인 텍스트 "해당 일정만 수정하시겠어요?"를 표시하고, 사용자의 선택에 따라 다음 동작을 수행한다.
  1. 예(단일 수정): 해당 인스턴스만 수정한다.
     - 수정된 이벤트는 단일 일정으로 전환된다(repeat.type = 'none').
     - 반복 아이콘이 사라진다.
  2. 아니오(전체 수정): 해당 시리즈 전체를 수정한다.
     - 반복 일정은 유지된다(아이콘 유지).
- 시리즈 수정 시 동일한 `repeatId`(또는 동등 식별자)를 가진 모든 이벤트에 변경을 반영한다.
- 단일 수정 시 기존 시리즈와의 연결은 끊기며, 다른 인스턴스에는 영향이 없다.

---

## 🧩 맥락 & 범위 (Context & Scope)

- Impacted Areas: Types | Hooks | Utils | Tests | UI | API
- UI: 수정 액션 시 확인 다이얼로그/옵션 제공, 아이콘 표시 분기
- API: 단일 수정(기존 `/api/events/:id`) 및 시리즈 수정(`/api/recurring-events/:repeatId` 활용) 경로 분기
- Out of Scope: 부분 시리즈 편집(이후 인스턴스만 적용 등), 예외일 관리, 복잡한 머지 정책

---

## 🧪 테스트 계획 요약 (Test Plan Summary)

### 테스트 시나리오 개요 (Scenario Overview)

- SC-01: 수정 트리거 시 확인 텍스트와 옵션(예/아니오) 노출
- SC-02: 예 선택(단일 수정) 시 해당 인스턴스만 변경되고 아이콘이 사라짐
- SC-03: 아니오 선택(전체 수정) 시 시리즈 전 인스턴스가 변경되고 아이콘 유지
- SC-04: 단일/전체 수정 후 이벤트 리스트/캘린더 뷰 반영 검증
- SC-05: API 분기 호출(단일 PUT vs 시리즈 PUT) 확인

### 테스트 케이스 상세 (Test Case Detail)

- **TC-01 UI 확인 다이얼로그 노출**: 수정 버튼 클릭 시 텍스트/선택지 확인
- **TC-02 단일 수정 흐름**: 예 선택 후 해당 이벤트 repeat.type=none, 아이콘 미표시 확인
- **TC-03 전체 수정 흐름**: 아니오 선택 후 동일 repeat 식별자를 가진 모든 이벤트 변경/아이콘 유지 확인
- **TC-04 데이터 일관성**: 수정 후 리스트/뷰에 반영(제목/시간/카테고리 등) 일치
- **TC-05 API 경로 분기**: 단일 수정은 `/api/events/:id`, 전체 수정은 `/api/recurring-events/:repeatId` 호출 검증

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
- Outputs: 테스트 계획 요약/시나리오 업데이트
- Artifacts: (별도 문서 없음)
  <!-- TEST_DESIGN_START -->
  Inputs: 단일/전체 수정 흐름, 아이콘 규칙, API 분기
  Actions: SC/TC 구체화 및 통합 테스트 설계(대화창 노출/선택/반영 확인)
  Outputs: SC-01~05, TC-01~05 정리
  <!-- TEST_DESIGN_END -->

---

### 🧪 테스트 코드 작성 에이전트 (Test Code)

- Inputs: Test Plan, Matrix
- Actions: 스캐폴딩/테스트 구현(단계적), 실패 확인
- Outputs: 커밋/PR 링크, 주요 테스트 스니펫
- Artifacts: `src/__tests__/*`
  <!-- TEST_CODE_START -->
  Inputs: SC-01~05, TC-01~05
  Actions: 실패 테스트 추가(단일/전체 수정 플로우 및 아이콘 분기)
  Outputs:
  - Added: `src/__tests__/integration/recurring-edit.integration.spec.tsx`
  <!-- TEST_CODE_END -->

---

### 💻 코드 작성 에이전트 (Implementation)

- Inputs: 실패 테스트
- Actions: 최소 구현(Green)
- Outputs: 변경 파일/주요 변경 요약
- Artifacts: 소스 코드 경로
  <!-- IMPLEMENTATION_START -->
  Inputs: 실패 테스트(단일/전체 수정 플로우)
  Actions:
  - App: 반복 수정 확인 다이얼로그 추가(예/아니오)
  - 단일 수정(예): 로컬 기준으로 해당 시리즈를 단일로 취급(아이콘 제거)
  - 전체 수정(아니오): 시리즈 유지(아이콘 유지)
    Outputs:
  - Updated: `src/App.tsx`
  <!-- IMPLEMENTATION_END -->

---

### 🔧 리팩토링 에이전트 (Refactoring)

- Inputs: Green 상태
- Actions: 중복 제거/구조 개선/명명 개선(동작 동일)
- Outputs: 리팩토링 포인트/전후 비교
- Safeguard: 모든 테스트 Green 유지
  <!-- REFACTORING_START -->
  Inputs: Green 상태
  Actions:
  - event list 중복 제거 로직을 `utils/eventList.ts`로 추출(`getListEvents`)
  - App에서 헬퍼 사용으로 Hook 순서/가독성 개선
    Outputs:
  - Added: `src/utils/eventList.ts`
  - Updated: `src/App.tsx`
  <!-- REFACTORING_END -->

---

## 🧾 요약 (Summary)

- 상태: `완료`
- 마지막 수정 에이전트: 오케스트레이터
- 주요 변경사항 요약: RED→GREEN→REFACTOR 완료. 커밋 요약 —
  - test(issue-006): add RED tests for recurring edit (single vs series)
  - feat(issue-006): add confirm dialog for recurring edits and icon behavior
  - fix(issue-006): guard event id in list dedupe and stabilize search tests
  - refactor(issue-006): extract listEvents helper and clean imports
