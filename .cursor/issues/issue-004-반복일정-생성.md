# 🧭 Issue: 기능 요청서

## 🎯 목적 (Goal)

사용자가 반복 일정을 생성할 때 설정한 반복 유형에 따라 종료일까지 일정이 자동으로 생성되도록 한다.

---

## 📋 요구사항 (Requirements)

- 반복 유형이 '매일'인 경우, 반복 종료일까지 매일 일정이 생성된다.
- 반복 유형이 '매주'인 경우, 반복 종료일까지 매주 일정이 생성된다.
- 반복 유형이 '매월'인 경우, 반복 종료일까지 매월 일정이 생성된다.
- 반복 유형이 '매년'인 경우, 반복 종료일까지 매년 일정이 생성된다.
- 반복 종료일이 지정된 경우, 해당 날짜까지만 일정이 생성된다.
- 반복 종료일이 지정되지 않은 경우, 무한 반복으로 처리된다(또는 기본 기간 적용).

---

## 🧩 맥락 & 범위 (Context & Scope)

- Impacted Areas: Utils (반복 일정 생성 로직) | Hooks (useEventOperations) | Tests
- Out of Scope: 반복 일정 수정 시 전체 시리즈 업데이트, 반복 일정 삭제 시 전체 시리즈 삭제, 반복 일정 편집(단일 일정 편집)

---

## 🧪 테스트 계획 요약 (Test Plan Summary)

### 테스트 시나리오 개요 (Scenario Overview)

- SC-01: 매일 반복 일정 생성 확인 - 반복 유형이 '매일'인 경우 종료일까지 매일 일정이 생성됨
- SC-02: 매주 반복 일정 생성 확인 - 반복 유형이 '매주'인 경우 종료일까지 매주 일정이 생성됨
- SC-03: 매월 반복 일정 생성 확인 - 반복 유형이 '매월'인 경우 종료일까지 매월 일정이 생성됨
- SC-04: 매년 반복 일정 생성 확인 - 반복 유형이 '매년'인 경우 종료일까지 매년 일정이 생성됨
- SC-05: 반복 종료일 이후 일정 미생성 확인 - 종료일 이후에는 일정이 생성되지 않음

### 테스트 케이스 상세 (Test Case Detail)

- **TC-01 매일 반복 일정 생성 확인 (Unit)**

  - 목적: 반복 유형이 '매일'인 경우 종료일까지 매일 일정이 생성되는지 검증
  - 전제조건: 반복 일정 생성 유틸 함수 존재
  - 입력/행동:
    - 시작일: 2025-10-15, 종료일: 2025-10-20, 반복 유형: 'daily'
    - 반복 일정 생성 함수 호출
  - 기대결과:
    - 2025-10-15부터 2025-10-20까지 매일 일정이 생성됨 (6개)
    - 각 일정의 날짜가 올바르게 설정됨
  - 테스트 파일: `src/__tests__/unit/easy.eventUtils.spec.ts` 또는 새로운 파일
  - 고려사항: 날짜 계산 로직 검증, 생성된 일정 개수 확인

- **TC-02 매주 반복 일정 생성 확인 (Unit)**

  - 목적: 반복 유형이 '매주'인 경우 종료일까지 매주 일정이 생성되는지 검증
  - 전제조건: 반복 일정 생성 유틸 함수 존재
  - 입력/행동:
    - 시작일: 2025-10-15 (수요일), 종료일: 2025-11-05, 반복 유형: 'weekly'
    - 반복 일정 생성 함수 호출
  - 기대결과:
    - 2025-10-15, 2025-10-22, 2025-10-29, 2025-11-05 일정이 생성됨 (4개)
    - 각 일정의 날짜가 7일 간격으로 설정됨
  - 테스트 파일: `src/__tests__/unit/easy.eventUtils.spec.ts` 또는 새로운 파일
  - 고려사항: 주간 간격 계산 검증

- **TC-03 매월 반복 일정 생성 확인 (Unit)**

  - 목적: 반복 유형이 '매월'인 경우 종료일까지 매월 일정이 생성되는지 검증
  - 전제조건: 반복 일정 생성 유틸 함수 존재
  - 입력/행동:
    - 시작일: 2025-10-15, 종료일: 2025-12-15, 반복 유형: 'monthly'
    - 반복 일정 생성 함수 호출
  - 기대결과:
    - 2025-10-15, 2025-11-15, 2025-12-15 일정이 생성됨 (3개)
    - 각 일정의 날짜가 월 단위로 증가함
  - 테스트 파일: `src/__tests__/unit/easy.eventUtils.spec.ts` 또는 새로운 파일
  - 고려사항: 월 단위 계산 및 월말 처리 검증

