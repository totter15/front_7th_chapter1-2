# 🧭 Issue: 기능 요청서 — 반복 유형 선택 (Recurrence Type Selection)

## 🎯 목적 (Goal)

사용자가 일정 생성/수정 시 반복 유형(매일/매주/매월/매년)을 선택하여 반복 일정을 만들 수 있게 한다.

---

## 📋 요구사항 (Requirements)

- 일정 생성 또는 수정 시 반복 유형을 선택할 수 있어야 한다.
- 제공되는 반복 유형: 매일, 매주, 매월, 매년.
- 매월: 31일에 생성된 일정이 반복되는 경우, 매월의 31일에만 생성한다(말일 보정 금지: 30/29/28일에 대체 생성하지 않음).
- 매년: 윤년의 2월 29일에 생성된 일정은 매년 2월 29일에만 생성한다(비윤년에는 생성하지 않음).
- 반복 일정은 다른 일정과의 겹침을 고려하지 않고 생성한다(겹침 허용, 별도 충돌 검증 없음).

---

## 🧩 맥락 & 범위 (Context & Scope)

- Impacted Areas: Types | Hooks | Utils | Tests | UI
- Out of Scope: 겹침 방지/충돌 해결 로직, 예외일/스킵 규칙, 개별 인스턴스 편집/삭제 전파, 외부 API 연동, 타임존 세부 정책

---

## 🧪 테스트 계획 요약 (Test Plan Summary)

### 테스트 시나리오 개요 (Scenario Overview)

- SC-01: 일정 생성 폼에서 반복 유형 옵션(UI) 노출 확인
- SC-02: 매일 반복 생성 — 기준 시작일 이후 매일 동일 시간 생성 확인
- SC-03: 매주 반복 생성 — 기준 시작일의 요일 고정 생성 확인
- SC-04: 매월 반복 생성 — 기준 시작일이 31일인 경우, 31일에만 생성(대체 금지)
- SC-05: 매년 반복 생성 — 기준일이 2/29인 경우 윤년에만 생성(평년 미생성)
- SC-06: 반복일정은 겹침 허용 — 기존 이벤트와 겹쳐도 생성됨 확인

### 테스트 케이스 상세 (Test Case Detail)

- **TC-01 반복유형 UI 노출 확인**

  - 목적: 일정 생성 폼 렌더링 시 반복 옵션 노출 검증
  - 전제조건: 화면 진입 완료
  - 입력/행동: 일정 생성 폼 렌더링
  - 기대결과: “매일/매주/매월/매년” 옵션이 표시됨
  - 고려사항: getByRole, getByLabelText 사용

- **TC-02 매일 반복 생성 규칙**

  - 입력: 시작일 2025-01-10 09:00, 반복: 매일, 횟수 3
  - 기대: 2025-01-10/11/12 09:00에 생성

- **TC-03 매주 반복 생성 규칙(요일 고정)**

  - 입력: 시작일 2025-01-10(Fri) 09:00, 반복: 매주, 횟수 3
  - 기대: 매주 금요일 09:00에 생성 (예: 01-10, 01-17, 01-24)

- **TC-04 매월 31일 대체 금지**

  - 입력: 시작일 2025-01-31 09:00, 반복: 매월, 범위 3개월
  - 기대: 2025-01-31, 2025-03-31만 생성(2월/4월의 31일 없음 → 미생성)

- **TC-05 매년 2/29 윤년만 생성**

  - 입력: 시작일 2024-02-29 09:00, 반복: 매년, 범위 2024~2028
  - 기대: 2024-02-29, 2028-02-29만 생성(2025/2026/2027 미생성)

- **TC-06 겹침 허용 동작**
  - 전제: 동일 시간대에 다른 단일 일정 존재
  - 입력: 시작일 2025-01-10 09:00, 반복: 매주
  - 기대: 겹치더라도 반복 일정 생성(충돌 검증/차단 없음)

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
  Inputs: 요구사항(반복 유형/경계 규칙), 기존 테스트 패턴
  Actions: UI 노출, 주기별 규칙, 경계(31일/2월29일), 겹침 허용 시나리오 정의
  Outputs: SC-01~06, TC-01~06 추가 및 구체화
  <!-- TEST_DESIGN_END -->

---

### 🧪 테스트 코드 작성 에이전트 (Test Code)

- Inputs: Test Plan, Matrix
- Actions: 스캐폴딩/테스트 구현(단계적), 실패 확인
- Outputs: 커밋/PR 링크, 주요 테스트 스니펫
- Artifacts: `src/__tests__/*`
  <!-- TEST_CODE_START -->
  Inputs: 테스트 시나리오 SC-01~06, TC-01~06
  Actions: 실패 테스트 추가 (UI 통합, 유틸 경계 규칙)
  Outputs:
  - Added: `src/__tests__/integration/recurrence-type-ui.integration.spec.tsx`
  - Added: `src/__tests__/integration/recurrence-generation.integration.spec.tsx`
  <!-- TEST_CODE_END -->

---

### 💻 코드 작성 에이전트 (Implementation)

- Inputs: 실패 테스트
- Actions: 최소 구현(Green)
- Outputs: 변경 파일/주요 변경 요약
- Artifacts: 소스 코드 경로
  <!-- IMPLEMENTATION_START -->
  Inputs: 실패 테스트(UI 반복 필드 노출, 반복 생성 규칙)
  Actions:
  - App: 반복 UI 활성화 및 상태 연결(setRepeatType/Interval/EndDate)
  - Utils: `eventUtils.ts`에 반복 확장 로직 추가(일/주/월/년, 31일/2월29일 규칙)
    Outputs:
  - Updated: `src/App.tsx`
  - Updated: `src/utils/eventUtils.ts`
  <!-- IMPLEMENTATION_END -->

---

### 🔧 리팩토링 에이전트 (Refactoring)

- Inputs: Green 상태
- Actions: 중복 제거/구조 개선/명명 개선(동작 동일)
- Outputs: 리팩토링 포인트/전후 비교
- Safeguard: 모든 테스트 Green 유지
  <!-- REFACTORING_START -->
  Inputs: Green 상태(모든 관련 테스트 통과)
  Actions:
  - Utils: 반복 로직 헬퍼를 `src/utils/recurrence.ts`로 분리
  - eventUtils: 윈도우 기반 확장 로직을 헬퍼로 위임, 불필요 경고 제거
    Outputs:
  - Added: `src/utils/recurrence.ts`
  - Updated: `src/utils/eventUtils.ts`
  <!-- REFACTORING_END -->

---

## 🧾 요약 (Summary)

- 상태: `완료`
- 마지막 수정 에이전트: 오케스트레이터
- 주요 변경사항 요약: 테스트(RED) → 구현(GREEN) → 리팩토링 완료. 커밋 요약 —
  - test(issue-004): add RED integration tests for recurrence UI and rules
  - feat(issue-004): enable recurrence UI and expand recurring events
  - test(issue-004): stabilize MUI recurrence tests (UI + generation)
  - refactor(issue-004): extract recurrence helpers and delegate expansion
