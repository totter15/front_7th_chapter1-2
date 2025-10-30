import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
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

describe('반복 유형 선택 UI', () => {
  it('체크박스 선택 시 반복 관련 필드가 노출된다', async () => {
    vi.setSystemTime(new Date('2025-10-01'));

    setupMockHandlerCreation([]);

    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    const checkbox = screen.getByLabelText('반복 일정');
    await user.click(checkbox);

    expect(await screen.findByText('반복 유형')).toBeInTheDocument();
    expect(await screen.findByText('반복 간격')).toBeInTheDocument();
    expect(await screen.findByText('반복 종료일')).toBeInTheDocument();
  });
});
