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

describe('반복 일정 수정 (단일 vs 전체)', () => {
  it('단일 수정(예): 해당 인스턴스만 단일 일정으로 전환되고 아이콘이 사라진다 (RED)', async () => {
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
    ]);

    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    const monthView = screen.getByTestId('month-view');
    const dayCell = within(monthView).getByText('2').closest('td')!;
    expect(within(dayCell).getAllByLabelText('반복 일정')).toHaveLength(1);

    // 수정 트리거
    const eventList = screen.getByTestId('event-list');
    await user.click(within(eventList).getByLabelText('Edit event'));

    // 확인 다이얼로그 기대(RED)
    expect(await screen.findByText('해당 일정만 수정하시겠어요?')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '예' }));

    // 단일 전환 후 아이콘 제거 기대(RED)
    const monthViewAfter = screen.getByTestId('month-view');
    const dayCellAfter = within(monthViewAfter).getByText('2').closest('td')!;
    expect(within(dayCellAfter).queryByLabelText('반복 일정')).toBeNull();
  });

  it('전체 수정(아니오): 시리즈 전체에 변경이 반영되고 아이콘이 유지된다 (RED)', async () => {
    vi.setSystemTime(new Date('2025-10-01'));

    setupMockHandlerCreation([
      {
        id: 'r2',
        title: '주반복 스탠드업',
        date: '2025-10-03',
        startTime: '09:00',
        endTime: '09:30',
        description: '팀 스탠드업',
        location: 'A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    // 수정 트리거
    const eventList = screen.getByTestId('event-list');
    await user.click(within(eventList).getByLabelText('Edit event'));

    // 확인 다이얼로그 기대(RED)
    expect(await screen.findByText('해당 일정만 수정하시겠어요?')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '아니오' }));

    // 아이콘 유지 기대(RED)
    const monthView = screen.getByTestId('month-view');
    const dayCell = within(monthView).getByText('3').closest('td')!;
    expect(within(dayCell).getAllByLabelText('반복 일정')).toHaveLength(1);
  });
});
