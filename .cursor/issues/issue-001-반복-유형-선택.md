# 🧭 Issue: 반복 유형 선택

## 🎯 목적 (Goal)

일정 생성/수정 시 사용자가 반복 유형(매일/매주/매월/매년)을 선택해 반복 일정을 손쉽게 관리할 수 있게 한다.

---

## 📋 요구사항 (Requirements)

- 일정 생성 또는 수정 시 반복 유형을 선택할 수 있다.
- 반복 유형은 다음 중 하나를 지원한다: 매일, 매주, 매월, 매년.
- 기준일이 31일인 상태에서 '매월'을 선택한 경우, 매월 31일에만 생성된다. 30일/28일/29일에는 생성되지 않는다.
- 기준일이 2월 29일(윤년)인 상태에서 '매년'을 선택한 경우, 윤년의 2월 29일에만 생성된다. 다른 해의 2월 28일/3월 1일에는 대체 생성하지 않는다.
- 반복 일정은 일정 겹침(Overlap) 검사를 수행하지 않는다.

---

## 🧩 맥락 & 범위 (Context & Scope)

- Impacted Areas: Types | Hooks | Utils | Tests | UI
- Out of Scope:
  - 반복 종료 기준(종료일/횟수) 설정 UI/로직
  - 개별 인스턴스 예외 처리(특정 달만 스킵/수정) 및 시리즈 편집 범위(이 인스턴스만/이후 모두)
  - 반복 일정의 겹침 방지/자동 조정 로직

---

## 🧪 테스트 계획 요약 (Test Plan Summary)

- Coverage Target: 반복 규칙(월 31일/윤년 2/29) 및 Hook 상태 전이 100%
- Mocks/Fixtures: Time(vi.useFakeTimers + vi.setSystemTime) | Network(MSW, 필요 시) | Storage(in-memory) | 샘플 기준일(2024-01-31, 2024-02-29 등)

### 테스트 시나리오 개요 (Scenario Overview)

| 시나리오 ID | 시나리오명             | 주요 검증 포인트            |
| ----------- | ---------------------- | --------------------------- |
| SC-01       | 반복 유형 선택 UI 노출 | 셀렉트 박스, 옵션 노출 여부 |
| SC-02       | 매일 반복 생성         | 하루 단위 반복 생성 확인    |
| SC-03       | 매월 31일 생성         | 31일 있는 달만 생성됨       |
| SC-04       | 윤년 2월 29일 생성     | 윤년 판단 및 생성 검증      |
| SC-05       | 반복 종료 조건         | 지정 횟수 이후 생성 중단    |

### 테스트 케이스 상세 (Test Case Detail)

| TC ID | 목적                    | 전제조건           | 입력/행동           | 기대결과                            | 고려사항                       |
| ----- | ----------------------- | ------------------ | ------------------- | ----------------------------------- | ------------------------------ |
| TC-01 | 반복유형 UI 노출 확인   | 화면 진입 완료     | 일정 생성 폼 렌더링 | “매일/매주/매월/매년” 옵션이 표시됨 | getByRole, getByLabelText 사용 |
| TC-02 | 매일 반복 일정 생성     | 시작일: 2025-10-29 | “매일” 선택 후 저장 | 다음날부터 일정 생성                | 날짜 증가 로직 검증            |
| TC-03 | 매월 31일 생성 확인     | 시작일: 2025-01-31 | 반복일: 31 입력     | 31일 있는 달만 생성됨               | 2, 4, 6, 9, 11월 제외          |
| TC-04 | 윤년 2월 29일 생성 확인 | 시작일: 2024-02-29 | 반복유형: 매년 선택 | 윤년에만 생성됨 (2028, 2032 등)     | 윤년 판정 로직                 |
| TC-05 | 반복 종료 조건 확인     | 회수: 10회 설정    | 저장                | 10회 이후 일정 생성 안 됨           | 종료 조건 처리 로직            |

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
  Inputs: Issue 요구사항/범위/AC(초안)
  Actions: Test Plan 생성(`.cursor/specs/test-plan-반복-유형-선택.md`), Test Matrix/케이스 초안 작성, 모킹 전략 정의
  Outputs: 요약/매트릭스/케이스 업데이트, 파일 경로 제안
  Artifacts: Test Plan 문서 1건
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

- 상태: `기획`
- 마지막 수정 에이전트: PM(John)
- 주요 변경사항 요약: 반복 유형 선택(매일/매주/매월/매년) 기능의 목적·요구사항·범위 정의 완료. 31일/윤년 2월 29일 예외 규칙 명시, 반복 일정은 겹침 검사 제외로 확정.
