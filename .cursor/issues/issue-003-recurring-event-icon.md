# 🧭 Issue: 기능 요청서

## 🎯 목적 (Goal)

캘린더 뷰에서 반복 일정(`Event.repeat.type` ≠ `none`)을 아이콘으로 구분 표시하여 사용자가 반복 일정을 즉시 식별할 수 있게 한다.

---

## 📋 요구사항 (Requirements)

- 월/주/일 캘린더 뷰에서 `repeat.type !== 'none'` 인 이벤트에 반복 아이콘이 함께 표시된다.
- 반복이 아닌 단일 일정은 아이콘이 표시되지 않는다.
- 아이콘은 이벤트 제목 좌측에 16px 내외 크기로 표시되고 접근성 텍스트(aria-label="반복 일정")를 가진다.
- 아이콘에는 도구팁 또는 `title` 속성으로 "반복 일정" 힌트를 제공한다.
- 다중 이벤트가 겹칠 때도 각 이벤트의 반복 여부에 따라 각각 아이콘 노출 상태가 유지된다.
- 아이콘 표시 로직은 표시만 담당하며 반복 생성/전개 규칙(반복 계산 로직)은 변경하지 않는다.
- 다크/라이트 테마 모두에서 아이콘이 충분한 대비를 가진다.

---

## 🧩 맥락 & 범위 (Context & Scope)

- Impacted Areas: Types | Hooks | Utils | Tests | UI | API
  - Hooks: `src/hooks/useCalendarView.ts` 내 이벤트 렌더링 파이프라인
  - UI: 캘린더 뷰의 이벤트 아이템 컴포넌트(제목 옆 아이콘 노출)
  - Tests: 단위/통합 테스트에서 반복 이벤트의 아이콘 노출 검증 추가
- Out of Scope: 반복 규칙 계산/이벤트 전개 로직 변경, 편집/삭제 UX 개선, 백엔드 API 변경

---

## 🧪 테스트 계획 요약 (Test Plan Summary)

### 테스트 시나리오 개요 (Scenario Overview)

- SC-01: 월별 뷰에서 반복 이벤트에만 반복 아이콘이 노출된다.
- SC-02: 주별 뷰에서 반복/비반복 이벤트의 아이콘 노출 여부가 정확하다.
- SC-03: 일정 겹침 시, 각 이벤트의 반복 여부에 따라 아이콘 노출 상태가 유지된다.
- SC-04: 접근성 — 아이콘은 aria-label "반복 일정" 및 title 힌트를 제공한다.
- SC-05: 회귀 — 비반복 이벤트에는 아이콘이 노출되지 않는다.

### 테스트 케이스 상세 (Test Case Detail)

- **TC-01 월별 뷰: 반복 이벤트 아이콘 노출**

  - 목적: 월별 뷰에서 `repeat.type !== 'none'` 이벤트에 아이콘 표시
  - 전제조건: mock에 반복 이벤트 1건, 비반복 이벤트 1건
  - 입력/행동: 앱 렌더 → 월별 뷰 고정 → 해당 날짜 셀 조회
  - 기대결과: 반복 이벤트 타이틀 좌측에 아이콘(aria-label="반복 일정", title="반복 일정") 노출, 비반복은 없음
  - 고려사항: `setupMockHandlerCreation(initEvents)`로 반복 이벤트 주입

- **TC-02 주별 뷰: 반복/비반복 아이콘 분기**

  - 목적: 주별 뷰에서도 동일 분기 동작 확인
  - 전제조건: mock에 반복/비반복 이벤트 포함
  - 입력/행동: 뷰 타입을 Week로 전환
  - 기대결과: 반복만 아이콘 노출, 비반복은 미노출

- **TC-03 겹침: 아이콘/알림 아이콘 공존**

  - 목적: 겹친 이벤트에서 반복 아이콘과 알림(Notifications) 아이콘이 동시에 표현 가능
  - 전제조건: mock에 동일 날짜/시간대 반복 이벤트 A(알림 on), 비반복 이벤트 B(알림 off)
  - 기대결과: A에 두 아이콘 모두 가능, B에는 반복 아이콘 없음

- **TC-04 접근성 속성 검증**
  - 목적: 반복 아이콘 요소가 `aria-label`과 `title`을 제공하는지 확인
  - 기대결과: getByLabelText('반복 일정') 통과 및 title 속성 값 확인

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
  Inputs: 이슈 요구사항, 현재 캘린더는 Week/Month 뷰 제공 확인(App.tsx)
  Actions: 반복 아이콘 노출 테스트를 통합 테스트에 설계, msw 초기 이벤트 주입 전략 수립
  Outputs: SC-01~05 및 TC-01~04 정의, 접근성 기준(aria-label/title) 명시
  <!-- TEST_DESIGN_END -->

---

### 🧪 테스트 코드 작성 에이전트 (Test Code)

- Inputs: Test Plan, Matrix
- Actions: 스캐폴딩/테스트 구현(단계적), 실패 확인
- Outputs: 커밋/PR 링크, 주요 테스트 스니펫
- Artifacts: `src/__tests__/*`
  <!-- TEST_CODE_START -->
  Inputs: SC-01~05 / TC-01~04
  Actions: 통합 테스트 파일 `src/__tests__/integration/recurring-icon.integration.spec.tsx` 추가 (RED)
  Outputs: 월/주 뷰 반복 아이콘 노출, 겹침 시 동작, a11y(title/aria-label) 검증 테스트 추가
  <!-- TEST_CODE_END -->

---

### 💻 코드 작성 에이전트 (Implementation)

- Inputs: 실패 테스트
- Actions: 최소 구현(Green)
- Outputs: 변경 파일/주요 변경 요약
- Artifacts: 소스 코드 경로
  <!-- IMPLEMENTATION_START -->
  Inputs: 실패 테스트(통합)
  Actions: `App.tsx` 월/주 뷰 이벤트 아이템에 반복 아이콘(span+Repeat) 렌더링 추가, a11y 속성 반영
  Outputs: 반복 이벤트시 아이콘 표시, title/aria-label 제공. 다른 로직 영향 없음
  <!-- IMPLEMENTATION_END -->

---

### 🔧 리팩토링 에이전트 (Refactoring)

- Inputs: Green 상태
- Actions: 중복 제거/구조 개선/명명 개선(동작 동일)
- Outputs: 리팩토링 포인트/전후 비교
- Safeguard: 모든 테스트 Green 유지
  <!-- REFACTORING_START -->
  Inputs: GREEN 상태, 중복된 아이콘 렌더링 코드 두 군데(App.tsx)
  Actions: `RepeatA11yIcon` 헬퍼 컴포넌트 추출로 중복 제거, 가독성 개선
  Outputs: 동일 동작 유지, 렌더링 중복 제거, 테스트 그린 유지
  <!-- REFACTORING_END -->

---

## 🧾 요약 (Summary)

- 상태: `완료`
- 마지막 수정 에이전트: 오케스트레이터
- 주요 변경사항 요약:
  - RED: 통합 테스트 추가 — `src/__tests__/integration/recurring-icon.integration.spec.tsx`
  - GREEN: `App.tsx`에 반복 아이콘(a11y 포함) 표시 구현
  - REFACTOR: `RepeatA11yIcon` 추출로 중복 제거
  - 커밋 요약:
    - test(recurring-icon): add failing integration tests for recurring event icon and update issue logs
    - feat(recurring-icon): show repeat icon with a11y in week/month calendar views
    - refactor(recurring-icon): extract RepeatA11yIcon to remove duplication and improve readability
