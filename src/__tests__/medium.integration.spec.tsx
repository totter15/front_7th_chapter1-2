import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within, act } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';

const theme = createTheme();

// ! Hard 여기 제공 안함
const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return {
    ...render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>{element}</SnackbarProvider>
      </ThemeProvider>
    ),
    user,
  };
};

// ! Hard 여기 제공 안함
const saveSchedule = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime' | 'repeat'>
) => {
  const { title, date, startTime, endTime, location, description, category } = form;

  await user.click(screen.getAllByText('일정 추가')[0]);

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.click(screen.getByLabelText('카테고리'));
  await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
  await user.click(screen.getByRole('option', { name: `${category}-option` }));

  await user.click(screen.getByTestId('event-submit-button'));
};

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
    expect(eventList.getByText('2025-10-15')).toBeInTheDocument();
    expect(eventList.getByText('14:00 - 15:00')).toBeInTheDocument();
    expect(eventList.getByText('프로젝트 진행 상황 논의')).toBeInTheDocument();
    expect(eventList.getByText('회의실 A')).toBeInTheDocument();
    expect(eventList.getByText('카테고리: 업무')).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    const { user } = setup(<App />);

    setupMockHandlerUpdating();

    await user.click(await screen.findByLabelText('Edit event'));

    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '수정된 회의');
    await user.clear(screen.getByLabelText('설명'));
    await user.type(screen.getByLabelText('설명'), '회의 내용 변경');

    await user.click(screen.getByTestId('event-submit-button'));

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('수정된 회의')).toBeInTheDocument();
    expect(eventList.getByText('회의 내용 변경')).toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion();

    const { user } = setup(<App />);
    const eventList = within(screen.getByTestId('event-list'));
    expect(await eventList.findByText('삭제할 이벤트')).toBeInTheDocument();

    // 삭제 버튼 클릭
    const allDeleteButton = await screen.findAllByLabelText('Delete event');
    await user.click(allDeleteButton[0]);

    expect(eventList.queryByText('삭제할 이벤트')).not.toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    // ! 현재 시스템 시간 2025-10-01
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    // ! 일정 로딩 완료 후 테스트
    await screen.findByText('일정 로딩 완료!');

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);
    await saveSchedule(user, {
      title: '이번주 팀 회의',
      date: '2025-10-02',
      startTime: '09:00',
      endTime: '10:00',
      description: '이번주 팀 회의입니다.',
      location: '회의실 A',
      category: '업무',
    });

    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    const weekView = within(screen.getByTestId('week-view'));
    expect(weekView.getByText('이번주 팀 회의')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    vi.setSystemTime(new Date('2025-01-01'));
    setupMockHandlerCreation();

    setup(<App />);

    // ! 일정 로딩 완료 후 테스트
    await screen.findByText('일정 로딩 완료!');

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);
    await saveSchedule(user, {
      title: '이번달 팀 회의',
      date: '2025-10-02',
      startTime: '09:00',
      endTime: '10:00',
      description: '이번달 팀 회의입니다.',
      location: '회의실 A',
      category: '업무',
    });

    const monthView = within(screen.getByTestId('month-view'));
    expect(monthView.getByText('이번달 팀 회의')).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    vi.setSystemTime(new Date('2025-01-01'));
    setup(<App />);

    const monthView = screen.getByTestId('month-view');

    // 1월 1일 셀 확인
    const januaryFirstCell = within(monthView).getByText('1').closest('td')!;
    expect(within(januaryFirstCell).getByText('신정')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({
          events: [
            {
              id: 1,
              title: '팀 회의',
              date: '2025-10-15',
              startTime: '09:00',
              endTime: '10:00',
              description: '주간 팀 미팅',
              location: '회의실 A',
              category: '업무',
              repeat: { type: 'none', interval: 0 },
              notificationTime: 10,
            },
            {
              id: 2,
              title: '프로젝트 계획',
              date: '2025-10-16',
              startTime: '14:00',
              endTime: '15:00',
              description: '새 프로젝트 계획 수립',
              location: '회의실 B',
              category: '업무',
              repeat: { type: 'none', interval: 0 },
              notificationTime: 10,
            },
          ],
        });
      })
    );
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    const { user } = setup(<App />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '존재하지 않는 일정');

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const { user } = setup(<App />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('팀 회의')).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const { user } = setup(<App />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');
    await user.clear(searchInput);

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('팀 회의')).toBeInTheDocument();
    expect(eventList.getByText('프로젝트 계획')).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  afterEach(() => {
    server.resetHandlers();
  });

  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '기존 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: '새 회의',
      date: '2025-10-15',
      startTime: '09:30',
      endTime: '10:30',
      description: '설명',
      location: '회의실 A',
      category: '업무',
    });

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    expect(screen.getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
    expect(screen.getByText('기존 회의 (2025-10-15 09:00-10:00)')).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    setupMockHandlerUpdating();

    const { user } = setup(<App />);

    const editButton = (await screen.findAllByLabelText('Edit event'))[1];
    await user.click(editButton);

    // 시간 수정하여 다른 일정과 충돌 발생
    await user.clear(screen.getByLabelText('시작 시간'));
    await user.type(screen.getByLabelText('시작 시간'), '08:30');
    await user.clear(screen.getByLabelText('종료 시간'));
    await user.type(screen.getByLabelText('종료 시간'), '10:30');

    await user.click(screen.getByTestId('event-submit-button'));

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    expect(screen.getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
    expect(screen.getByText('기존 회의 (2025-10-15 09:00-10:00)')).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  vi.setSystemTime(new Date('2025-10-15 08:49:59'));

  setup(<App />);

  // ! 일정 로딩 완료 후 테스트
  await screen.findByText('일정 로딩 완료!');

  expect(screen.queryByText('10분 후 기존 회의 일정이 시작됩니다.')).not.toBeInTheDocument();

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(screen.getByText('10분 후 기존 회의 일정이 시작됩니다.')).toBeInTheDocument();
});

