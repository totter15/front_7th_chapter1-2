# 🧭 Issue: 기능 요청서

## 🎯 목적 (Goal)

사용자가 반복 일정의 종료 조건을 특정 날짜까지로 지정하여 반복 일정이 해당 날짜까지만 생성되도록 제한할 수 있도록 한다.

---

## 📋 요구사항 (Requirements)

- 사용자가 반복 일정을 생성할 때 반복 종료일을 지정할 수 있다.
- 반복 종료일은 반복 유형이 선택된 경우에만 입력 가능하다.
- 반복 종료일 입력 필드에는 날짜 제한이 없으며 사용자가 자유롭게 날짜를 지정할 수 있다.
- 반복 종료일이 지정된 반복 일정은 해당 날짜까지만 생성된다.

---

## 🧩 맥락 & 범위 (Context & Scope)

- Impacted Areas: UI (App.tsx의 반복 종료일 입력 필드) | Tests
- Out of Scope: 반복 일정의 실제 생성 로직 구현, 종료 횟수 기반 종료 조건, 종료일 이후 일정 표시 처리, 날짜 제한 검증

---

## 🧪 테스트 계획 요약 (Test Plan Summary)

### 테스트 시나리오 개요 (Scenario Overview)

- SC-01: 반복 유형이 선택된 경우 반복 종료일 입력 필드가 표시된다.
- SC-02: 사용자가 반복 종료일을 입력할 수 있고 입력된 값이 폼 상태에 저장된다.
- SC-03: 반복 종료일이 지정된 반복 일정을 생성하면 종료일이 저장된다.
- SC-04: 반복 종료일 입력 필드는 반복 유형이 선택되지 않은 경우 표시되지 않는다.

### 테스트 케이스 상세 (Test Case Detail)

- **TC-01 반복 종료일 입력 필드 노출 확인 (Integration)**

  - 목적: 반복 유형이 선택된 경우 반복 종료일 입력 필드가 표시되는지 검증
  - 전제조건: 일정 생성 폼이 렌더링됨
  - 입력/행동:
    1. "반복 일정" 체크박스를 클릭
    2. 반복 유형을 선택 (예: 매일, 매주 중 하나)
  - 기대결과:
    - "반복 종료일" 라벨이 있는 입력 필드가 표시됨
    - 입력 필드는 date 타입의 TextField로 표시됨
  - 테스트 파일: `src/__tests__/medium.integration.spec.tsx`
  - 고려사항: getByLabelText로 "반복 종료일" 필드 검증

- **TC-02 반복 종료일 입력 및 상태 저장 확인 (Integration)**

  - 목적: 사용자가 반복 종료일을 입력할 수 있고 입력된 값이 폼 상태에 저장되는지 검증
  - 전제조건: 반복 일정 체크박스가 선택되고 반복 유형이 선택됨
  - 입력/행동:
    1. 반복 종료일 입력 필드에 날짜 입력 (예: "2025-12-31")
    2. 입력 필드 값 확인
  - 기대결과:
    - 입력된 날짜가 입력 필드에 표시됨
    - 폼 상태에 입력한 날짜가 저장됨
  - 테스트 파일: `src/__tests__/medium.integration.spec.tsx`
  - 고려사항: userEvent.type으로 날짜 입력, 입력 필드의 value 속성 검증

- **TC-03 반복 종료일이 저장되는지 확인 (Integration)**

  - 목적: 반복 종료일이 지정된 반복 일정을 생성하면 종료일이 이벤트 데이터에 포함되어 저장되는지 검증
  - 전제조건: 반복 일정 생성 폼이 표시됨
  - 입력/행동:
    1. 반복 일정 체크박스 선택
    2. 반복 유형 선택 (예: 매일)
    3. 반복 종료일 입력 (예: "2025-12-31")
    4. 일정 저장
  - 기대결과:
    - 저장된 이벤트의 `repeat.endDate` 필드에 입력한 날짜가 포함됨
  - 테스트 파일: `src/__tests__/medium.integration.spec.tsx`
  - 고려사항: MSW 핸들러에서 저장된 데이터 검증 또는 이벤트 리스트에서 검증

- **TC-04 반복 유형 미선택 시 종료일 필드 미표시 확인 (Integration)**
  - 목적: 반복 유형이 선택되지 않은 경우 반복 종료일 입력 필드가 표시되지 않는지 검증
  - 전제조건: 일정 생성 폼이 렌더링됨
  - 입력/행동: 일정 생성 폼 렌더링 상태 확인
  - 기대결과:
    - "반복 종료일" 입력 필드가 표시되지 않음
  - 테스트 파일: `src/__tests__/medium.integration.spec.tsx`
  - 고려사항: queryByLabelText로 필드 부재 확인

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
  - Inputs:
    - Issue 목적: 반복 일정의 종료 조건을 특정 날짜까지로 지정
    - 요구사항: 반복 종료일 지정 가능, 반복 유형 선택 시에만 입력 가능, 날짜 제한 없음, 종료일 지정 시 해당 날짜까지만 생성
    - 컨텍스트: App.tsx의 반복 종료일 입력 필드, Integration 테스트로 검증
  - Actions:
    - 요구사항 분석: 4가지 시나리오 도출 (종료일 필드 노출, 입력 및 상태 저장, 데이터 저장 확인, 반복 미선택 시 미표시)
    - 테스트 유형 결정: Integration 테스트 (UI 렌더링 및 사용자 상호작용 검증)
    - 테스트 케이스 설계: 4개 테스트 케이스 작성 (TC-01 ~ TC-04)
    - 테스트 파일 배치: `src/__tests__/medium.integration.spec.tsx`에 추가
    - 모킹 전략: 기존 MSW 핸들러 활용, 반복 종료일이 포함된 반복 일정 데이터 준비
  - Outputs:
    - 테스트 시나리오 4개 (SC-01 ~ SC-04)
    - 테스트 케이스 4개 (TC-01 ~ TC-04) 상세 명세
    - 테스트 파일: `src/__tests__/medium.integration.spec.tsx`
  - Artifacts: (별도 문서 없음)
  <!-- TEST_DESIGN_END -->

