# Test Code Style

## 일반 원칙

- 테스트 이름은 자연어(대부분 한국어)로 시나리오와 기대 결과를 함께 명시한다. `describe`는 기능 단위, `it`은 하나의 명확한 예상 동작을 검증한다.
- AAA 패턴을 유지하되 별도 주석 없이도 흐름이 보이도록 Arrange(상수/fixture) → Act(`act`, `user.*`, 함수 호출) → Assert(`expect`) 순서를 눈에 띄게 배치한다.
- 재사용하는 fixture는 파일 상단에 상수로 선언하고, 테스트 안에서는 필요한 경우만 얕은 복사나 업데이트를 수행한다.
- 중요한 맥락이나 제한 사항은 한 줄 주석으로 남기되, `// !`(강조), `// ?`(의문)처럼 이미 쓰인 접두어를 재사용한다.

```6:112:src/__tests__/unit/easy.eventUtils.spec.ts
describe('getFilteredEvents', () => {
  const events: Event[] = [
    // ... existing code ...
  ];

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const result = getFilteredEvents(events, '이벤트 2', new Date('2025-07-01'), 'month');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('이벤트 2');
  });
});
```

## Hook 테스트

- `renderHook`으로 훅을 감싸고, 상태 변화를 일으킬 때는 항상 `act`를 사용한다. 비동기 효과 대기에는 `await act(() => Promise.resolve(null))`처럼 즉시 resolve하는 패턴을 쓴다.
- 날짜 비교 등 정밀 검증은 `assertDate`, `parseHM` 같은 공통 유틸을 통해 수행한다.
- `vi.setSystemTime`, `vi.advanceTimersByTime`을 활용할 때는 호출 전후로 기대 상태를 명확히 검증한다.

```6:76:src/__tests__/hooks/easy.useCalendarView.spec.ts
it("주간 뷰에서 다음으로 navigate시 7일 후 '2025-10-08' 날짜로 지정이 된다", () => {
  const { result } = renderHook(() => useCalendarView());
  act(() => {
    result.current.setView('week');
  });
  act(() => {
    result.current.navigate('next');
  });
  assertDate(result.current.currentDate, new Date('2025-10-08'));
});
```

## 통합 테스트

- 공통 Provider(`ThemeProvider`, `SnackbarProvider`)나 테마 설정이 필요하면 파일 내 `setup` 헬퍼를 정의해 `render`와 `userEvent.setup()`을 묶는다.
- 사용자 플로우는 `await user.type`, `await user.click` 등 실제 유저 행동 순서대로 기술하고, 비동기 렌더링 결과는 `screen.findBy*`나 `within`을 사용해 명시적으로 기다린다.
- 서버 상호작용은 MSW 핸들러 유틸(`setupMockHandlerCreation` 등)로 준비하고, 각 시나리오 종료 후에는 `server.resetHandlers()`로 기본 상태를 복원한다.

```57:135:src/__tests__/medium.integration.spec.tsx
describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    setupMockHandlerCreation();
    const { user } = setup(<App />);
    await saveSchedule(user, {
      title: '새 회의',
      date: '2025-10-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 A',
      category: '업무',
    });
    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('새 회의')).toBeInTheDocument();
  });
});
```

## 모킹 & 유틸 전략

- 네트워크: `msw`의 `http`/`HttpResponse`로 라우트별 응답을 정의하고, 실패 케이스를 명시적으로 만들어 에러 핸들링을 검증한다.
- 전역 훅/라이브러리: `vi.mock`으로 필요한 함수만 대체하며, `vi.importActual`로 나머지는 유지하는 패턴을 따른다.
- 시간 의존 로직: 상단에 `const 초`, `const 분` 처럼 가독성 높은 단위를 선언하고, 시스템 시간을 고정한 뒤 타이머를 전진시키며 검증한다.

```13:171:src/__tests__/hooks/medium.useEventOperations.spec.ts
vi.mock('notistack', async () => {
  const actual = await vi.importActual('notistack');
  return {
    ...actual,
    useSnackbar: () => ({
      enqueueSnackbar: enqueueSnackbarFn,
    }),
  };
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  server.use(
    http.delete('/api/events/:id', () => new HttpResponse(null, { status: 500 }))
  );
  const { result } = renderHook(() => useEventOperations(false));
  await act(() => Promise.resolve(null));
  await act(async () => {
    await result.current.deleteEvent('1');
  });
  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 삭제 실패', { variant: 'error' });
  expect(result.current.events).toHaveLength(1);
});
```

## 검증 패턴

- DOM 테스트는 `toBeInTheDocument`, `queryBy*`, `findBy*`를 상황에 맞게 혼용하고, 리스트/배열 검증은 `toHaveLength`, `map` + `toEqual`로 기대 데이터를 명시한다.
- 날짜 문자열 비교 등은 `toISOString().split('T')[0]`처럼 명시적으로 문자열화하여 비교한다.
- 예외 상황도 빠짐없이 다루고, 실패 케이스에 대한 별도 테스트를 작성해 회귀를 방지한다.

```38:88:src/__tests__/unit/easy.dateUtils.spec.ts
it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
  const date = new Date('2024-12-30');
  const weekDates = getWeekDates(date);
  expect(weekDates[0].toISOString().split('T')[0]).toBe('2024-12-29');
  expect(weekDates[6].toISOString().split('T')[0]).toBe('2025-01-04');
});
```
