import { EventForm } from '../../types';
// @ts-expect-error - generateRecurringEvents 함수는 구현 단계에서 추가됨
import { generateRecurringEvents } from '../../utils/eventUtils';

describe('generateRecurringEvents', () => {
  const baseEvent: Omit<EventForm, 'repeat'> = {
    title: '반복 일정',
    date: '2025-10-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '설명',
    location: '회의실 A',
    category: '업무',
    notificationTime: 10,
  };

  describe('TC-01: 매일 반복 일정 생성 확인', () => {
    it('반복 유형이 daily인 경우 종료일까지 매일 일정이 생성된다', () => {
      const eventForm: EventForm = {
        ...baseEvent,
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2025-10-20',
        },
      };

      const result = generateRecurringEvents(eventForm);

      expect(result).toHaveLength(6);
      expect(result[0].date).toBe('2025-10-15');
      expect(result[1].date).toBe('2025-10-16');
      expect(result[2].date).toBe('2025-10-17');
      expect(result[3].date).toBe('2025-10-18');
      expect(result[4].date).toBe('2025-10-19');
      expect(result[5].date).toBe('2025-10-20');

      // 각 일정이 기본 이벤트 정보를 포함하는지 확인
      result.forEach((event: EventForm) => {
        expect(event.title).toBe(baseEvent.title);
        expect(event.startTime).toBe(baseEvent.startTime);
        expect(event.endTime).toBe(baseEvent.endTime);
        expect(event.description).toBe(baseEvent.description);
        expect(event.location).toBe(baseEvent.location);
        expect(event.category).toBe(baseEvent.category);
        expect(event.notificationTime).toBe(baseEvent.notificationTime);
      });
    });
  });

  describe('TC-02: 매주 반복 일정 생성 확인', () => {
    it('반복 유형이 weekly인 경우 종료일까지 매주 일정이 생성된다', () => {
      const eventForm: EventForm = {
        ...baseEvent,
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-11-05',
        },
      };

      const result = generateRecurringEvents(eventForm);

      expect(result).toHaveLength(4);
      expect(result[0].date).toBe('2025-10-15');
      expect(result[1].date).toBe('2025-10-22');
      expect(result[2].date).toBe('2025-10-29');
      expect(result[3].date).toBe('2025-11-05');

      // 각 일정이 7일 간격인지 확인
      result.forEach((event: EventForm, index: number) => {
        if (index > 0) {
          const prevDate = new Date(result[index - 1].date);
          const currentDate = new Date(event.date);
          const diffDays = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
          expect(diffDays).toBe(7);
        }
      });
    });
  });

  describe('TC-03: 매월 반복 일정 생성 확인', () => {
    it('반복 유형이 monthly인 경우 종료일까지 매월 일정이 생성된다', () => {
      const eventForm: EventForm = {
        ...baseEvent,
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2025-12-15',
        },
      };

      const result = generateRecurringEvents(eventForm);

      expect(result).toHaveLength(3);
      expect(result[0].date).toBe('2025-10-15');
      expect(result[1].date).toBe('2025-11-15');
      expect(result[2].date).toBe('2025-12-15');
    });
  });

  describe('TC-04: 매년 반복 일정 생성 확인', () => {
    it('반복 유형이 yearly인 경우 종료일까지 매년 일정이 생성된다', () => {
      const eventForm: EventForm = {
        ...baseEvent,
        repeat: {
          type: 'yearly',
          interval: 1,
          endDate: '2027-10-15',
        },
      };

      const result = generateRecurringEvents(eventForm);

      expect(result).toHaveLength(3);
      expect(result[0].date).toBe('2025-10-15');
      expect(result[1].date).toBe('2026-10-15');
      expect(result[2].date).toBe('2027-10-15');
    });
  });

  describe('TC-05: 반복 종료일 이후 일정 미생성 확인', () => {
    it('반복 종료일 이후에는 일정이 생성되지 않는다', () => {
      const eventForm: EventForm = {
        ...baseEvent,
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2025-10-17',
        },
      };

      const result = generateRecurringEvents(eventForm);

      expect(result).toHaveLength(3);
      expect(result[0].date).toBe('2025-10-15');
      expect(result[1].date).toBe('2025-10-16');
      expect(result[2].date).toBe('2025-10-17');

      // 종료일 이후 날짜가 포함되지 않았는지 확인
      const allDates = result.map((e: EventForm) => e.date);
      expect(allDates).not.toContain('2025-10-18');
      expect(allDates).not.toContain('2025-10-19');
    });
  });
});
