# 🧭 Issue: 기능 요청서

## 🎯 목적 (Goal)

캘린더 뷰에서 반복 일정을 시각적으로 구분하여 사용자가 일정 목록에서 반복 일정을 쉽게 식별할 수 있도록 한다.

---

## 📋 요구사항 (Requirements)

- 월 뷰에서 반복 일정인 경우 일정 제목 앞에 반복 아이콘이 표시된다.
- 주 뷰에서 반복 일정인 경우 일정 제목 앞에 반복 아이콘이 표시된다.
- 반복 일정이 아닌 일정(`repeat.type === 'none'`)에는 반복 아이콘이 표시되지 않는다.
- 반복 아이콘은 기존 알림 아이콘과 함께 표시될 수 있다.

---

## 🧩 맥락 & 범위 (Context & Scope)

- Impacted Areas: UI (App.tsx의 renderMonthView, renderWeekView) | Tests
- Out of Scope: 반복 일정의 실제 생성 로직, 반복 간격/종료일 표시, 아이콘의 세부 디자인(색상, 크기 등은 Material UI 기본값 사용)

---

## 🧪 테스트 계획 요약 (Test Plan Summary)

### 테스트 시나리오 개요 (Scenario Overview)

- SC-01: 월 뷰에서 반복 일정인 경우 일정 제목 앞에 반복 아이콘이 표시된다.
- SC-02: 주 뷰에서 반복 일정인 경우 일정 제목 앞에 반복 아이콘이 표시된다.
- SC-03: 반복 일정이 아닌 일정(`repeat.type === 'none'`)에는 반복 아이콘이 표시되지 않는다.
- SC-04: 반복 아이콘은 기존 알림 아이콘과 함께 표시될 수 있다.

### 테스트 케이스 상세 (Test Case Detail)

- **TC-01 월 뷰에서 반복 일정 아이콘 표시 확인 (Integration)**

  - 목적: 월 뷰에서 반복 일정인 경우 반복 아이콘이 표시되는지 검증
  - 전제조건: 월 뷰가 표시되고 반복 일정이 존재함
  - 입력/행동:
    1. 반복 유형을 선택하여 일정 생성 (예: 매일, 매주, 매월, 매년 중 하나)
    2. 월 뷰에서 해당 일정이 표시되는 날짜 확인
  - 기대결과:
    - 반복 일정의 제목 앞에 반복 아이콘이 표시됨
    - 아이콘은 일정 제목 텍스트보다 앞에 위치함
  - 테스트 파일: `src/__tests__/medium.integration.spec.tsx`
  - 고려사항: 반복 일정 데이터 준비, getByRole 또는 aria-label을 통한 아이콘 검증

- **TC-02 주 뷰에서 반복 일정 아이콘 표시 확인 (Integration)**

  - 목적: 주 뷰에서 반복 일정인 경우 반복 아이콘이 표시되는지 검증
  - 전제조건: 주 뷰가 표시되고 반복 일정이 존재함
  - 입력/행동:
    1. 반복 유형을 선택하여 일정 생성 (예: 매일, 매주 중 하나)
    2. 주 뷰로 전환
    3. 해당 일정이 표시되는 날짜 확인
  - 기대결과:
    - 반복 일정의 제목 앞에 반복 아이콘이 표시됨
    - 아이콘은 일정 제목 텍스트보다 앞에 위치함
  - 테스트 파일: `src/__tests__/medium.integration.spec.tsx`
  - 고려사항: 주 뷰 전환, 반복 일정 데이터 준비, getByRole 또는 aria-label을 통한 아이콘 검증

- **TC-03 반복 일정이 아닌 일정에는 아이콘 미표시 확인 (Integration)**

  - 목적: 반복 일정이 아닌 일반 일정에는 반복 아이콘이 표시되지 않는지 검증
  - 전제조건: 월 뷰 또는 주 뷰가 표시되고 일반 일정이 존재함
  - 입력/행동:
    1. 반복 일정 없이 일반 일정 생성 (`repeat.type === 'none'`)
    2. 월 뷰 또는 주 뷰에서 해당 일정 확인
  - 기대결과:
    - 일정 제목만 표시되고 반복 아이콘이 표시되지 않음
  - 테스트 파일: `src/__tests__/medium.integration.spec.tsx`
  - 고려사항: 일반 일정 데이터 준비, 반복 아이콘의 부재 확인

