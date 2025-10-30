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

describe('반복 생성 규칙 (TC-02~TC-06)', () => {
  it('TC-02 매일: 기준 시작일 이후 매일 동일 시간 생성', async () => {
    vi.setSystemTime(new Date('2025-01-10T00:00:00Z'));

    setupMockHandlerCreation([
      {
        id: 'd1',
        title: '매일 일정',
        date: '2025-01-10',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'daily', interval: 1 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    const weekView = screen.getByTestId('week-view');
    // 이번 주: 10,11 확인
    expect(within(weekView).getByText('10').closest('td')).toBeTruthy();
    expect(
      within(within(weekView).getByText('10').closest('td')!).getByText('매일 일정')
    ).toBeInTheDocument();
    expect(
      within(within(weekView).getByText('11').closest('td')!).getByText('매일 일정')
    ).toBeInTheDocument();

    // 다음 주로 이동하여 12 확인
    await user.click(screen.getByLabelText('Next'));
    const weekView2 = screen.getByTestId('week-view');
    expect(
      within(within(weekView2).getByText('12').closest('td')!).getByText('매일 일정')
    ).toBeInTheDocument();
  });

  it('TC-03 매주: 기준 시작일의 요일로 매주 생성', async () => {
    vi.setSystemTime(new Date('2025-01-10T00:00:00Z')); // 금요일

    setupMockHandlerCreation([
      {
        id: 'w1',
        title: '주반복 일정',
        date: '2025-01-10',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    const weekView = screen.getByTestId('week-view');
    expect(
      within(within(weekView).getByText('10').closest('td')!).getByText('주반복 일정')
    ).toBeInTheDocument();

    // 다음 주 (17일 금요일)
    await user.click(screen.getByLabelText('Next'));
    const weekView2 = screen.getByTestId('week-view');
    expect(
      within(within(weekView2).getByText('17').closest('td')!).getByText('주반복 일정')
    ).toBeInTheDocument();

    // 다다음 주 (24일 금요일)
    await user.click(screen.getByLabelText('Next'));
    const weekView3 = screen.getByTestId('week-view');
    expect(
      within(within(weekView3).getByText('24').closest('td')!).getByText('주반복 일정')
    ).toBeInTheDocument();
  });

  it('TC-04 매월: 31일 시작은 31일에만 생성(대체 금지)', async () => {
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));

    setupMockHandlerCreation([
      {
        id: 'm31',
        title: '31일 일정',
        date: '2025-01-31',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'monthly', interval: 1 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    // Month view(default)
    const monthViewJan = screen.getByTestId('month-view');
    expect(
      within(within(monthViewJan).getByText('31').closest('td')!).getByText('31일 일정')
    ).toBeInTheDocument();

    // 2월로 이동: 31일이 없으니 28일/29일에도 노출되면 안 됨 (현재는 확장 없어서 어차피 실패 방향 유지)
    await user.click(screen.getByLabelText('Next'));
    const monthViewFeb = screen.getByTestId('month-view');
    const feb28Cell = within(monthViewFeb).getByText('28').closest('td')!;
    expect(within(feb28Cell).queryByText('31일 일정')).not.toBeInTheDocument();

    // 3월 31일에는 다시 보여야 함
    await user.click(screen.getByLabelText('Next'));
    const monthViewMar = screen.getByTestId('month-view');
    expect(
      within(within(monthViewMar).getByText('31').closest('td')!).getByText('31일 일정')
    ).toBeInTheDocument();
  });

  it('TC-05 매년(Leap): 2월 29일 시작은 윤년에만 생성 - 2024 표시', async () => {
    vi.setSystemTime(new Date('2024-02-01T00:00:00Z'));

    setupMockHandlerCreation([
      {
        id: 'y29',
        title: '2/29 일정',
        date: '2024-02-29',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'yearly', interval: 1 },
        notificationTime: 10,
      },
    ]);

    setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    const monthView = screen.getByTestId('month-view');
    expect(
      within(within(monthView).getByText('29').closest('td')!).getByText('2/29 일정')
    ).toBeInTheDocument();
  });

  it('TC-06 겹침 허용: 다른 단일 일정과 겹쳐도 생성됨(다음 주)', async () => {
    vi.setSystemTime(new Date('2025-01-10T00:00:00Z'));

    setupMockHandlerCreation([
      {
        id: 'o1',
        title: '단일 회의(다음주)',
        date: '2025-01-17',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: 'w2',
        title: '주반복 일정(겹침)',
        date: '2025-01-10',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    // 다음 주로 이동하여 17일 금요일 확인: 두 이벤트가 함께 노출되어야 함 (현재 확장 X → 실패 예정)
    await user.click(screen.getByLabelText('Next'));
    const weekView = screen.getByTestId('week-view');
    const cell17 = within(weekView).getByText('17').closest('td')!;
    expect(within(cell17).getByText('단일 회의(다음주)')).toBeInTheDocument();
    expect(within(cell17).getByText('주반복 일정(겹침)')).toBeInTheDocument();
  });
});