describe('반복 일정 (SC-01)', () => {
  it('TC-01: 사용자가 반복 일정 체크박스를 선택하면 반복 유형 선택 UI가 표시되고 매일/매주/매월/매년 옵션을 선택할 수 있다', async () => {
    const { user } = setup(<App />);

    // 반복 일정 체크박스 클릭
    const repeatCheckbox = screen.getByLabelText('반복 일정');
    await user.click(repeatCheckbox);

    // 반복 유형 드롭다운이 표시되는지 확인
    const repeatTypeSelect = screen.getByLabelText('반복 유형');
    expect(repeatTypeSelect).toBeInTheDocument();

    // 드롭다운 클릭하여 옵션 확인
    await user.click(repeatTypeSelect);
    await user.click(within(repeatTypeSelect).getByRole('combobox'));

    // 매일, 매주, 매월, 매년 옵션이 모두 표시되는지 확인
    expect(screen.getByRole('option', { name: '매일' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '매주' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '매월' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '매년' })).toBeInTheDocument();

    // 매일 옵션 선택
    await user.click(screen.getByRole('option', { name: '매일' }));
    expect(repeatTypeSelect).toHaveTextContent('매일');
  });
});

describe('반복일정 겹침 검사 제외 (SC-05)', () => {
  afterEach(() => {
    server.resetHandlers();
  });

  it('TC-05: 반복일정 생성 시 기존 일정과 겹치더라도 경고 없이 저장된다', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '기존 회의',
        date: '2024-01-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    // 일정 생성 폼 입력
    await user.click(screen.getAllByText('일정 추가')[0]);
    await user.type(screen.getByLabelText('제목'), '반복 회의');
    await user.type(screen.getByLabelText('날짜'), '2024-01-15');
    await user.type(screen.getByLabelText('시작 시간'), '10:00');
    await user.type(screen.getByLabelText('종료 시간'), '11:00');
    await user.type(screen.getByLabelText('설명'), '설명');
    await user.type(screen.getByLabelText('위치'), '회의실 A');
    await user.click(screen.getByLabelText('카테고리'));
    await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '업무-option' }));

    // 반복 일정 체크박스 선택
    await user.click(screen.getByLabelText('반복 일정'));

    // 반복 유형을 매일로 선택
    const repeatTypeSelect = screen.getByLabelText('반복 유형');
    await user.click(repeatTypeSelect);
    await user.click(within(repeatTypeSelect).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '매일' }));

    // 일정 저장
    await user.click(screen.getByTestId('event-submit-button'));

    // 겹침 경고 다이얼로그가 표시되지 않는지 확인
    expect(screen.queryByText('일정 겹침 경고')).not.toBeInTheDocument();

    // 성공 토스트 확인
    expect(await screen.findByText('일정이 추가되었습니다.')).toBeInTheDocument();
  });
});