- **TC-04 반복 아이콘과 알림 아이콘 동시 표시 확인 (Integration)**
  - 목적: 반복 일정이면서 알림 대상인 경우 두 아이콘이 함께 표시되는지 검증
  - 전제조건: 월 뷰 또는 주 뷰가 표시되고, 반복 일정이 알림 시간에 도달함
  - 입력/행동:
    1. 반복 유형을 선택하여 일정 생성
    2. 알림 시간 설정하여 알림 대상이 되도록 함
    3. 알림 시간에 도달한 상태로 뷰 확인
  - 기대결과:
    - 반복 아이콘과 알림 아이콘이 함께 표시됨
    - 두 아이콘 모두 일정 제목 앞에 위치함
  - 테스트 파일: `src/__tests__/medium.integration.spec.tsx`
  - 고려사항: 알림 시간 설정, 알림 상태 모킹, 두 아이콘 모두 표시 확인

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
    - Issue 목적: 캘린더 뷰에서 반복 일정을 시각적으로 구분
    - 요구사항: 월/주 뷰에서 반복 일정 아이콘 표시, 일반 일정에는 미표시, 알림 아이콘과 함께 표시 가능
    - 컨텍스트: App.tsx의 renderMonthView, renderWeekView 수정 필요, Integration 테스트로 검증
  - Actions:
    - 요구사항 분석: 4가지 시나리오 도출 (월 뷰 표시, 주 뷰 표시, 일반 일정 미표시, 알림 아이콘과 동시 표시)
    - 테스트 유형 결정: Integration 테스트 (UI 렌더링 및 사용자 상호작용 검증)
    - 테스트 케이스 설계: 4개 테스트 케이스 작성 (TC-01 ~ TC-04)
    - 테스트 파일 배치: `src/__tests__/medium.integration.spec.tsx`에 추가
    - 모킹 전략: 기존 MSW 핸들러 활용, 반복 일정 데이터 준비, 알림 상태 모킹
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
    - 테스트 계획: TC-01 ~ TC-04 (월/주 뷰 아이콘 표시, 일반 일정 미표시, 알림 아이콘과 동시 표시)
    - 기존 테스트 파일: `src/__tests__/medium.integration.spec.tsx`
    - 기존 헬퍼 함수: `saveSchedule` (반복 일정 미지원)
  - Actions:
    - 기존 테스트 코드 검토: 반복 일정 관련 테스트는 없음 (issue-001의 반복 유형 선택 테스트만 존재)
    - 반복 일정 생성 헬퍼 함수 작성: `saveRepeatingSchedule` 함수 추가
    - TC-01 ~ TC-04 테스트 케이스 작성:
      - TC-01: 월 뷰에서 반복 일정 아이콘 표시 확인
      - TC-02: 주 뷰에서 반복 일정 아이콘 표시 확인
      - TC-03: 반복 일정이 아닌 일정에는 아이콘 미표시 확인
      - TC-04: 반복 아이콘과 알림 아이콘 동시 표시 확인
    - 테스트 실행 및 실패 확인 (RED 상태)
  - Outputs:
    - 테스트 파일 수정: `src/__tests__/medium.integration.spec.tsx`
    - 테스트 실행 결과:
      - TC-01: 실패 ✓ (반복 아이콘이 아직 구현되지 않아 null 반환)
      - TC-02: 실패 ✓ (반복 아이콘이 아직 구현되지 않아 null 반환)
      - TC-03: 통과 ✓ (일반 일정에는 아이콘이 표시되지 않음 - 정상)
      - TC-04: 실패 ✓ (반복 아이콘이 아직 구현되지 않아 null 반환)
    - 실패 원인: 반복 아이콘 UI가 아직 구현되지 않아 `queryByLabelText('반복 일정')`이 null 반환
  - Artifacts: `src/__tests__/medium.integration.spec.tsx` (describe 블록 추가, TC-01 ~ TC-04 테스트 케이스 작성)
  <!-- TEST_CODE_END -->

---

### 💻 코드 작성 에이전트 (Implementation)

