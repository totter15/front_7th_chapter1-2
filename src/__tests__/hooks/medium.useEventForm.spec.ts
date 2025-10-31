import { act, renderHook } from '@testing-library/react';

import { useEventForm } from '../../hooks/useEventForm';
import { Event, RepeatType } from '../../types';

describe('useEventForm 반복 유형 상태 관리 (TC-02)', () => {
  it('초기 상태에서 repeatType은 none이다', () => {
    const { result } = renderHook(() => useEventForm());

    expect(result.current.repeatType).toBe('none');
    expect(result.current.isRepeating).toBe(false);
  });

  it('setRepeatType을 호출하면 repeatType이 업데이트된다', () => {
    const { result } = renderHook(() => useEventForm());

    act(() => {
      result.current.setRepeatType('daily');
    });
    expect(result.current.repeatType).toBe('daily');

    act(() => {
      result.current.setRepeatType('weekly');
    });
    expect(result.current.repeatType).toBe('weekly');

    act(() => {
      result.current.setRepeatType('monthly');
    });
    expect(result.current.repeatType).toBe('monthly');

    act(() => {
      result.current.setRepeatType('yearly');
    });
    expect(result.current.repeatType).toBe('yearly');
  });

  it('기존 반복 일정을 editEvent로 로드하면 반복 유형이 올바르게 설정된다', () => {
    const initialEvent: Event = {
      id: '1',
      title: '반복 회의',
      date: '2024-01-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '설명',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'daily', interval: 1 },
      notificationTime: 10,
    };

    const { result } = renderHook(() => useEventForm());

    act(() => {
      result.current.editEvent(initialEvent);
    });

    expect(result.current.repeatType).toBe('daily');
    expect(result.current.isRepeating).toBe(true);
    expect(result.current.repeatInterval).toBe(1);
  });

  it('다양한 반복 유형으로 초기화된 이벤트를 로드할 수 있다', () => {
    const weeklyEvent: Event = {
      id: '2',
      title: '주간 회의',
      date: '2024-01-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'weekly', interval: 1 },
      notificationTime: 10,
    };

    const monthlyEvent: Event = {
      id: '3',
      title: '월간 회의',
      date: '2024-01-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'monthly', interval: 1 },
      notificationTime: 10,
    };

    const yearlyEvent: Event = {
      id: '4',
      title: '연간 회의',
      date: '2024-01-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'yearly', interval: 1 },
      notificationTime: 10,
    };

    const { result, rerender } = renderHook(() => useEventForm());

    act(() => {
      result.current.editEvent(weeklyEvent);
    });
    expect(result.current.repeatType).toBe('weekly');

    act(() => {
      result.current.editEvent(monthlyEvent);
    });
    expect(result.current.repeatType).toBe('monthly');

    act(() => {
      result.current.editEvent(yearlyEvent);
    });
    expect(result.current.repeatType).toBe('yearly');
  });

  it('resetForm 호출 시 repeatType이 none으로 초기화된다', () => {
    const { result } = renderHook(() => useEventForm());

    act(() => {
      result.current.setRepeatType('daily');
      result.current.setIsRepeating(true);
    });

    expect(result.current.repeatType).toBe('daily');
    expect(result.current.isRepeating).toBe(true);

    act(() => {
      result.current.resetForm();
    });

    expect(result.current.repeatType).toBe('none');
    expect(result.current.isRepeating).toBe(false);
    expect(result.current.repeatInterval).toBe(1);
  });

  it('반복 유형이 none인 이벤트를 로드하면 isRepeating이 false이다', () => {
    const nonRepeatingEvent: Event = {
      id: '5',
      title: '일반 회의',
      date: '2024-01-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const { result } = renderHook(() => useEventForm());

    act(() => {
      result.current.editEvent(nonRepeatingEvent);
    });

    expect(result.current.repeatType).toBe('none');
    expect(result.current.isRepeating).toBe(false);
  });
});
