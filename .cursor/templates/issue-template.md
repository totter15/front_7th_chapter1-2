# 🧭 Issue: 기능 요청서

## 🎯 목적 (Goal)

한 문장으로 사용자/비즈니스 가치를 설명합니다.

---

## 📋 요구사항 (Requirements)

- 검증 가능한 문장으로만 작성합니다.
- 모호어(적절히/가능하면/필요시) 금지.

---

## 🧩 맥락 & 범위 (Context & Scope)

- Impacted Areas: Types | Hooks | Utils | Tests | UI | API
- Out of Scope: (명시적으로 제외할 범위)

---

## ✅ 수용 기준 (Acceptance Criteria — GWT with IDs)

- [ ] AC-1: Given …, When …, Then …
- [ ] AC-2: Given …, When …, Then …
- [ ] AC-3: …

---

## 🧪 테스트 계획 요약 (Test Plan Summary)

- Plan Doc: `.cursor/specs/test-plan-[slug].md`
- Coverage Target: 핵심 로직 100% 또는 근거 제시
- Mocks/Fixtures: Time(Date mocks) | Network(MSW) | Storage | Sample Data 출처

### Test Matrix (AC ↔ Test)

| AC   | Type (Unit/Hook/Integration) | File Path (예정)              | Notes |
| ---- | ---------------------------- | ----------------------------- | ----- |
| AC-1 | Hook                         | src/**tests**/hooks/...       |       |
| AC-2 | Unit                         | src/**tests**/unit/...        |       |
| AC-3 | Integration                  | src/**tests**/integration/... |       |

### Test Cases (절차 기반 테이블)

| ID    | 목적 | 전제 조건 | 수행 절차 | 기대 결과 | 고려 사항 |
| ----- | ---- | --------- | --------- | --------- | --------- |
| TC-01 | ...  | ...       | ...       | ...       | ...       |

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
- Outputs: Test Plan 링크/요약, Matrix 업데이트
- Artifacts: `.cursor/specs/test-plan-[slug].md`
  <!-- TEST_DESIGN_START -->
  (자동 기록)
  <!-- TEST_DESIGN_END -->

---

### 🧪 테스트 코드 작성 에이전트 (Test Code)

- Inputs: Test Plan, Matrix
- Actions: 스캐폴딩/테스트 구현(단계적), 실패 확인
- Outputs: 커밋/PR 링크, 주요 테스트 스니펫
- Artifacts: `src/__tests__/*`
  <!-- TEST_CODE_START -->
  (자동 기록)
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
  (자동 기록)
  <!-- REFACTORING_END -->

---

## 🧾 요약 (Summary)

- 상태: `기획 | 테스트 설계 | 테스트 코드 작성 | 코드 작성 | 리팩토링 | 완료`
- 마지막 수정 에이전트: (자동 기록)
- 주요 변경사항 요약: (자동 기록)
