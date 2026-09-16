import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { ThemeProvider } from '@ui/theme-constants/ThemeProvider';

import { Button } from '../Button';

describe('Button', () => {
  it('ignores unsupported button attributes when rendered as a link', () => {
    const nativeButtonProps = { formAction: '/submit' };

    render(
      <MemoryRouter>
        <ThemeProvider colorScheme="light">
          <Button
            {...nativeButtonProps}
            to="/contacts"
            title="Contacts"
            ariaLabel="Contacts"
          />
        </ThemeProvider>
      </MemoryRouter>,
    );

    const link = screen.getByRole('link', { name: 'Contacts' });

    expect(link).toHaveAttribute('href', '/contacts');
    expect(link).not.toHaveAttribute('formaction');
  });
});
