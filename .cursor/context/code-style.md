# Code Style

## Imports & Module Layout

- 외부 라이브러리를 최상단에 묶어 두고, MUI 아이콘/컴포넌트처럼 관련 항목은 다중 import로 정리한다. 내부 모듈은 그 뒤에 배치하고 `.ts` 확장자를 명시한다.
- 상수(`categories`, `weekDays`, `notificationOptions`)는 컴포넌트 정의 위에 선언해 시각적으로 분리한다.

```1:62:src/App.tsx
import { Notifications, ChevronLeft, ChevronRight, Delete, Edit, Close } from '@mui/icons-material';
import { Alert, AlertTitle, Box, Button, Checkbox, Dialog, DialogActions } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { useCalendarView } from './hooks/useCalendarView.ts';
// ... existing code ...
const notificationOptions = [
  { value: 1, label: '1분 전' },
  { value: 10, label: '10분 전' },
];
```

## React 컴포넌트 구성

- 컴포넌트는 `function App()` 형태로 선언하고, 훅 호출 후 파생 렌더링 로직(`renderWeekView`, `renderMonthView`)은 내부 헬퍼 함수로 분리한다.
- 이벤트 핸들러는 `const addOrUpdateEvent = async () => { ... }`와 같이 화살표 함수로 정의하고, 필수 입력/에러 체크 → 데이터 조립 → 사이드이펙트 순서를 유지한다.
- JSX에서는 MUI의 `sx`를 활용해 인라인 스타일을 구성하고, 조건부 렌더링은 삼항 연산자 혹은 `&&` 패턴으로 처리한다.

```105:215:src/App.tsx
const addOrUpdateEvent = async () => {
  if (!title || !date || !startTime || !endTime) {
    enqueueSnackbar('필수 정보를 모두 입력해주세요.', { variant: 'error' });
    return;
  }
  const eventData: Event | EventForm = { /* ... */ };
  const overlapping = findOverlappingEvents(eventData, events);
  if (overlapping.length > 0) {
    setOverlappingEvents(overlapping);
    setIsOverlapDialogOpen(true);
  } else {
    await saveEvent(eventData);
    resetForm();
  }
};
```

## 커스텀 훅 패턴

- 훅은 `export const useX = (...) => { ... }` 형태로 정의하고, 내부 상태는 `useState` 초기값에 `initialEvent`와 같은 인자를 반영한다.
- 반환 객체는 상태 값과 setter를 모두 노출하며, 시간 검증처럼 관련 유틸을 직접 호출해 결과를 함께 제공한다.
- 비동기 초기화나 외부 데이터 의존 훅은 `useEffect`로 사이드이펙트를 묶고, 필요 시 ESLint 예외가 있음을 주석으로 명시한다.

```8:105:src/hooks/useEventForm.ts
export const useEventForm = (initialEvent?: Event) => {
  const [title, setTitle] = useState(initialEvent?.title || '');
  const [startTime, setStartTime] = useState(initialEvent?.startTime || '');
  const handleStartTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newStartTime = e.target.value;
    setStartTime(newStartTime);
    setTimeError(getTimeErrorMessage(newStartTime, endTime));
  };
  return { title, setTitle, startTime, setStartTime, handleStartTimeChange, /* ... */ };
};
```

## 유틸리티 작성 원칙

- 유틸 함수는 `export function`으로 선언하고 JSDoc 또는 한 줄 설명 주석으로 의도를 밝힌다. 입력/출력 타입을 명확히 지정하며, 내부 보조 함수는 파일 상단에서 선언해 재활용한다.
- 날짜 계산, 필터링 등 순수 함수는 불변 데이터 사용을 기본으로 하고, 가독성을 위해 중간 변수를 적극 도입한다.

```3:110:src/utils/dateUtils.ts
/**
 * 주어진 년도와 월의 일수를 반환합니다.
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function getEventsForDay(events: Event[], date: number): Event[] {
  return events.filter((event) => new Date(event.date).getDate() === date);
}
```

## 비동기 처리 & 예외 대응

- `fetch` 기반 API 호출은 try/catch로 감싸고, 실패 시 콘솔 로깅과 함께 `enqueueSnackbar`로 사용자에게 피드백한다.
- 성공 흐름에서는 후속 업데이트(`await fetchEvents()`), 콜백 실행(`onSave?.()`), 알림 노출을 순서대로 수행한다.

```10:70:src/hooks/useEventOperations.ts
const saveEvent = async (eventData: Event | EventForm) => {
  try {
    const response = await fetch(editing ? `/api/events/${(eventData as Event).id}` : '/api/events', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });
    if (!response.ok) {
      throw new Error('Failed to save event');
    }
    await fetchEvents();
    onSave?.();
    enqueueSnackbar(editing ? '일정이 수정되었습니다.' : '일정이 추가되었습니다.', { variant: 'success' });
  } catch (error) {
    console.error('Error saving event:', error);
    enqueueSnackbar('일정 저장 실패', { variant: 'error' });
  }
};
```

## 타입 정의 & 상수

- 공용 타입은 `src/types.ts`에서 `type`/`interface`로 정의하고, 반복 사용되는 구조(예: `RepeatInfo`)는 별도 인터페이스로 분리한다.
- Notification, 시간 단위 등의 상수는 한글 변수명도 허용하되 의미가 분명하도록 정의한다.

```1:24:src/types.ts
export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
export interface EventForm {
  title: string;
  date: string;
  startTime: string;
  // ... existing code ...
}
```