---

### 🧪 테스트 코드 작성 에이전트 (Test Code)

- Inputs: Test Plan, Matrix
- Actions: 스캐폴딩/테스트 구현(단계적), 실패 확인
- Outputs: 커밋/PR 링크, 주요 테스트 스니펫
- Artifacts: `src/__tests__/*`
  <!-- TEST_CODE_START -->
  - Inputs:
    - 테스트 계획: 4개 테스트 케이스 (TC-01 ~ TC-04)
    - 테스트 파일: `src/__tests__/medium.integration.spec.tsx`
    - 기존 테스트 구조 참고: 반복 일정 관련 테스트 패턴
  - Actions:
    - 테스트 describe 블록 생성: "반복 종료일 지정 (SC-01 ~ SC-04)"
    - TC-01 구현: 반복 종료일 입력 필드 노출 확인 (반복 유형 선택 시)
    - TC-02 구현: 반복 종료일 입력 및 상태 저장 확인
    - TC-03 구현: 반복 종료일이 저장되는지 확인 (전체 플로우)
    - TC-04 구현: 반복 유형 미선택 시 종료일 필드 미표시 확인
    - 테스트 실행 및 실패 확인 (RED 상태)
  - Outputs:
    - 테스트 파일: `src/__tests__/medium.integration.spec.tsx` (627-723줄)
    - 테스트 실행 결과: 3개 실패, 1개 통과 (TC-04)
    - 주요 실패 원인: 반복 종료일 필드가 반복 유형 선택 시에만 표시되어야 하는데 현재는 isRepeating만 체크함
  - Artifacts: `src/__tests__/medium.integration.spec.tsx`
  <!-- TEST_CODE_END -->

---

### 💻 코드 작성 에이전트 (Implementation)

- Inputs: 실패 테스트
- Actions: 최소 구현(Green)
- Outputs: 변경 파일/주요 변경 요약
- Artifacts: 소스 코드 경로
  <!-- IMPLEMENTATION_START -->
  - Inputs:
    - 실패 테스트: TC-01, TC-02, TC-03 실패 (반복 종료일 필드가 반복 유형 선택 시에만 표시되어야 함)
    - 기존 코드: App.tsx의 반복 종료일 필드가 isRepeating만 체크하고 있음
  - Actions:
    - 반복 종료일 필드 조건 수정: `repeatType !== 'none'` 조건 추가
    - FormLabel과 TextField 연결: htmlFor와 id 속성 추가
    - aria-label 제거: 중복 라벨 문제 해결
    - 테스트 실행 및 검증: 모든 테스트 통과 확인
  - Outputs:
    - 변경 파일: `src/App.tsx` (470-481줄)
    - 주요 변경사항:
      - 반복 종료일 필드를 `repeatType !== 'none'` 조건으로 감싸서 반복 유형 선택 시에만 표시
      - FormLabel과 TextField 연결을 위한 htmlFor/id 속성 추가
      - aria-label 제거하여 중복 라벨 문제 해결
    - 테스트 실행 결과: 4개 테스트 모두 통과 (TC-01 ~ TC-04)
  - Artifacts: `src/App.tsx`
  <!-- IMPLEMENTATION_END -->

---

### 🔧 리팩토링 에이전트 (Refactoring)

- Inputs: Green 상태
- Actions: 중복 제거/구조 개선/명명 개선(동작 동일)
- Outputs: 리팩토링 포인트/전후 비교
- Safeguard: 모든 테스트 Green 유지
  <!-- REFACTORING_START -->
  - Inputs:
    - Green 상태 코드 검토
    - 현재 구현 코드 분석
  - Actions:
    - 코드 구조 검토: 조건부 렌더링, FormLabel/TextField 연결 상태 확인
    - 리팩토링 포인트 검토: 일관성, 가독성, 구조 개선 여지 확인
    - 테스트 실행 및 검증: 모든 테스트 통과 확인
  - Outputs:
    - 리팩토링 결정: 현재 코드가 이미 깔끔하고 명확하게 구현되어 있어 추가 리팩토링 불필요
    - 리팩토링 포인트:
      - 조건부 렌더링이 명확함 (`repeatType !== 'none'`)
      - FormLabel과 TextField 연결이 적절함 (`htmlFor`/`id`)
      - 구조가 일관적이고 가독성이 좋음
    - 테스트 실행 결과: 4개 테스트 모두 통과 확인
  - Safeguard: 모든 테스트 Green 유지 확인
  <!-- REFACTORING_END -->

---

## 🧾 요약 (Summary)

- 상태: `완료`
- 마지막 수정 에이전트: `오케스트레이터`
- 주요 변경사항 요약: 반복 종료일 지정 기능 완료. 사용자가 반복 일정 생성 시 종료일을 지정할 수 있도록 구현 완료. 반복 종료일 필드는 반복 유형이 선택된 경우에만 표시되며, 사용자가 자유롭게 날짜를 입력할 수 있음. TDD 사이클 완료 (RED → GREEN → Refactor), 모든 테스트 통과 (전체 131개, 반복 종료일 관련 4개)
