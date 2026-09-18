import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@ui/theme-constants';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';

import { FloatingButton } from '../FloatingButton';

it('uses a host router link supplied through render', async () => {
  const user = userEvent.setup();

  render(
    <ThemeProvider colorScheme="light">
      <MemoryRouter>
        <Routes>
          <Route
            path="/"
            element={
              <FloatingButton
                title="Open settings"
                href="/settings"
                render={<Link to="/settings" />}
              />
            }
          />
          <Route path="/settings" element={<h1>Settings</h1>} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  );

  await user.click(screen.getByRole('link', { name: 'Open settings' }));
  expect(screen.getByRole('heading', { name: 'Settings' })).toBeVisible();
});

it('prevents navigation and click callbacks for a disabled link', async () => {
  const user = userEvent.setup();
  const onClick = vi.fn();

  render(
    <ThemeProvider colorScheme="light">
      <FloatingButton
        title="Open settings"
        href="/settings"
        onClick={onClick}
        disabled
      />
    </ThemeProvider>,
  );

  const link = screen.getByRole('link', { name: 'Open settings' });
  expect(link).toHaveAttribute('aria-disabled', 'true');
  await user.click(link);
  expect(onClick).not.toHaveBeenCalled();
});