describe('반복 일정 아이콘 표시 (SC-01 ~ SC-04)', () => {
  afterEach(() => {
    server.resetHandlers();
  });

  // 반복 일정 생성 헬퍼 함수
  const saveRepeatingSchedule = async (
    user: UserEvent,
    form: Omit<Event, 'id' | 'notificationTime'> & { notificationTime?: number },
    repeatType: 'daily' | 'weekly' | 'monthly' | 'yearly'
  ) => {
    const { title, date, startTime, endTime, location, description, category, notificationTime } =
      form;

    await user.click(screen.getAllByText('일정 추가')[0]);

    await user.type(screen.getByLabelText('제목'), title);
    await user.type(screen.getByLabelText('날짜'), date);
    await user.type(screen.getByLabelText('시작 시간'), startTime);
    await user.type(screen.getByLabelText('종료 시간'), endTime);
    await user.type(screen.getByLabelText('설명'), description);
    await user.type(screen.getByLabelText('위치'), location);
    await user.click(screen.getByLabelText('카테고리'));
    await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: `${category}-option` }));

    // 알림 시간 설정 (선택적)
    if (notificationTime !== undefined) {
      const notificationSelect = screen.getByLabelText('알림 설정');
      await user.click(notificationSelect);
      await user.click(within(notificationSelect).getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: `${notificationTime}분 전` }));
    }

    // 반복 일정 체크박스 선택
    await user.click(screen.getByLabelText('반복 일정'));

    // 반복 유형 선택
    const repeatTypeSelect = screen.getByLabelText('반복 유형');
    await user.click(repeatTypeSelect);
    await user.click(within(repeatTypeSelect).getByRole('combobox'));
    await user.click(
      screen.getByRole('option', {
        name:
          repeatType === 'daily'
            ? '매일'
            : repeatType === 'weekly'
            ? '매주'
            : repeatType === 'monthly'
            ? '매월'
            : '매년',
      })
    );

    await user.click(screen.getByTestId('event-submit-button'));
    await screen.findByText('일정이 추가되었습니다.');
  };

  it('TC-01: 월 뷰에서 반복 일정 아이콘 표시 확인', async () => {
    setupMockHandlerCreation();
    vi.setSystemTime(new Date('2025-10-01'));

    const { user } = setup(<App />);

    await saveRepeatingSchedule(
      user,
      {
        title: '매주 팀 회의',
        date: '2025-10-02',
        startTime: '09:00',
        endTime: '10:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
      },
      'weekly'
    );

    const monthView = within(screen.getByTestId('month-view'));
    // 2025-10-02는 목요일이므로 2일 셀을 찾습니다
    const dayCell = monthView.getByText('2').closest('td')!;
    const eventTitle = within(dayCell).getByText('매주 팀 회의');

    // 반복 아이콘이 표시되는지 확인 (aria-label="반복 일정" 또는 data-testid 사용)
    const eventContainer = eventTitle.closest('div[class*="Box"]') || eventTitle.closest('div');
    expect(eventContainer).toBeInTheDocument();

    // 반복 아이콘 검증 - 구현 후 aria-label이나 역할로 검증
    const repeatIcon = within(eventContainer as HTMLElement).queryByLabelText('반복 일정');
    expect(repeatIcon).toBeInTheDocument();
  });

  it('TC-02: 주 뷰에서 반복 일정 아이콘 표시 확인', async () => {
    setupMockHandlerCreation();
    vi.setSystemTime(new Date('2025-10-01'));

    const { user } = setup(<App />);

    await saveRepeatingSchedule(
      user,
      {
        title: '매일 아침 회의',
        date: '2025-10-02',
        startTime: '09:00',
        endTime: '09:30',
        description: '데일리 스탠드업',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'daily', interval: 1 },
      },
      'daily'
    );

    // 주 뷰로 전환
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    const weekView = within(screen.getByTestId('week-view'));
    // 2025-10-02는 목요일이므로 2일 셀을 찾습니다
    const dayCell = weekView.getByText('2').closest('td')!;
    const eventTitle = within(dayCell).getByText('매일 아침 회의');

    // 반복 아이콘이 표시되는지 확인
    const eventContainer = eventTitle.closest('div[class*="Box"]') || eventTitle.closest('div');
    expect(eventContainer).toBeInTheDocument();

    const repeatIcon = within(eventContainer as HTMLElement).queryByLabelText('반복 일정');
    expect(repeatIcon).toBeInTheDocument();
  });

  it('TC-03: 반복 일정이 아닌 일정에는 아이콘 미표시 확인', async () => {
    setupMockHandlerCreation();
    vi.setSystemTime(new Date('2025-10-01'));

    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: '일반 회의',
      date: '2025-10-02',
      startTime: '09:00',
      endTime: '10:00',
      description: '일반 팀 미팅',
      location: '회의실 A',
      category: '업무',
    });

    const monthView = within(screen.getByTestId('month-view'));
    const eventTitle = monthView.getByText('일반 회의');

    // 반복 아이콘이 표시되지 않는지 확인
    const eventContainer = eventTitle.closest('div[class*="Box"]') || eventTitle.closest('div');
    expect(eventContainer).toBeInTheDocument();

    const repeatIcon = within(eventContainer as HTMLElement).queryByLabelText('반복 일정');
    expect(repeatIcon).not.toBeInTheDocument();
  });

  it('TC-04: 반복 아이콘과 알림 아이콘 동시 표시 확인', async () => {
    setupMockHandlerCreation();
    // 알림이 표시되도록 시간 설정 (notificationTime: 10분 전)
    vi.setSystemTime(new Date('2025-10-02 08:50:00'));

    const { user } = setup(<App />);

    // 반복 일정 생성 (알림 시간 설정 포함)
    await saveRepeatingSchedule(
      user,
      {
        title: '매주 알림 회의',
        date: '2025-10-02',
        startTime: '09:00',
        endTime: '10:00',
        description: '알림이 있는 반복 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      },
      'weekly'
    );

    // 알림이 표시되도록 시간 경과
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const monthView = within(screen.getByTestId('month-view'));
    // 2025-10-02는 목요일이므로 2일 셀을 찾습니다
    const dayCell = monthView.getByText('2').closest('td')!;
    const eventTitle = within(dayCell).getByText('매주 알림 회의');

    // 반복 아이콘과 알림 아이콘이 모두 표시되는지 확인
    const eventContainer = eventTitle.closest('div[class*="Box"]') || eventTitle.closest('div');
    expect(eventContainer).toBeInTheDocument();

    // 반복 아이콘 확인
    const repeatIcon = within(eventContainer as HTMLElement).queryByLabelText('반복 일정');
    expect(repeatIcon).toBeInTheDocument();

    // 알림 아이콘 확인 (Notifications 아이콘)
    // 알림 텍스트로 알림이 표시되었는지 확인
    expect(screen.queryByText(/10분 후.*일정이 시작됩니다/)).toBeInTheDocument();
  });
});