- **TC-04 매년 반복 일정 생성 확인 (Unit)**

  - 목적: 반복 유형이 '매년'인 경우 종료일까지 매년 일정이 생성되는지 검증
  - 전제조건: 반복 일정 생성 유틸 함수 존재
  - 입력/행동:
    - 시작일: 2025-10-15, 종료일: 2027-10-15, 반복 유형: 'yearly'
    - 반복 일정 생성 함수 호출
  - 기대결과:
    - 2025-10-15, 2026-10-15, 2027-10-15 일정이 생성됨 (3개)
    - 각 일정의 날짜가 연 단위로 증가함
  - 테스트 파일: `src/__tests__/unit/easy.eventUtils.spec.ts` 또는 새로운 파일
  - 고려사항: 연 단위 계산 검증

- **TC-05 반복 종료일 이후 일정 미생성 확인 (Unit)**

  - 목적: 반복 종료일 이후에는 일정이 생성되지 않는지 검증
  - 전제조건: 반복 일정 생성 유틸 함수 존재
  - 입력/행동:
    - 시작일: 2025-10-15, 종료일: 2025-10-17, 반복 유형: 'daily'
    - 반복 일정 생성 함수 호출
  - 기대결과:
    - 2025-10-15, 2025-10-16, 2025-10-17 일정만 생성됨 (3개)
    - 2025-10-18 이후 일정은 생성되지 않음
  - 테스트 파일: `src/__tests__/unit/easy.eventUtils.spec.ts` 또는 새로운 파일
  - 고려사항: 종료일 경계 검증

- **TC-06 반복 일정 생성 통합 테스트 (Integration)**
  - 목적: 실제 UI에서 반복 일정을 생성하면 종료일까지 일정이 생성되는지 검증
  - 전제조건: 일정 생성 폼이 렌더링됨
  - 입력/행동:
    1. 반복 일정 체크박스 선택
    2. 반복 유형 선택 (예: 매일)
    3. 시작일 입력 (2025-10-15)
    4. 반복 종료일 입력 (2025-10-20)
    5. 일정 저장
  - 기대결과:
    - 2025-10-15부터 2025-10-20까지 매일 일정이 생성됨
    - 생성된 일정이 이벤트 리스트에 표시됨
  - 테스트 파일: `src/__tests__/medium.integration.spec.tsx`
  - 고려사항: MSW 핸들러 활용, 실제 API 호출 모킹

---

## 🔁 TDD 사이클 (Red → Green → Refactor)

- [x] Red: 실패하는 테스트 추가 (Test Code Agent)
- [x] Green: 최소 구현으로 통과 (Implementation Agent)
- [ ] Refactor: 동작 동일, 구조/가독성 개선 (Refactoring Agent)

---

## 🧠 에이전트 작업 로그 (Agent Work Log)

### 🧩 테스트 설계 에이전트 (Test Design)

- Inputs: Story/AC, Context
- Actions: 테스트 유형/파일 배치 설계, 모킹 전략 수립
- Outputs: 테스트 계획 요약/시나리오 업데이트
- Artifacts: (별도 문서 없음)
  <!-- TEST_DESIGN_START -->
  - Inputs:
    - Issue 목적: 반복 유형에 따라 종료일까지 일정이 자동 생성
    - 요구사항: 매일/매주/매월/매년 반복 유형별 일정 생성, 종료일까지 생성, 종료일 이후 미생성
    - 컨텍스트: Utils에 반복 일정 생성 로직 필요, useEventOperations에서 호출, /api/events-list API 활용
  - Actions:
    - 요구사항 분석: 5가지 시나리오 도출 (매일/매주/매월/매년 생성, 종료일 이후 미생성)
    - 테스트 유형 결정: Unit 테스트 (반복 일정 생성 로직 검증), Integration 테스트 (전체 플로우 검증)
    - 테스트 케이스 설계: 6개 테스트 케이스 작성 (TC-01 ~ TC-06)
    - 테스트 파일 배치:
      - Unit 테스트: `src/__tests__/unit/easy.eventUtils.spec.ts` 또는 새 파일
      - Integration 테스트: `src/__tests__/medium.integration.spec.tsx`
    - 모킹 전략: MSW 핸들러 활용, /api/events-list 엔드포인트 모킹
  - Outputs:
    - 테스트 시나리오 5개 (SC-01 ~ SC-05)
    - 테스트 케이스 6개 (TC-01 ~ TC-06) 상세 명세
    - 테스트 파일 배치 계획
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
    - 테스트 계획: 6개 테스트 케이스 (TC-01 ~ TC-06)
    - 테스트 파일: Unit 테스트 `src/__tests__/unit/easy.generateRecurringEvents.spec.ts`, Integration 테스트 `src/__tests__/medium.integration.spec.tsx`
    - 기존 테스트 구조 참고: 다른 unit 테스트 패턴
  - Actions:
    - Unit 테스트 파일 생성: `src/__tests__/unit/easy.generateRecurringEvents.spec.ts`
    - TC-01 ~ TC-05 구현: 매일/매주/매월/매년 반복 일정 생성 및 종료일 경계 테스트
    - Integration 테스트 추가: `src/__tests__/medium.integration.spec.tsx`에 TC-06 추가
    - MSW 핸들러 설정: /api/events-list 엔드포인트 모킹
    - 테스트 실행 및 실패 확인 (RED 상태)
    - Lint 오류 수정
  - Outputs:
    - 테스트 파일:
      - `src/__tests__/unit/easy.generateRecurringEvents.spec.ts` (새 파일, 148줄)
      - `src/__tests__/medium.integration.spec.tsx` (725-812줄)
    - 테스트 실행 결과:
      - Unit 테스트: 5개 모두 실패 (generateRecurringEvents 함수 없음)
      - Integration 테스트: 1개 (TC-06) - 아직 실행 안 함
    - 주요 실패 원인: `generateRecurringEvents` 유틸 함수가 아직 구현되지 않음
  - Artifacts:
    - `src/__tests__/unit/easy.generateRecurringEvents.spec.ts`
    - `src/__tests__/medium.integration.spec.tsx`
    <!-- TEST_CODE_END -->

