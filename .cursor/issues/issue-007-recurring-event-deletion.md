# 🧭 Issue: 기능 요청서 — 반복 일정 삭제 (단일 vs 전체)

## 🎯 목적 (Goal)

사용자가 반복 일정 삭제 시 단일 인스턴스만 삭제할지, 전체 시리즈를 삭제할지 선택할 수 있게 한다.

---

## 📋 요구사항 (Requirements)

- 삭제 트리거 시 확인 텍스트 "해당 일정만 삭제하시겠어요?"를 표시하고, 사용자의 선택에 따라 다음 동작을 수행한다.
  1. 예(단일 삭제): 해당 인스턴스만 삭제한다.
  2. 아니오(전체 삭제): 해당 시리즈 전체를 삭제한다.
- 단일 삭제 후에는 동일 시리즈의 다른 인스턴스는 유지되어야 한다.
- 전체 삭제 후에는 동일 시리즈의 모든 인스턴스가 삭제되어야 한다.
- 접근성: 버튼 라벨은 '예', '아니오' 사용.

---

## 🧩 맥락 & 범위 (Context & Scope)

- Impacted Areas: Hooks | Utils | Tests | UI | API(Mock)
- UI: 삭제 액션 시 확인 다이얼로그/옵션 제공
- API: 단일 삭제(기존 `/api/events/:id`) 및 시리즈 삭제(`/api/recurring-events/:id`) 경로 분기
- Out of Scope: 부분 시리즈 삭제(범위 지정), 복잡한 예외일 머지

---

## 🧪 테스트 계획 요약 (Test Plan Summary)

### 테스트 시나리오 개요 (Scenario Overview)

- SC-01: 삭제 트리거 시 확인 텍스트와 옵션(예/아니오) 노출
- SC-02: 예(단일 삭제) 선택 시 해당 날짜 인스턴스만 캘린더에서 사라짐, 리스트는 유지
- SC-03: 아니오(전체 삭제) 선택 시 캘린더/리스트 모두에서 시리즈 제거

### 테스트 케이스 상세 (Test Case Detail)

- **TC-01 UI 확인 다이얼로그 노출**: 삭제 버튼 클릭 시 텍스트/선택지 확인
- **TC-02 단일 삭제 흐름**: 예 선택 후 기준 날짜 인스턴스만 미표시 확인(다른 주기 인스턴스는 존재)
- **TC-03 전체 삭제 흐름**: 아니오 선택 후 동일 시리즈의 모든 인스턴스 미표시 및 리스트 제거 확인

---

## 🔁 TDD 사이클 (Red → Green → Refactor)

- [x] Red: 실패하는 테스트 추가 (Test Code Agent)
- [x] Green: 최소 구현으로 통과 (Implementation Agent)
- [x] Refactor: 동작 동일, 구조/가독성 개선 (Refactoring Agent)

---

## 🧠 에이전트 작업 로그 (Agent Work Log)

### 🧩 테스트 설계 에이전트 (Test Design)

- Inputs: Story/AC, Context
- Actions: 테스트 유형/파일 배치 설계, 모킹 전략 수립
- Outputs: 테스트 계획 요약/시나리오 업데이트
- Artifacts: (별도 문서 없음)
  <!-- TEST_DESIGN_START -->
  Inputs: 단일/전체 삭제 흐름, 아이콘/캘린더 반영
  Actions: SC/TC 구체화 및 통합 테스트 설계(대화창 노출/선택/반영 확인)
  Outputs: SC-01~03, TC-01~03 정리
  <!-- TEST_DESIGN_END -->

---

### 🧪 테스트 코드 작성 에이전트 (Test Code)

- Inputs: Test Plan, Matrix
- Actions: 스캐폴딩/테스트 구현(단계적), 실패 확인
- Outputs: 커밋/PR 링크, 주요 테스트 스니펫
- Artifacts: `src/__tests__/*`
  <!-- TEST_CODE_START -->
  Inputs: SC-01~03, TC-01~03
  Actions: 실패 테스트 추가(단일/전체 삭제 플로우)
  Outputs:
  - Added: `src/__tests__/integration/recurring-delete.integration.spec.tsx`
  <!-- TEST_CODE_END -->

---

### 💻 코드 작성 에이전트 (Implementation)

- Inputs: 실패 테스트
- Actions: 최소 구현(Green)
- Outputs: 변경 파일/주요 변경 요약
- Artifacts: 소스 코드 경로
  <!-- IMPLEMENTATION_START -->
  (자동 기록)
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
  - baseId/occurrenceKey 유틸(`utils/eventId.ts`)로 분리
  - App의 split('-')[0] 사용부를 헬퍼로 치환
    Outputs:
  - Added: `src/utils/eventId.ts`
  - Updated: `src/App.tsx`
  <!-- REFACTORING_END -->

---

## 🧾 요약 (Summary)

- 상태: `완료`
- 마지막 수정 에이전트: 오케스트레이터
- 주요 변경사항 요약: RED→GREEN→REFACTOR 완료. 커밋 요약 —
  - test(issue-007): RED→GREEN for recurring delete with dialog and series API
  - refactor(issue-007): extract baseId/occurrence key helpers and apply in App
  - style(app): inline RepeatA11yIcon conditional rendering in calendar cells
  - chore(tests,utils): commit missing files (eventId, eventList, recurring-delete tests)
