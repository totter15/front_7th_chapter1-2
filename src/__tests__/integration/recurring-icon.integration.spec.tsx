import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

import { setupMockHandlerCreation } from '../../__mocks__/handlersUtils';
import App from '../../App';

const theme = createTheme();

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

describe('반복 일정 아이콘 표시', () => {
  it('월별 뷰: 반복 이벤트에만 아이콘이 노출된다', async () => {
    vi.setSystemTime(new Date('2025-10-01'));

    setupMockHandlerCreation([
      {
        id: 'r1',
        title: '반복 회의',
        date: '2025-10-02',
        startTime: '09:00',
        endTime: '10:00',
        description: '주간 반복',
        location: 'A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      },
      {
        id: 's1',
        title: '단일 회의',
        date: '2025-10-02',
        startTime: '11:00',
        endTime: '12:00',
        description: '1회성',
        location: 'B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    const monthView = screen.getByTestId('month-view');
    const dayCell = within(monthView).getByText('2').closest('td')!;

    expect(within(dayCell).getByText('반복 회의')).toBeInTheDocument();
    expect(within(dayCell).getByText('단일 회의')).toBeInTheDocument();
    expect(within(dayCell).getAllByLabelText('반복 일정')).toHaveLength(1);
  });

  it('주별 뷰: 반복/비반복 아이콘 분기 동작이 정확하다', async () => {
    vi.setSystemTime(new Date('2025-10-01'));

    setupMockHandlerCreation([
      {
        id: 'r2',
        title: '주반복 스탠드업',
        date: '2025-10-02',
        startTime: '09:00',
        endTime: '09:30',
        description: '팀 스탠드업',
        location: 'A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      },
      {
        id: 's2',
        title: '일회성 공지',
        date: '2025-10-02',
        startTime: '10:00',
        endTime: '10:30',
        description: '공지',
        location: 'B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    const weekView = screen.getByTestId('week-view');
    const dayCell = within(weekView).getByText('2').closest('td')!;

    expect(within(dayCell).getByText('주반복 스탠드업')).toBeInTheDocument();
    expect(within(dayCell).getByText('일회성 공지')).toBeInTheDocument();
    expect(within(dayCell).getAllByLabelText('반복 일정')).toHaveLength(1);
  });

  it('겹치는 이벤트에서도 반복 아이콘 노출 상태가 유지된다', async () => {
    vi.setSystemTime(new Date('2025-10-01'));

    setupMockHandlerCreation([
      {
        id: 'r3',
        title: '겹침 반복 A',
        date: '2025-10-03',
        startTime: '09:00',
        endTime: '10:00',
        description: 'A',
        location: 'A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      },
      {
        id: 's3',
        title: '겹침 단일 B',
        date: '2025-10-03',
        startTime: '09:30',
        endTime: '10:30',
        description: 'B',
        location: 'B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    const monthView = screen.getByTestId('month-view');
    const dayCell = within(monthView).getByText('3').closest('td')!;

    expect(within(dayCell).getByText('겹침 반복 A')).toBeInTheDocument();
    expect(within(dayCell).getByText('겹침 단일 B')).toBeInTheDocument();
    expect(within(dayCell).getAllByLabelText('반복 일정')).toHaveLength(1);
  });

  it('접근성: 반복 아이콘은 aria-label과 title을 제공한다', async () => {
    vi.setSystemTime(new Date('2025-10-01'));

    setupMockHandlerCreation([
      {
        id: 'r4',
        title: '접근성 이벤트',
        date: '2025-10-04',
        startTime: '09:00',
        endTime: '10:00',
        description: 'A11y',
        location: 'A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      },
    ]);

    setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    const monthView = screen.getByTestId('month-view');
    const dayCell = within(monthView).getByText('4').closest('td')!;
    const repeatIcon = within(dayCell).getByLabelText('반복 일정');
    expect(repeatIcon).toHaveAttribute('title', '반복 일정');
  });
});