describe('반복 종료일 지정 (SC-01 ~ SC-04)', () => {
  afterEach(() => {
    server.resetHandlers();
  });

  it('TC-01: 반복 종료일 입력 필드 노출 확인', async () => {
    const { user } = setup(<App />);

    // 반복 일정 체크박스 클릭
    await user.click(screen.getByLabelText('반복 일정'));

    // 반복 유형 선택
    const repeatTypeSelect = screen.getByLabelText('반복 유형');
    await user.click(repeatTypeSelect);
    await user.click(within(repeatTypeSelect).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '매일' }));

    // 반복 종료일 입력 필드가 표시되는지 확인
    const repeatEndDateField = screen.getByLabelText('반복 종료일');
    expect(repeatEndDateField).toBeInTheDocument();
    expect(repeatEndDateField).toHaveAttribute('type', 'date');
  });

  it('TC-02: 반복 종료일 입력 및 상태 저장 확인', async () => {
    const { user } = setup(<App />);

    // 반복 일정 체크박스 선택 및 반복 유형 선택
    await user.click(screen.getByLabelText('반복 일정'));
    const repeatTypeSelect = screen.getByLabelText('반복 유형');
    await user.click(repeatTypeSelect);
    await user.click(within(repeatTypeSelect).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '매일' }));

    // 반복 종료일 입력
    const repeatEndDateField = screen.getByLabelText('반복 종료일');
    await user.type(repeatEndDateField, '2025-12-31');

    // 입력된 날짜가 입력 필드에 표시되는지 확인
    expect(repeatEndDateField).toHaveValue('2025-12-31');
  });

  it('TC-03: 반복 종료일이 저장되는지 확인', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    // 일정 생성 폼 열기
    await user.click(screen.getAllByText('일정 추가')[0]);

    // 기본 일정 정보 입력
    await user.type(screen.getByLabelText('제목'), '반복 일정 테스트');
    await user.type(screen.getByLabelText('날짜'), '2025-10-15');
    await user.type(screen.getByLabelText('시작 시간'), '09:00');
    await user.type(screen.getByLabelText('종료 시간'), '10:00');
    await user.type(screen.getByLabelText('설명'), '설명');
    await user.type(screen.getByLabelText('위치'), '회의실 A');
    await user.click(screen.getByLabelText('카테고리'));
    await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '업무-option' }));

    // 반복 일정 설정
    await user.click(screen.getByLabelText('반복 일정'));
    const repeatTypeSelect = screen.getByLabelText('반복 유형');
    await user.click(repeatTypeSelect);
    await user.click(within(repeatTypeSelect).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '매일' }));

    // 반복 종료일 입력
    const repeatEndDateField = screen.getByLabelText('반복 종료일');
    await user.type(repeatEndDateField, '2025-12-31');

    // 일정 저장
    await user.click(screen.getByTestId('event-submit-button'));

    // 저장 완료 대기
    await screen.findByText('일정이 추가되었습니다.');

    // 저장된 이벤트의 repeat.endDate가 포함되어 있는지 확인
    // 반복 일정이 여러 개 생성되었으므로 첫 번째 일정만 확인
    const eventList = within(screen.getByTestId('event-list'));
    const events = eventList.getAllByText('반복 일정 테스트');
    expect(events.length).toBeGreaterThan(0);
    // 반복 종료일 정보가 표시되는지 확인 (2025-10-15부터 2025-12-31까지 여러 일정 생성)
    const endDateElements = eventList.getAllByText(/종료: 2025-12-31/);
    expect(endDateElements.length).toBeGreaterThan(0);
  });

  it('TC-04: 반복 유형 미선택 시 종료일 필드 미표시 확인', async () => {
    const { user } = setup(<App />);

    // 일정 생성 폼 열기
    await user.click(screen.getAllByText('일정 추가')[0]);

    // 반복 일정 체크박스만 선택 (반복 유형은 선택하지 않음)
    await user.click(screen.getByLabelText('반복 일정'));

    // 반복 종료일 입력 필드가 표시되지 않는지 확인
    const repeatEndDateField = screen.queryByLabelText('반복 종료일');
    expect(repeatEndDateField).not.toBeInTheDocument();
  });
});

