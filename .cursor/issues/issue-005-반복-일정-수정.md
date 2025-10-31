# 🧭 Issue: 기능 요청서

## 🎯 목적 (Goal)

사용자가 반복 일정을 수정할 때 해당 일정만 수정할지 전체 시리즈를 수정할지 선택할 수 있도록 한다.

---

## 📋 요구사항 (Requirements)

- 반복 일정 수정 시 '해당 일정만 수정하시겠어요?'라는 확인 다이얼로그가 표시된다.
- 사용자가 '예'를 선택하면 해당 일정만 단일 일정으로 수정된다(반복일정이 단일 일정으로 변경).
- '예'를 선택한 경우 반복일정 아이콘이 사라진다.
- 사용자가 '아니오'를 선택하면 반복 일정 전체 시리즈가 수정된다(반복 설정 유지).
- '아니오'를 선택한 경우 반복일정 아이콘이 유지된다.

---

## 🧩 맥락 & 범위 (Context & Scope)

- Impacted Areas: UI (App.tsx - 수정 다이얼로그) | Hooks (useEventOperations - 수정 로직) | Tests (Integration, Hook)
- Out of Scope: 반복 일정 삭제 로직, 반복 일정 생성 로직, 반복 유형 변경

---

## 🧪 테스트 계획 요약 (Test Plan Summary)

### 테스트 시나리오 개요 (Scenario Overview)

- SC-01: 반복 일정 수정 시 다이얼로그 표시 확인 - 반복 일정 수정 클릭 시 '해당 일정만 수정하시겠어요?' 다이얼로그가 표시됨
- SC-02: '예' 선택 시 단일 일정으로 수정 - '예'를 선택하면 해당 일정만 단일 일정으로 변환되어 수정됨
- SC-03: '예' 선택 시 반복 아이콘 제거 확인 - 단일 일정으로 변환된 일정은 반복 아이콘이 사라짐
- SC-04: '아니오' 선택 시 전체 시리즈 수정 - '아니오'를 선택하면 반복 일정 전체 시리즈가 수정됨
- SC-05: '아니오' 선택 시 반복 아이콘 유지 확인 - 전체 시리즈 수정 후에도 반복 아이콘이 유지됨
- SC-06: 단일 일정 수정 시 다이얼로그 미표시 - 단일 일정(repeat.type='none') 수정 시 다이얼로그가 표시되지 않음

### 테스트 케이스 상세 (Test Case Detail)

- **TC-01 반복 일정 수정 시 다이얼로그 표시 확인 (Integration)**

  - 목적: 사용자가 반복 일정 수정 버튼을 클릭하면 수정 방식 선택 다이얼로그가 표시되는지 검증
  - 전제조건: 반복 일정(repeat.type !== 'none')이 이벤트 리스트에 존재
  - 입력/행동:
    1. 반복 일정의 수정 버튼(Edit event) 클릭
  - 기대결과:
    - '해당 일정만 수정하시겠어요?' 텍스트가 포함된 다이얼로그가 표시됨
    - '예', '아니오' 버튼이 표시됨
  - 테스트 파일: `src/__tests__/medium.integration.spec.tsx`
  - 고려사항: getByRole('dialog'), getByText 사용

- **TC-02 '예' 선택 시 단일 일정으로 수정 (Integration)**

  - 목적: 다이얼로그에서 '예'를 선택하면 해당 일정만 단일 일정(repeat.type='none')으로 변환되어 수정 모드로 진입하는지 검증
  - 전제조건: 반복 일정 수정 다이얼로그가 표시됨
  - 입력/행동:
    1. 반복 일정의 수정 버튼 클릭
    2. 다이얼로그에서 '예' 버튼 클릭
    3. 제목을 '수정된 단일 일정'으로 변경
    4. 일정 수정 버튼 클릭
  - 기대결과:
    - 일정 수정 폼이 열림
    - 반복 일정 체크박스가 해제되어 있음 (또는 repeat.type='none')
    - 수정 후 해당 일정만 업데이트됨 (다른 시리즈 일정은 영향 없음)
    - PUT /api/events/:id 호출됨
  - 테스트 파일: `src/__tests__/medium.integration.spec.tsx`
  - 고려사항: MSW 핸들러로 PUT 요청 모킹, 요청 body에서 repeat.type='none' 확인

- **TC-03 '예' 선택 후 수정된 일정의 반복 아이콘 제거 확인 (Integration)**

  - 목적: 단일 일정으로 변환 후 저장된 일정에서 반복 아이콘이 사라지는지 검증
  - 전제조건: 반복 일정이 단일 일정으로 수정됨 (TC-02 완료)
  - 입력/행동:
    1. 반복 일정 수정 → '예' 선택 → 제목 수정 → 저장
    2. 이벤트 리스트에서 수정된 일정 확인
  - 기대결과:
    - 수정된 일정에 반복 아이콘(Repeat)이 표시되지 않음
    - queryByLabelText('반복 일정') 결과가 null (해당 일정 row 내에서)
  - 테스트 파일: `src/__tests__/medium.integration.spec.tsx`
  - 고려사항: within() 사용하여 특정 row 내에서 반복 아이콘 검색

