# 🧭 Issue: 기능 요청서

## 🎯 목적 (Goal)

사용자가 반복 일정을 삭제할 때 해당 일정만 삭제할지 전체 시리즈를 삭제할지 선택할 수 있도록 한다.

---

## 📋 요구사항 (Requirements)

- 반복 일정 삭제 시 '해당 일정만 삭제하시겠어요?'라는 확인 다이얼로그가 표시된다.
- 사용자가 '예'를 선택하면 해당 일정만 삭제된다(단일 인스턴스 삭제).
- 사용자가 '아니오'를 선택하면 반복 일정의 모든 일정이 삭제된다(전체 시리즈 삭제).

---

## 🧩 맥락 & 범위 (Context & Scope)

- Impacted Areas: UI (`App.tsx` - 삭제 다이얼로그) | Hooks (`useEventOperations` - 삭제 로직/엔드포인트) | Tests (Integration)
- Out of Scope: 삭제 취소 후 되돌리기(Undo), 휴지통/복구, 반복 유형 변경/생성/수정

---

## 🧪 테스트 계획 요약 (Test Plan Summary)

### 테스트 시나리오 개요 (Scenario Overview)

- SC-01: 반복 일정 삭제 클릭 시 다이얼로그 표시 확인
- SC-02: '예' 선택 시 해당 일정만 삭제됨 확인(다른 시리즈 일정 유지)
- SC-03: '아니오' 선택 시 전체 시리즈 삭제됨 확인(관련 일정 모두 제거)
- SC-04: 단일 일정 삭제 시 다이얼로그 미표시 및 즉시 삭제 확인

### 테스트 케이스 상세 (Test Case Detail)

- **TC-01 반복 일정 삭제 다이얼로그 표시 (Integration)**

  - 목적: 반복 일정에서 삭제 버튼 클릭 시 '해당 일정만 삭제하시겠어요?' 다이얼로그 표시
  - 전제조건: 반복 일정 존재(repeat.type !== 'none')
  - 입력/행동: Edit/삭제 아이콘 중 삭제 클릭
  - 기대결과: 다이얼로그에 '예'/'아니오' 버튼 표시
  - 테스트 파일: `src/__tests__/medium.integration.spec.tsx`

- **TC-02 '예' 선택 시 단일 인스턴스 삭제 (Integration)**

  - 목적: '예' 선택 시 해당 일정만 삭제됨을 확인(시리즈 나머지는 유지)
  - 전제조건: 반복 일정 1개 이상 존재
  - 입력/행동: 삭제 → '예' 클릭
  - 기대결과: 선택한 일정만 리스트에서 제거, 성공 토스트 표시
  - 테스트 파일: `src/__tests__/medium.integration.spec.tsx`
  - 고려사항: 단일 삭제는 `DELETE /api/events/:id` 호출로 처리, 다른 인스턴스는 남아 있어야 함

- **TC-03 '아니오' 선택 시 전체 시리즈 삭제 (Integration)**

  - 목적: '아니오' 선택 시 반복 일정의 모든 인스턴스 삭제 확인
  - 전제조건: 동일 시리즈의 일정 다수 존재
  - 입력/행동: 삭제 → '아니오' 클릭
  - 기대결과: 해당 시리즈 모든 일정 제거, 성공 토스트 표시
  - 테스트 파일: `src/__tests__/medium.integration.spec.tsx`
  - 고려사항: 전체 시리즈 삭제는 `DELETE /api/recurring-events/:baseId` 호출로 처리

- **TC-04 단일 일정 삭제 시 다이얼로그 미표시 (Integration)**

  - 목적: repeat.type='none'인 일정은 다이얼로그 없이 즉시 삭제됨 확인
  - 전제조건: 단일 일정 존재
  - 입력/행동: 삭제 클릭
  - 기대결과: 다이얼로그 미표시, 즉시 삭제 처리, 성공 토스트 표시
  - 테스트 파일: `src/__tests__/medium.integration.spec.tsx`
  - 고려사항: 단일 일정 삭제는 `DELETE /api/events/:id` 호출, 다이얼로그 로직 분기 검증

  <!-- TEST_DESIGN_START -->

  - Inputs:
    - Issue 요구사항: '예' 선택 시 단일 삭제, '아니오' 선택 시 전체 시리즈 삭제
    - 컨텍스트: App.tsx 삭제 다이얼로그/핸들러 존재, useEventOperations에 `deleteEvent`, `deleteRecurringSeries` 구현 존재
    - ARCHITECTURE.md, PRD.md
  - Actions:
    - 테스트 유형: Integration 중심(사용자 플로우 기반)
    - 시나리오 4개 설계: 다이얼로그 표시, 단일 삭제, 전체 시리즈 삭제, 단일 일정 즉시 삭제
    - 모킹 전략: MSW로 `DELETE /api/events/:id`, `DELETE /api/recurring-events/:baseId` 핸들러 구성, 초기 이벤트 시드 준비
    - 검증 포인트: 다이얼로그 표시/미표시, 호출 엔드포인트 및 파라미터, 리스트 내 잔존 이벤트 개수, 토스트 메시지
  - Outputs:
    - 테스트 케이스 상세 명세 업데이트(TC-01 ~ TC-04)
    - 테스트 파일 배치 계획: `src/__tests__/medium.integration.spec.tsx`
    <!-- TEST_DESIGN_END -->

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
  - Inputs:
    - 테스트 계획: TC-01 ~ TC-04 (반복 일정 삭제)
    - 테스트 파일: `src/__tests__/medium.integration.spec.tsx`
  - Actions:
    - TC-01 작성: 반복 일정 삭제 버튼 클릭 시 다이얼로그 표시 확인
    - TC-02 작성: '예' 선택 시 단일 인스턴스만 삭제 (DELETE /api/events/:id)
    - TC-03 작성: '아니오' 선택 시 전체 시리즈 삭제 (DELETE /api/recurring-events/:baseId)
    - TC-04 작성: 단일 일정 삭제 시 다이얼로그 미표시 및 즉시 삭제
    - MSW 모킹: 테스트 내 server.use로 GET/DELETE 엔드포인트 구성
  - Outputs:
    - 테스트 케이스 4개 추가 (통합)
    - 린트/타입 오류 없음
  - Artifacts: `src/__tests__/medium.integration.spec.tsx`
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

- 상태: `테스트 코드 작성(RED)`
- 마지막 수정 에이전트: 테스트 코드 작성 에이전트
- 주요 변경사항 요약: 반복 일정 삭제 통합 테스트 4개 추가. 다이얼로그 표시/분기, 단일 삭제와 전체 시리즈 삭제, 단일 일정 즉시 삭제 플로우를 커버. MSW 모킹 전략 반영.
