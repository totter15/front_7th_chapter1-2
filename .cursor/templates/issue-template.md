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

## 🧪 테스트 계획 요약 (Test Plan Summary)

### 테스트 시나리오 개요 (Scenario Overview)

- SC-01: 시나리오 한 줄 요약 문장 (예: UI 노출 및 옵션 표시 확인).
- SC-02: 시나리오 한 줄 요약 문장 (예: 기본 반복 생성 동작 확인).
- SC-03: 시나리오 한 줄 요약 문장 (예: 경계 날짜 규칙 검증).
- SC-04: 시나리오 한 줄 요약 문장 (예: 윤년 등 특수 규칙 검증).
- SC-05: 시나리오 한 줄 요약 문장 (예: 겹침/예외 처리 관측 또는 종료 조건 등).

### 테스트 케이스 상세 (Test Case Detail)

- **TC-01 반복유형 UI 노출 확인**
  - 목적: 일정 생성 폼 렌더링 시 반복 옵션 노출 검증
  - 전제조건: 화면 진입 완료
  - 입력/행동: 일정 생성 폼 렌더링
  - 기대결과: “매일/매주/매월/매년” 옵션이 표시됨
  - 고려사항: getByRole, getByLabelText 사용
- **TC-02 매일 반복 일정 생성**
  - 목적: 매일 반복 일정 생성 동작 확인
  - 전제조건: 시작일 2025-10-29
  - 입력/행동: “매일” 선택 후 저장
  - 기대결과: 다음날부터 일정 생성
  - 고려사항: 날짜 증가 로직 검증
- **TC-03 매월 31일 생성 확인**
  - 목적: 31일 반복 생성 시 월별 동작 확인
  - 전제조건: 시작일 2025-01-31
  - 입력/행동: 반복일 31 입력
  - 기대결과: 31일 있는 달만 생성됨
  - 고려사항: 2, 4, 6, 9, 11월 제외
- **TC-04 윤년 2월 29일 생성 확인**
  - 목적: 윤년 반복 일정 생성 규칙 검증
  - 전제조건: 시작일 2024-02-29
  - 입력/행동: 반복유형 매년 선택
  - 기대결과: 윤년에만 생성됨 (2028, 2032 등)
  - 고려사항: 윤년 판정 로직
- **TC-05 반복 종료 조건 확인**
  - 목적: 회수 제한 종료 조건 검증
  - 전제조건: 회수 10회 설정
  - 입력/행동: 저장
  - 기대결과: 10회 이후 일정 생성 안 됨
  - 고려사항: 종료 조건 처리 로직

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