describe('반복 일정 생성 (SC-01 ~ SC-05)', () => {
  afterEach(() => {
    server.resetHandlers();
  });

  const setupMockHandlerForRecurringEvents = () => {
    const mockEvents: Event[] = [];
    let eventIdCounter = 1;

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockEvents });
      }),
      http.post('/api/events-list', async ({ request }) => {
        const body = (await request.json()) as { events: Event[] };
        const newEvents = body.events.map((event) => ({
          ...event,
          id: String(eventIdCounter++),
        }));
        mockEvents.push(...newEvents);
        return HttpResponse.json(newEvents, { status: 201 });
      })
    );

    return mockEvents;
  };

  it('TC-06: 반복 일정 생성 통합 테스트 - 매일 반복 일정이 종료일까지 생성된다', async () => {
    const mockEvents = setupMockHandlerForRecurringEvents();

    const { user } = setup(<App />);

    // 일정 생성 폼 열기
    await user.click(screen.getAllByText('일정 추가')[0]);

    // 기본 일정 정보 입력
    await user.type(screen.getByLabelText('제목'), '매일 반복 회의');
    await user.type(screen.getByLabelText('날짜'), '2025-10-15');
    await user.type(screen.getByLabelText('시작 시간'), '09:00');
    await user.type(screen.getByLabelText('종료 시간'), '10:00');
    await user.type(screen.getByLabelText('설명'), '설명');
    await user.type(screen.getByLabelText('위치'), '회의실 A');
    await user.click(screen.getByLabelText('카테고리'));
    await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '업무-option' }));

    // 반복 일정 설정
    await user.click(screen.getByLabelText('반복 일정'));
    const repeatTypeSelect = screen.getByLabelText('반복 유형');
    await user.click(repeatTypeSelect);
    await user.click(within(repeatTypeSelect).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '매일' }));

    // 반복 종료일 입력
    const repeatEndDateField = screen.getByLabelText('반복 종료일');
    await user.type(repeatEndDateField, '2025-10-20');

    // 일정 저장
    await user.click(screen.getByTestId('event-submit-button'));

    // 저장 완료 대기
    await screen.findByText('일정이 추가되었습니다.');

    // 생성된 일정 개수 확인 (2025-10-15부터 2025-10-20까지 6개)
    await screen.findByText('일정 로딩 완료!');

    // 매일 반복 일정이 6개 생성되었는지 확인
    const dailyEvents = mockEvents.filter(
      (event) =>
        event.title === '매일 반복 회의' && event.date >= '2025-10-15' && event.date <= '2025-10-20'
    );
    expect(dailyEvents).toHaveLength(6);

    // 날짜 순서 확인
    const dates = dailyEvents.map((e) => e.date).sort();
    expect(dates).toEqual([
      '2025-10-15',
      '2025-10-16',
      '2025-10-17',
      '2025-10-18',
      '2025-10-19',
      '2025-10-20',
    ]);
  });
});

