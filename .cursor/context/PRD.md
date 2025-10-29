## 캘린더 PRD

### 목적

- 월/주 달력에서 일정을 쉽게 추가·수정·삭제하고, 검색과 시작 전 알림을 제공한다.

### 범위

- 포함: 일정 CRUD, 월/주 뷰, 검색(제목/설명/위치), 알림, 공휴일 표시, 겹침 경고
- 제외: 반복 일정의 실제 동작(i18n, 외부 캘린더 연동, 오프라인/PWA)

### 핵심 기능

- 일정 추가/수정/삭제: 필수값(제목/날짜/시간) 검증, 성공/실패 토스트
- 조회(뷰): 월/주 전환, 해당 기간 일정만 표시, 월 뷰에 공휴일 라벨
- 검색: 제목/설명/위치 부분 일치, 결과 없으면 “검색 결과가 없습니다.”
- 알림: 매 1초 체크, 시작 시간까지 남은 분 ≤ notificationTime인 미알림 이벤트에 메시지 생성
- 겹침 감지: 같은 날짜 내 시간 구간 겹치면 경고 다이얼로그에서 계속/취소 선택

### API

- GET /api/events → { events: Event[] }
- POST /api/events → 저장, 재조회, “일정이 추가되었습니다.”
- PUT /api/events/:id → 수정, 재조회, “일정이 수정되었습니다.”
- DELETE /api/events/:id → 삭제, 재조회, “일정이 삭제되었습니다.”
- 실패 시: 각 액션별 에러 토스트 노출

### 데이터 모델 (요약)

```
Event {
  id: string,
  title: string,
  date: YYYY-MM-DD,
  startTime: HH:mm,
  endTime: HH:mm,
  description: string,
  location: string,
  category: '업무' | '개인' | '가족' | '기타',
  repeat: { type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly', interval: number, endDate?: YYYY-MM-DD },
  notificationTime: number
}
```

### 수용 기준

- CRUD 후 리스트와 뷰에 값이 정확히 반영된다.
- 월/주 전환 시 해당 기간 일정만 보인다.
- 월 뷰에서 1월 1일은 “신정”으로 표시된다.
- 검색 없으면 전체, 검색 시 매칭만, 없으면 “검색 결과가 없습니다.”
- 알림 10분 설정 시 시작 10분 전 메시지가 노출된다.
- 시간 겹침 저장 시 경고 노출, 계속 진행 선택 시 저장된다.
- API 실패 시 지정된 에러 토스트가 노출된다.

### 기술

- React + Vite + TypeScript, Material UI, notistack, MSW(개발/테스트)
