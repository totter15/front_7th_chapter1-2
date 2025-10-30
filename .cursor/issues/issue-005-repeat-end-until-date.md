# 🧭 Issue: 기능 요청서 — 반복 종료(특정 날짜까지)

## 🎯 목적 (Goal)

사용자가 반복 일정의 종료 조건을 "특정 날짜까지"로 지정할 수 있게 한다.

---

## 📋 요구사항 (Requirements)

- 반복 일정 생성/수정 시 종료 조건으로 "특정 날짜까지"를 설정할 수 있어야 한다.
- 종료일은 포함(inclusive)으로 간주하여 종료일 당일 발생분까지 생성한다.
- 예제 범위 제약: 종료일의 최댓값은 2025-12-31로 제한한다(이 날짜를 초과한 값은 2025-12-31로 보정).
- 기타 동작은 기존 반복 규칙을 따른다(매일/매주/매월/매년, 31일/2월29일 규칙 유지).

---

## 🧩 맥락 & 범위 (Context & Scope)

- Impacted Areas: Types | Hooks | Utils | Tests | UI
- Out of Scope: RRULE 확장, 예외일 관리, 개별 인스턴스 편집/스킵, 타임존 상세 정책

---

## 🧪 테스트 계획 요약 (Test Plan Summary)

### 테스트 시나리오 개요 (Scenario Overview)

- SC-01: 반복 종료 옵션(UI) 노출 및 종료일 입력 가능 확인
- SC-02: 종료일 포함 생성 — 종료일 당일 발생까지 생성되는지 확인
- SC-03: 종료일 상한 — 2025-12-31 초과 입력 시 2025-12-31로 제한 확인
- SC-04: 기존 규칙과의 결합 — "매월 31일"/"매년 2/29" 조건에서 종료일까지 생성 확인
- SC-05: 상한과 윤년 결합 — 2026년 입력 시 상한 적용되어 2025년까지만 생성

### 테스트 케이스 상세 (Test Case Detail)

- **TC-01 종료 옵션 UI 노출**: 반복 체크 시 종료일 입력 필드 표시
- **TC-02 종료일 포함**: 종료일=2025-01-12, 매일 반복 시작=2025-01-10 → 10/11/12 생성
- **TC-03 상한 보정**: 종료일=2026-01-10 입력 → 내부적으로 2025-12-31로 생성 제한
- **TC-04 규칙 결합**: 시작=2024-02-29, 매년, 종료=2028-12-31 → 2024-02-29, 2028-02-29만 생성
- **TC-05 월 31일 + 상한**: 시작=2025-01-31, 매월, 종료=2025-12-31 → 01/31, 03/31, 05/31, 07/31, 08/31, 10/31, 12/31 생성

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
  Inputs: 요구사항(종료일 포함/상한 2025-12-31), 기존 반복 규칙
  Actions: UI 노출, 포함 규칙, 상한 보정, 규칙 결합(31일/2월29일) 시나리오 정의
  Outputs: SC-01~05, TC-01~05 구체화
  <!-- TEST_DESIGN_END -->

---

### 🧪 테스트 코드 작성 에이전트 (Test Code)

- Inputs: Test Plan, Matrix
- Actions: 스캐폴딩/테스트 구현(단계적), 실패 확인
- Outputs: 커밋/PR 링크, 주요 테스트 스니펫
- Artifacts: `src/__tests__/*`
  <!-- TEST_CODE_START -->
  Inputs: SC-01~05, TC-01~05
  Actions: 실패 테스트 추가(상한 캡 2025-12-31, UI 종료일 노출)
  Outputs:
  - Added: `src/__tests__/integration/recurrence-end-until.integration.spec.tsx`
  <!-- TEST_CODE_END -->

---

### 💻 코드 작성 에이전트 (Implementation)

- Inputs: 실패 테스트
- Actions: 최소 구현(Green)
- Outputs: 변경 파일/주요 변경 요약
- Artifacts: 소스 코드 경로
  <!-- IMPLEMENTATION_START -->
  Inputs: 실패 테스트(상한 캡 미적용 확인)
  Actions: `recurrence.ts`에서 반복 종료일을 2025-12-31로 상한 보정(포함 규칙 유지)
  Outputs:
  - Updated: `src/utils/recurrence.ts` (cap 적용)
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
  - recurrence: 종료일 상한 보정 로직 함수화(`getCappedEndDate`) 및 상수(`CAP_END_DATE`) 도입
  - 목적: 중복 제거/의도 명확화
    Outputs:
  - Updated: `src/utils/recurrence.ts`
  <!-- REFACTORING_END -->

---

## 🧾 요약 (Summary)

- 상태: `완료`
- 마지막 수정 에이전트: 오케스트레이터
- 주요 변경사항 요약: RED→GREEN→REFACTOR 완료. 커밋 요약 —
  - test(issue-005): add RED tests for repeat end until date (cap 2025-12-31)
  - feat(issue-005): enforce repeat end-date cap at 2025-12-31 (inclusive)
  - refactor(issue-005): extract end-date cap logic and constant