describe('반복 일정 수정 (SC-01 ~ SC-06)', () => {
  // TC-01: 반복 일정 수정 시 다이얼로그 표시 확인
  it('TC-01: 반복 일정 수정 시 다이얼로그 표시 확인 - 반복 일정 수정 버튼을 클릭하면 수정 방식 선택 다이얼로그가 표시된다', async () => {
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '반복 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '매주 반복 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-11-15' },
        notificationTime: 10,
      },
    ];

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockEvents });
      }),
      http.put('/api/events/:id', async ({ params, request }) => {
        const { id } = params;
        const updatedEvent = (await request.json()) as Event;
        const index = mockEvents.findIndex((event) => event.id === id);
        mockEvents[index] = { ...mockEvents[index], ...updatedEvent };
        return HttpResponse.json(mockEvents[index]);
      })
    );

    const { user } = setup(<App />);

    // 반복 일정이 로드될 때까지 대기
    await screen.findByText('일정 로딩 완료!');

    // 반복 일정의 수정 버튼 클릭
    const editButton = await screen.findByLabelText('Edit event');
    await user.click(editButton);

    // 다이얼로그가 표시되는지 확인
    expect(screen.getByText('반복 일정 수정')).toBeInTheDocument();
    expect(screen.getByText('해당 일정만 수정하시겠어요?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '예' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '아니오' })).toBeInTheDocument();
  });

  // TC-02: '예' 선택 시 단일 일정으로 수정
  it('TC-02: 다이얼로그에서 예를 선택하면 해당 일정만 단일 일정으로 변환되어 수정된다', async () => {
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '반복 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '매주 반복 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-11-15' },
        notificationTime: 10,
      },
    ];

    const capturedRequestBody: { current: Event | null } = { current: null };

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockEvents });
      }),
      http.put('/api/events/:id', async ({ params, request }) => {
        const { id } = params;
        const updatedEvent = (await request.json()) as Event;
        capturedRequestBody.current = updatedEvent;
        const index = mockEvents.findIndex((event) => event.id === id);
        mockEvents[index] = { ...mockEvents[index], ...updatedEvent };
        return HttpResponse.json(mockEvents[index]);
      })
    );

    const { user } = setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    // 반복 일정의 수정 버튼 클릭
    const editButton = await screen.findByLabelText('Edit event');
    await user.click(editButton);

    // 다이얼로그에서 '예' 선택
    const yesButton = screen.getByRole('button', { name: '예' });
    await user.click(yesButton);

    // 일정 수정 폼이 열리고 제목을 수정
    const titleInput = screen.getByLabelText('제목');
    await user.clear(titleInput);
    await user.type(titleInput, '수정된 단일 일정');

    // 일정 수정 버튼 클릭
    await user.click(screen.getByTestId('event-submit-button'));

    // PUT 요청이 호출되었고 repeat.type이 'none'으로 변경되었는지 확인
    await screen.findByText('일정이 수정되었습니다.');
    expect(capturedRequestBody.current).not.toBeNull();
    expect(capturedRequestBody.current?.repeat.type).toBe('none');
  });

  // TC-03: '예' 선택 후 수정된 일정의 반복 아이콘 제거 확인
  it('TC-03: 단일 일정으로 변환 후 저장된 일정에서 반복 아이콘이 사라진다', async () => {
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '반복 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '매주 반복 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-11-15' },
        notificationTime: 10,
      },
    ];

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockEvents });
      }),
      http.put('/api/events/:id', async ({ params, request }) => {
        const { id } = params;
        const updatedEvent = (await request.json()) as Event;
        const index = mockEvents.findIndex((event) => event.id === id);
        mockEvents[index] = { ...mockEvents[index], ...updatedEvent };
        return HttpResponse.json(mockEvents[index]);
      })
    );

    const { user } = setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    // 수정 전 반복 아이콘 확인 (전체 event-list 내에 반복 아이콘이 존재함)
    const eventListBefore = screen.getByTestId('event-list');
    const repeatIconsBefore = within(eventListBefore).queryAllByLabelText('반복 일정');
    expect(repeatIconsBefore.length).toBeGreaterThan(0);

    // 반복 일정의 수정 버튼 클릭
    const editButton = await screen.findByLabelText('Edit event');
    await user.click(editButton);

    // 다이얼로그에서 '예' 선택
    await user.click(screen.getByRole('button', { name: '예' }));

    // 제목 수정
    const titleInput = screen.getByLabelText('제목');
    await user.clear(titleInput);
    await user.type(titleInput, '수정된 단일 일정');

    // 일정 수정
    await user.click(screen.getByTestId('event-submit-button'));

    await screen.findByText('일정이 수정되었습니다.');

    // 수정 후 반복 아이콘이 사라졌는지 확인 (전체 event-list 내에 반복 아이콘이 없어야 함)
    const eventListAfter = screen.getByTestId('event-list');
    const repeatIconsAfter = within(eventListAfter).queryAllByLabelText('반복 일정');
    expect(repeatIconsAfter.length).toBe(0);
  });

  // TC-04: '아니오' 선택 시 전체 시리즈 수정
  it('TC-04: 다이얼로그에서 아니오를 선택하면 반복 설정을 유지한 채로 전체 시리즈가 수정된다', async () => {
    const mockEvents: Array<Event & { baseId?: string }> = [
      {
        id: '1',
        title: '반복 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '매주 반복 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-11-15', id: 'series-1' } as any,
        notificationTime: 10,
        baseId: 'series-1',
      },
    ];

    const capturedRequestBody: { current: Event | null } = { current: null };

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockEvents });
      }),
      http.put('/api/events/:id', async ({ params, request }) => {
        const { id } = params;
        const updatedEvent = (await request.json()) as Event;
        capturedRequestBody.current = updatedEvent;
        const index = mockEvents.findIndex((event) => event.id === id);
        mockEvents[index] = { ...mockEvents[index], ...updatedEvent };
        return HttpResponse.json(mockEvents[index]);
      }),
      http.put('/api/recurring-events/:repeatId', async ({ params, request }) => {
        const { repeatId } = params;
        const updateData = (await request.json()) as Partial<Event>;
        capturedRequestBody.current = updateData as Event;
        // 같은 repeatId를 가진 모든 이벤트 업데이트
        mockEvents.forEach((event, index) => {
          if ((event.repeat as any).id === repeatId) {
            mockEvents[index] = { ...event, ...updateData, repeat: event.repeat };
          }
        });
        return HttpResponse.json(mockEvents.filter((e) => (e.repeat as any).id === repeatId));
      })
    );

    const { user } = setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    // 반복 일정의 수정 버튼 클릭
    const editButton = await screen.findByLabelText('Edit event');
    await user.click(editButton);

    // 다이얼로그에서 '아니오' 선택
    const noButton = screen.getByRole('button', { name: '아니오' });
    await user.click(noButton);

    // 제목 수정
    const titleInput = screen.getByLabelText('제목');
    await user.clear(titleInput);
    await user.type(titleInput, '수정된 전체 시리즈');

    // 일정 수정
    await user.click(screen.getByTestId('event-submit-button'));

    // PUT 요청이 호출되었고 repeat 정보가 유지되었는지 확인
    await screen.findByText('일정이 수정되었습니다.');
    expect(capturedRequestBody.current).not.toBeNull();
    expect(capturedRequestBody.current?.repeat.type).toBe('weekly');
    expect(capturedRequestBody.current?.repeat.interval).toBe(1);
    expect(capturedRequestBody.current?.repeat.endDate).toBe('2025-11-15');
  });

  // TC-05: '아니오' 선택 후 수정된 일정의 반복 아이콘 유지 확인
  it('TC-05: 전체 시리즈 수정 후에도 반복 아이콘이 유지된다', async () => {
    const mockEvents: Array<Event & { baseId?: string }> = [
      {
        id: '1',
        title: '반복 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '매주 반복 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-11-15', id: 'series-1' } as any,
        notificationTime: 10,
        baseId: 'series-1',
      },
    ];

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockEvents });
      }),
      http.put('/api/events/:id', async ({ params, request }) => {
        const { id } = params;
        const updatedEvent = (await request.json()) as Event;
        const index = mockEvents.findIndex((event) => event.id === id);
        mockEvents[index] = { ...mockEvents[index], ...updatedEvent };
        return HttpResponse.json(mockEvents[index]);
      }),
      http.put('/api/recurring-events/:repeatId', async ({ params, request }) => {
        const { repeatId } = params;
        const updateData = (await request.json()) as Partial<Event>;
        // 같은 repeatId를 가진 모든 이벤트 업데이트
        mockEvents.forEach((event, index) => {
          if ((event.repeat as any).id === repeatId) {
            mockEvents[index] = { ...event, ...updateData, repeat: event.repeat };
          }
        });
        return HttpResponse.json(mockEvents.filter((e) => (e.repeat as any).id === repeatId));
      })
    );

    const { user } = setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    // 수정 전 반복 아이콘 확인 (전체 event-list 내에 반복 아이콘이 존재함)
    const eventListBefore = screen.getByTestId('event-list');
    const repeatIconsBefore = within(eventListBefore).queryAllByLabelText('반복 일정');
    expect(repeatIconsBefore.length).toBeGreaterThan(0);

    // 반복 일정의 수정 버튼 클릭
    const editButton = await screen.findByLabelText('Edit event');
    await user.click(editButton);

    // 다이얼로그에서 '아니오' 선택
    await user.click(screen.getByRole('button', { name: '아니오' }));

    // 제목 수정
    const titleInput = screen.getByLabelText('제목');
    await user.clear(titleInput);
    await user.type(titleInput, '수정된 전체 시리즈');

    // 일정 수정
    await user.click(screen.getByTestId('event-submit-button'));

    await screen.findByText('일정이 수정되었습니다.');

    // 수정 후에도 반복 아이콘이 유지되는지 확인 (전체 event-list 내에 반복 아이콘이 여전히 존재함)
    const eventListAfter = screen.getByTestId('event-list');
    const repeatIconsAfter = within(eventListAfter).queryAllByLabelText('반복 일정');
    expect(repeatIconsAfter.length).toBeGreaterThan(0);
  });

  // TC-06: 단일 일정 수정 시 다이얼로그 미표시
  it('TC-06: 단일 일정 수정 시 다이얼로그가 표시되지 않고 바로 수정 모드로 진입한다', async () => {
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '단일 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '단일 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockEvents });
      }),
      http.put('/api/events/:id', async ({ params, request }) => {
        const { id } = params;
        const updatedEvent = (await request.json()) as Event;
        const index = mockEvents.findIndex((event) => event.id === id);
        mockEvents[index] = { ...mockEvents[index], ...updatedEvent };
        return HttpResponse.json(mockEvents[index]);
      })
    );

    const { user } = setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    // 단일 일정의 수정 버튼 클릭
    const editButton = await screen.findByLabelText('Edit event');
    await user.click(editButton);

    // 다이얼로그가 표시되지 않는지 확인
    expect(screen.queryByText('해당 일정만 수정하시겠어요?')).not.toBeInTheDocument();

    // 일정 수정 폼이 바로 열렸는지 확인 (헤더 영역의 Typography를 찾음)
    const headers = screen.getAllByText('일정 수정');
    expect(headers.length).toBeGreaterThan(0);
    expect(screen.getByLabelText('제목')).toHaveValue('단일 회의');
  });
});

