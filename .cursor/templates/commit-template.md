# commit template

<type>(scope?): <명확한 요약>

<본문 - optional>

<Footer - optional>

## type 종류

| Type     | 의미                               | 예시                                |
| -------- | ---------------------------------- | ----------------------------------- |
| feat     | 새로운 기능 추가                   | feat(calendar): 일정 생성 기능 추가 |
| fix      | 버그 수정                          | fix(api): 일정 조회 API 응답 수정   |
| refactor | 동작 변경 없는 코드 개선           | refactor: 중복 코드 제거            |
| chore    | 빌드/설정 등 비즈니스 외 변경      | chore: ESLint 설정 업데이트         |
| test     | 테스트 코드 추가/수정              | test: 일정 삭제 테스트 추가         |
| docs     | 문서 수정                          | docs: README에 사용법 추가          |
| style    | 코드 포맷 변경 (공백, 세미콜론 등) | style: 코드 포맷 정리               |
| perf     | 성능 개선                          | perf: 일정 필터링 속도 개선         |

## 예시

refactor: 반복되는 일정 검증 로직 함수로 추출

중복 코드를 제거하고 가독성을 향상시켰습니다.
기능 동작에는 변화 없음.