- **TC-04 '아니오' 선택 시 전체 시리즈 수정 (Integration)**

  - 목적: 다이얼로그에서 '아니오'를 선택하면 반복 설정을 유지한 채로 전체 시리즈가 수정되는지 검증
  - 전제조건: 반복 일정 수정 다이얼로그가 표시됨
  - 입력/행동:
    1. 반복 일정의 수정 버튼 클릭
    2. 다이얼로그에서 '아니오' 버튼 클릭
    3. 제목을 '수정된 전체 시리즈'로 변경
    4. 일정 수정 버튼 클릭
  - 기대결과:
    - 일정 수정 폼이 열림
    - 반복 일정 설정이 유지됨 (repeat.type, interval, endDate 유지)
    - 수정 후 해당 일정이 업데이트됨
    - PUT /api/events/:id 호출됨 (repeat 정보 포함)
  - 테스트 파일: `src/__tests__/medium.integration.spec.tsx`
  - 고려사항: MSW 핸들러로 PUT 요청 모킹, 요청 body에서 repeat.type이 'none'이 아닌지 확인

- **TC-05 '아니오' 선택 후 수정된 일정의 반복 아이콘 유지 확인 (Integration)**

  - 목적: 전체 시리즈 수정 후에도 반복 아이콘이 유지되는지 검증
  - 전제조건: 반복 일정이 전체 시리즈로 수정됨 (TC-04 완료)
  - 입력/행동:
    1. 반복 일정 수정 → '아니오' 선택 → 제목 수정 → 저장
    2. 이벤트 리스트에서 수정된 일정 확인
  - 기대결과:
    - 수정된 일정에 반복 아이콘(Repeat)이 여전히 표시됨
    - getByLabelText('반복 일정') 또는 getByTitle('반복 일정')으로 아이콘 확인 가능
  - 테스트 파일: `src/__tests__/medium.integration.spec.tsx`
  - 고려사항: within() 사용하여 특정 row 내에서 반복 아이콘 검색

- **TC-06 단일 일정 수정 시 다이얼로그 미표시 (Integration)**
  - 목적: 단일 일정(repeat.type='none') 수정 시 다이얼로그가 표시되지 않고 바로 수정 모드로 진입하는지 검증
  - 전제조건: 단일 일정이 이벤트 리스트에 존재
  - 입력/행동:
    1. 단일 일정(반복 아이콘 없는 일정)의 수정 버튼 클릭
  - 기대결과:
    - '해당 일정만 수정하시겠어요?' 다이얼로그가 표시되지 않음
    - 일정 수정 폼이 바로 열림
  - 테스트 파일: `src/__tests__/medium.integration.spec.tsx`
  - 고려사항: queryByText('해당 일정만 수정하시겠어요?')가 null인지 확인

---

## 🔁 TDD 사이클 (Red → Green → Refactor)

- [x] Red: 실패하는 테스트 추가 (Test Code Agent)
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
  - Inputs:
    - Issue 요구사항: 반복 일정 수정 시 단일 수정('예') vs 전체 수정('아니오') 선택 기능
    - 목적: 사용자가 반복 일정 수정 시 해당 일정만 또는 전체 시리즈를 선택하여 수정 가능
    - 컨텍스트: App.tsx에 이미 다이얼로그 UI 존재 (730-745줄), handleEditEvent/handleEditSingleOccurrence/handleEditAllOccurrences 함수 존재 (162-193줄)
    - ARCHITECTURE.md, PRD.md 참조
  - Actions:
    - 코드베이스 분석: App.tsx 분석하여 기존 구현 상태 파악 완료
    - 요구사항 분석: 6가지 시나리오 도출 (다이얼로그 표시, '예' 선택 단일 수정, 반복 아이콘 제거, '아니오' 선택 전체 수정, 반복 아이콘 유지, 단일 일정 다이얼로그 미표시)
    - 테스트 유형 결정: Integration 테스트 중심 (사용자 관점의 전체 플로우 검증)
    - 테스트 케이스 설계: 6개 테스트 케이스 작성 (TC-01 ~ TC-06)
    - 테스트 파일 배치: `src/__tests__/medium.integration.spec.tsx`에 추가
    - 모킹 전략: MSW 핸들러 활용, PUT /api/events/:id 요청 모킹, 요청 body에서 repeat.type 검증
  - Outputs:
    - 테스트 시나리오 6개 (SC-01 ~ SC-06) 작성 완료
    - 테스트 케이스 6개 (TC-01 ~ TC-06) 상세 명세 완료
    - 각 테스트 케이스별 목적/전제조건/입력행동/기대결과/테스트 파일/고려사항 명시
  - Artifacts: 이슈 파일 내 테스트 계획 섹션 업데이트 완료
  <!-- TEST_DESIGN_END -->

