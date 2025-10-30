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

describe('반복 종료(특정 날짜까지)', () => {
  it('TC-01: 반복 체크 시 종료일 입력 필드가 노출된다', async () => {
    vi.setSystemTime(new Date('2025-01-01'));

    setupMockHandlerCreation([]);
    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    await user.click(screen.getByLabelText('반복 일정'));

    expect(await screen.findByText('반복 종료일')).toBeInTheDocument();
  });

  it('TC-03: 종료일 상한(2025-12-31)을 초과하면 2026-01월에는 생성되지 않아야 한다(RED)', async () => {
    vi.setSystemTime(new Date('2025-12-01'));

    setupMockHandlerCreation([
      {
        id: 'cap1',
        title: '상한 캡 일정',
        date: '2025-12-30',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2026-01-10' },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    // 12월에는 30/31에 보인다
    const decView = screen.getByTestId('month-view');
    expect(
      within(within(decView).getByText('30').closest('td')!).getByText('상한 캡 일정')
    ).toBeInTheDocument();
    expect(
      within(within(decView).getByText('31').closest('td')!).getByText('상한 캡 일정')
    ).toBeInTheDocument();

    // 1월로 이동 후(현재 구현에서는 보이는 것이지만, 기대는 보이지 않아야 함 → RED)
    await user.click(screen.getByLabelText('Next'));
    const janView = screen.getByTestId('month-view');
    const jan1Cell = within(janView).getByText('1').closest('td')!;
    const jan10Cell = within(janView).getByText('10').closest('td')!;
    expect(within(jan1Cell).queryByText('상한 캡 일정')).not.toBeInTheDocument();
    expect(within(jan10Cell).queryByText('상한 캡 일정')).not.toBeInTheDocument();
  });
});
