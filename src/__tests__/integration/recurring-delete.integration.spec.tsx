import { screen, within } from '@testing-library/react';
import { vi } from 'vitest';

import App from '../../App';
import { setupMockHandlerCreation } from '../../__mocks__/handlersUtils';
import { render } from '@testing-library/react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import { userEvent } from '@testing-library/user-event';
import { ReactElement } from 'react';

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

describe('반복 일정 삭제 (단일 vs 전체)', () => {
  it('단일 삭제(예): 기준 날짜 인스턴스만 사라지고 리스트는 유지된다 (RED)', async () => {
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
    expect(within(dayCell).getByText('반복 회의')).toBeInTheDocument();

    // 삭제 트리거
    const eventList = screen.getByTestId('event-list');
    await user.click(within(eventList).getByLabelText('Delete event'));

    // 확인 다이얼로그
    expect(screen.getByText('해당 일정만 삭제하시겠어요?')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '예' }));

    // 기준 날짜 인스턴스만 사라짐, 리스트는 유지
    const monthViewAfter = screen.getByTestId('month-view');
    const dayCellAfter = within(monthViewAfter).getByText('2').closest('td')!;
    expect(within(dayCellAfter).queryByText('반복 회의')).toBeNull();
    expect(within(eventList).getByText('반복 회의')).toBeInTheDocument();
  });

  it('전체 삭제(아니오): 시리즈 전체가 삭제되고 리스트에서도 사라진다 (RED)', async () => {
    vi.setSystemTime(new Date('2025-10-01'));

    setupMockHandlerCreation([
      {
        id: 'r2',
        title: '반복 세미나',
        date: '2025-10-02',
        startTime: '11:00',
        endTime: '12:00',
        description: '주간 반복',
        location: 'B',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    const monthView = screen.getByTestId('month-view');
    const dayCell = within(monthView).getByText('2').closest('td')!;
    expect(within(dayCell).getByText('반복 세미나')).toBeInTheDocument();

    const eventList = screen.getByTestId('event-list');
    await user.click(within(eventList).getByLabelText('Delete event'));

    expect(screen.getByText('해당 일정만 삭제하시겠어요?')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '아니오' }));

    // 리스트/캘린더에서 모두 제거
    const monthViewAfter = screen.getByTestId('month-view');
    const dayCellAfter = within(monthViewAfter).getByText('2').closest('td')!;
    expect(within(dayCellAfter).queryByText('반복 세미나')).toBeNull();
    expect(within(eventList).queryByText('반복 세미나')).toBeNull();
  });
});