---

### 💻 코드 작성 에이전트 (Implementation)

- Inputs: 실패 테스트
- Actions: 최소 구현(Green)
- Outputs: 변경 파일/주요 변경 요약
- Artifacts: 소스 코드 경로
  <!-- IMPLEMENTATION_START -->
  **작업 일시**: 2025-01-XX
  
  **Inputs**:
  - 실패 테스트: Unit 테스트 5개, Integration 테스트 1개 (총 6개 실패)
  - 테스트 파일: `src/__tests__/unit/easy.generateRecurringEvents.spec.ts`, `src/__tests__/medium.integration.spec.tsx`
  
  **Actions**:
  1. `src/utils/eventUtils.ts`에 `generateRecurringEvents` 함수 구현
     - 반복 유형(daily/weekly/monthly/yearly)에 따라 종료일까지 일정 생성
     - `formatDate` 유틸 함수 활용
  2. `src/hooks/useEventOperations.ts` 수정
     - 반복 일정인 경우 `generateRecurringEvents` 호출하여 여러 일정 생성
     - 생성된 일정들을 `/api/events-list` 엔드포인트로 전송
  3. `src/__mocks__/handlersUtils.ts` 수정
     - `setupMockHandlerCreation`에 `/api/events-list` 핸들러 추가
  4. `src/__tests__/medium.integration.spec.tsx` 수정
     - TC-03 테스트 수정 (반복 일정이 여러 개 생성되는 경우 처리)
  
  **Outputs**:
  - 변경 파일:
    - `src/utils/eventUtils.ts` (+46 lines)
    - `src/hooks/useEventOperations.ts` (+20 lines)
    - `src/__mocks__/handlersUtils.ts` (+12 lines)
    - `src/__tests__/medium.integration.spec.tsx` (+5 lines, -2 lines)
  
  **주요 변경 요약**:
  - `generateRecurringEvents`: 반복 일정 생성 로직 구현 (매일/매주/매월/매년 지원)
  - `useEventOperations.saveEvent`: 반복 일정인 경우 여러 일정 생성 후 `/api/events-list` 호출
  - Mock 핸들러에 `/api/events-list` 지원 추가
  - TC-03 테스트: `getAllByText` 사용하여 여러 일정 처리
  
  **Artifacts**:
  - `src/utils/eventUtils.ts` (generateRecurringEvents 함수)
  - `src/hooks/useEventOperations.ts` (saveEvent 함수)
  - `src/__mocks__/handlersUtils.ts` (setupMockHandlerCreation 함수)
  
  **테스트 결과**: ✅ 모든 테스트 통과 (137개)
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

- 상태: `구현 완료(GREEN)`
- 마지막 수정 에이전트: `코드 작성 에이전트`
- 주요 변경사항 요약: 반복 일정 생성 기능 구현 완료. `generateRecurringEvents` 유틸 함수 구현 및 `useEventOperations`에 반복 일정 생성 로직 추가. 반복 종료일까지 설정된 반복 유형에 따라 일정이 자동 생성됨. 모든 테스트 통과 (137개)