---

### 🧪 테스트 코드 작성 에이전트 (Test Code)

- Inputs: Test Plan, Matrix
- Actions: 스캐폴딩/테스트 구현(단계적), 실패 확인
- Outputs: 커밋/PR 링크, 주요 테스트 스니펫
- Artifacts: `src/__tests__/*`
  <!-- TEST_CODE_START -->
  - Inputs:
    - 테스트 계획: TC-01 ~ TC-06 (6개 테스트 케이스)
    - 테스트 파일: `src/__tests__/medium.integration.spec.tsx`
    - 기존 테스트 스타일 참고
  - Actions:
    - 기존 테스트 검토: medium.integration.spec.tsx에 반복 일정 관련 테스트 이미 존재 확인
    - TC-01 작성: 반복 일정 수정 시 다이얼로그 표시 확인 (다이얼로그 텍스트, 버튼 확인)
    - TC-02 작성: '예' 선택 시 단일 일정으로 수정 (repeat.type='none' 확인)
    - TC-03 작성: '예' 선택 후 반복 아이콘 제거 확인 (queryAllByLabelText 사용)
    - TC-04 작성: '아니오' 선택 시 전체 시리즈 수정 (repeat 정보 유지 확인)
    - TC-05 작성: '아니오' 선택 후 반복 아이콘 유지 확인
    - TC-06 작성: 단일 일정 수정 시 다이얼로그 미표시 확인
    - MSW 핸들러 설정: PUT /api/events/:id 모킹, 요청 body 캡처
    - Lint 오류 수정: TypeScript 타입 오류 해결 (capturedRequestBody 타입 처리)
    - 테스트 쿼리 개선: DOM 구조 분석 후 반복 아이콘 검증 로직 개선 (closest 대신 queryAllByLabelText 사용)
  - Outputs:
    - 테스트 파일 작성 완료: `src/__tests__/medium.integration.spec.tsx` (823-1161줄, 6개 테스트 추가)
    - Lint 오류 없음 (No linter errors found)
    - 테스트 체크리스트 모두 통과 ✅
  - Artifacts: `src/__tests__/medium.integration.spec.tsx`
  <!-- TEST_CODE_END -->

---

### 💻 코드 작성 에이전트 (Implementation)

- Inputs: 실패 테스트(TC-03, TC-05), Issue 요구사항(반복 아이콘 표시/유지 규칙)
- Actions:
  - `src/App.tsx`의 event-list(좌측 리스트) 섹션에 반복 아이콘 추가
    - 조건: `event.repeat.type !== 'none'`
    - 접근성: `aria-label="반복 일정"`, `title="반복 일정"` 부여
  - 테스트 재실행으로 TC-03/TC-05 Green 확인
- Outputs:
  - 모든 관련 테스트 Green (31 passed)
  - 변경 파일: `src/App.tsx`
- Artifacts: `src/App.tsx`
  <!-- IMPLEMENTATION_START -->
  - Inputs: TC-03/TC-05 실패, 반복 아이콘 표시 요구사항
  - Actions: event-list에 Repeat 아이콘 및 접근성 라벨 추가
  - Outputs: 통합 테스트 31개 모두 Green
  - Artifacts: `src/App.tsx`
  <!-- IMPLEMENTATION_END -->

---

### 🔧 리팩토링 에이전트 (Refactoring)

- Inputs: Green 상태(31 tests passed), 중복된 반복 아이콘 렌더링 코드
- Actions:
  - `RepeatBadge` 컴포넌트 추출
  - 월/주 뷰의 `renderEventItem` 및 좌측 event-list에서 반복 아이콘 렌더링을 `RepeatBadge`로 통일
  - 접근성 표준 유지(aria-label/title 유지)
- Outputs:
  - 중복 제거 및 일관된 렌더링 구현
  - 모든 테스트 Green 유지
- Artifacts: `src/App.tsx`
  <!-- REFACTORING_START -->
  - Inputs: 반복 아이콘 렌더링 중복
  - Actions: `RepeatBadge` 추출, 두 위치에서 공통 사용
  - Outputs: 테스트 전부 Green 유지(31)
  - Artifacts: `src/App.tsx`
  <!-- REFACTORING_END -->

---

## 🧾 요약 (Summary)

- 상태: `완료`
- 마지막 수정 에이전트: 오케스트레이터
- 주요 변경사항 요약: 반복 일정 수정 기능 TDD 사이클 완료(Red → Green → Refactor). 테스트 6개 추가 및 통과, event-list 반복 아이콘 표시 구현, RepeatBadge로 중복 제거. 모든 테스트 Green(31) 및 Lint 정상. 변경 파일: `src/__tests__/medium.integration.spec.tsx`, `src/App.tsx`. 이슈 문서 최신화 완료.