describe('반복 일정 삭제 (SC-01 ~ SC-04)', () => {
  // TC-01: 반복 일정 삭제 다이얼로그 표시
  it('TC-01: 반복 일정에서 삭제 버튼 클릭 시 다이얼로그가 표시된다', async () => {
    const mockEvents: Event[] = [
      {
        id: 'r-1',
        title: '반복 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '매주 반복 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-11-15' },
        notificationTime: 10,
      },
    ];

    server.use(http.get('/api/events', () => HttpResponse.json({ events: mockEvents })));

    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    const deleteButtons = await screen.findAllByLabelText('Delete event');
    await user.click(deleteButtons[0]);

    expect(screen.getByText('반복 일정 삭제')).toBeInTheDocument();
    expect(screen.getByText('해당 일정만 삭제하시겠어요?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '예' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '아니오' })).toBeInTheDocument();
  });

  // TC-02: '예' 선택 시 단일 인스턴스 삭제
  it("TC-02: '예' 선택 시 해당 일정만 삭제된다 (다른 시리즈 일정 유지)", async () => {
    // 두 개의 반복 인스턴스를 같은 시리즈로 가정 (동일 baseId라고 가정)
    const mockEvents: Event[] = [
      {
        id: 'r-1',
        title: '반복 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '매주 반복 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-11-15' },
        notificationTime: 10,
      },
      {
        id: 'r-2',
        title: '반복 회의',
        date: '2025-10-22',
        startTime: '09:00',
        endTime: '10:00',
        description: '매주 반복 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-11-15' },
        notificationTime: 10,
      },
    ];

    server.use(
      http.get('/api/events', () => HttpResponse.json({ events: mockEvents })),
      http.delete('/api/events/:id', ({ params }) => {
        const { id } = params as { id: string };
        const idx = mockEvents.findIndex((e) => e.id === id);
        if (idx !== -1) mockEvents.splice(idx, 1);
        return new HttpResponse(null, { status: 204 });
      })
    );

    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    // 삭제 버튼 클릭 → 다이얼로그에서 '예'
    const deleteButtons = await screen.findAllByLabelText('Delete event');
    await user.click(deleteButtons[0]);
    await user.click(screen.getByRole('button', { name: '예' }));

    // 목록에 같은 시리즈의 다른 인스턴스는 남아 있어야 함
    const list = screen.getByTestId('event-list');
    // 남아있는 동일 제목이 최소 1개 이상 존재
    expect(within(list).getAllByText('반복 회의').length).toBeGreaterThan(0);
  });

  // TC-03: '아니오' 선택 시 전체 시리즈 삭제
  it("TC-03: '아니오' 선택 시 전체 시리즈가 삭제된다", async () => {
    // 같은 시리즈 2개를 시드하고 전체 삭제 엔드포인트를 모킹
    const baseId = 'series-1';
    const mockEvents: (Event & { baseId?: string })[] = [
      {
        id: 'r-1',
        title: '반복 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '매주 반복 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-11-15' },
        notificationTime: 10,
        baseId,
      },
      {
        id: 'r-2',
        title: '반복 회의',
        date: '2025-10-22',
        startTime: '09:00',
        endTime: '10:00',
        description: '매주 반복 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-11-15' },
        notificationTime: 10,
        baseId,
      },
    ];

    server.use(
      http.get('/api/events', () => HttpResponse.json({ events: mockEvents })),
      http.delete('/api/recurring-events/:baseId', ({ params }) => {
        const { baseId: bid } = params as { baseId: string };
        for (let i = mockEvents.length - 1; i >= 0; i -= 1) {
          if ((mockEvents[i] as any).baseId === bid) mockEvents.splice(i, 1);
        }
        return new HttpResponse(null, { status: 204 });
      })
    );

    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    // 삭제 버튼 클릭 → '아니오'
    const deleteButtons = await screen.findAllByLabelText('Delete event');
    await user.click(deleteButtons[0]);
    await user.click(screen.getByRole('button', { name: '아니오' }));

    // 동일 시리즈 일정이 모두 제거되어 목록에서 해당 제목이 존재하지 않아야 함
    const list = screen.getByTestId('event-list');
    expect(within(list).queryByText('반복 회의')).not.toBeInTheDocument();
  });

  // TC-04: 단일 일정 삭제 시 다이얼로그 미표시
  it('TC-04: 단일 일정(repeat.type="none")은 다이얼로그 없이 즉시 삭제된다', async () => {
    const mockEvents: Event[] = [
      {
        id: 's-1',
        title: '단일 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '단일',
        location: '회의실',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    server.use(
      http.get('/api/events', () => HttpResponse.json({ events: mockEvents })),
      http.delete('/api/events/:id', ({ params }) => {
        const { id } = params as { id: string };
        const idx = mockEvents.findIndex((e) => e.id === id);
        if (idx !== -1) mockEvents.splice(idx, 1);
        return new HttpResponse(null, { status: 204 });
      })
    );

    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    const deleteButton = await screen.findByLabelText('Delete event');
    await user.click(deleteButton);

    // 다이얼로그 미표시
    expect(screen.queryByText('해당 일정만 삭제하시겠어요?')).not.toBeInTheDocument();

    // 목록에서 해당 제목이 바로 사라지는지 확인 (모킹된 삭제 후 재조회 가정)
    const list = screen.getByTestId('event-list');
    expect(within(list).queryByText('단일 회의')).not.toBeInTheDocument();
  });
});