- Inputs: 실패 테스트
- Actions: 최소 구현(Green)
- Outputs: 변경 파일/주요 변경 요약
- Artifacts: 소스 코드 경로
  <!-- IMPLEMENTATION_START -->
  - Inputs:
    - 실패 테스트: TC-01, TC-02, TC-04 (반복 아이콘 미표시로 인한 실패)
    - 요구사항: 월/주 뷰에서 반복 일정 아이콘 표시, 일반 일정에는 미표시, 알림 아이콘과 함께 표시 가능
  - Actions:
    - Material UI Repeat 아이콘 import 추가
    - 월 뷰(renderMonthView)에서 반복 일정 아이콘 표시 로직 추가
      - `isRepeating = event.repeat.type !== 'none'` 체크
      - 반복 일정인 경우 `<Repeat fontSize="small" aria-label="반복 일정" />` 아이콘 추가
    - 주 뷰(renderWeekView)에서 반복 일정 아이콘 표시 로직 추가
      - 동일한 로직으로 반복 일정 아이콘 표시
    - 접근성 개선: 알림 설정 Select에 `aria-label="알림 설정"` 추가
  - Outputs:
    - 테스트 실행 및 Green 상태 확인 완료:
      - TC-01: 통과 ✓ (월 뷰에서 반복 일정 아이콘 표시)
      - TC-02: 통과 ✓ (주 뷰에서 반복 일정 아이콘 표시)
      - TC-03: 통과 ✓ (일반 일정에는 아이콘 미표시)
      - TC-04: 통과 ✓ (반복 아이콘과 알림 아이콘 동시 표시)
    - 코드 변경 사항:
      - Repeat 아이콘 import 추가
      - 월/주 뷰 이벤트 렌더링 부분에 반복 아이콘 조건부 렌더링 추가
      - 알림 설정 Select 접근성 속성 추가
    - 변경 파일: `src/App.tsx`
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
    - Green 상태 코드: 반복 아이콘 표시 기능 구현 완료
    - 중복 코드 식별: 월 뷰와 주 뷰에서 동일한 이벤트 아이템 렌더링 로직 중복
  - Actions:
    - 중복 코드 제거: 월 뷰와 주 뷰에서 사용하는 이벤트 아이템 렌더링 로직을 `renderEventItem` 헬퍼 함수로 추출
    - 함수 추출: `renderEventItem(event: Event, isNotified: boolean, isRepeating: boolean)` 함수 생성
      - 이벤트 아이템의 Box, Stack, 아이콘, Typography 렌더링 로직을 재사용 가능한 함수로 분리
      - 접근성 속성(`aria-label="반복 일정"`) 유지
    - 코드 일관성 향상: 두 뷰에서 동일한 로직 사용으로 유지보수성 개선
  - Outputs:
    - 테스트 실행 및 Green 상태 확인: TC-01 ~ TC-04 모두 통과 (20개 테스트 전체 통과)
    - 코드 변경 사항:
      - `renderEventItem` 헬퍼 함수 추가 (App.tsx 상단, repeatTypeOptions 다음)
      - `renderWeekView`에서 중복 코드 제거 및 `renderEventItem` 사용
      - `renderMonthView`에서 중복 코드 제거 및 `renderEventItem` 사용
    - 코드 품질 개선:
      - 중복 코드 제거로 DRY 원칙 준수
      - 함수 추출로 가독성 향상
      - 동작은 동일하게 유지 (Behavior Preserving)
    - 변경 파일: `src/App.tsx`
  - Artifacts: `src/App.tsx`
  <!-- REFACTORING_END -->

---

## 🧾 요약 (Summary)

- 상태: `리팩토링 완료`
- 마지막 수정 에이전트: `리팩토링 에이전트`
- 주요 변경사항 요약: 반복 일정 아이콘 표시 기능 리팩토링 완료. 월 뷰와 주 뷰에서 중복된 이벤트 아이템 렌더링 로직을 `renderEventItem` 헬퍼 함수로 추출하여 중복 제거 및 가독성 향상. 동작은 동일하게 유지 (Behavior Preserving). 테스트 실행 결과: TC-01 ~ TC-04 모두 통과 (20개 테스트 전체 통과). 변경 파일: `src/App.tsx`
