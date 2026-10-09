import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { expect, it, vi } from 'vitest';

import { ThemeProvider } from '@ui/theme/ThemeProvider';

import { Status } from '../Status';
import styles from '../Status.module.scss';

runComponentConformance({
  name: 'Status',
  element: <Status color="blue">Label</Status>,
  ownClassName: styles.status,
  refInstanceOf: HTMLSpanElement,
});

it('keeps a presentational span with native handlers and caller-owned content', async () => {
  const ref = createRef<HTMLSpanElement>();
  const handleClick = vi.fn();
  render(
    <ThemeProvider colorScheme="light">
      <Status color="green" ref={ref} onClick={handleClick}>
        <a href="#connection">Connected</a>
      </Status>
    </ThemeProvider>,
  );

  expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  expect(ref.current).not.toHaveAttribute('role');
  expect(ref.current).not.toHaveAttribute('tabindex');
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('link', { name: 'Connected' }));
  expect(handleClick).toHaveBeenCalledOnce();
});

it('supports native link attributes and the root ref through callback composition', async () => {
  const ref = createRef<HTMLSpanElement>();
  const handleClick = vi.fn();
  render(
    <ThemeProvider colorScheme="light">
      <Status
        color="blue"
        ref={ref}
        render={(props) => (
          <a
            {...props}
            href="#connection"
            download="connection.txt"
            onClick={handleClick}
          >
            {props.children}
          </a>
        )}
      >
        Connection details
      </Status>
    </ThemeProvider>,
  );

  const link = screen.getByRole('link', { name: 'Connection details' });
  expect(ref.current).toBe(link);
  expect(link).toHaveAttribute('download', 'connection.txt');
  await userEvent.tab();
  expect(link).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  expect(handleClick).toHaveBeenCalledOnce();
});

it('exposes loading without introducing a live region and preserves caller accessibility overrides', () => {
  const ref = createRef<HTMLSpanElement>();
  const { rerender } = render(
    <ThemeProvider colorScheme="light">
      <Status color="blue" loading ref={ref}>
        Saving
      </Status>
    </ThemeProvider>,
  );

  expect(ref.current).toHaveAttribute('aria-busy', 'true');
  expect(ref.current).not.toHaveAttribute('aria-live');
  expect(ref.current).not.toHaveAttribute('role');
  expect(
    ref.current?.querySelector('[aria-hidden="true"]'),
  ).toBeInTheDocument();
  expect(screen.getByText('Saving')).toBeVisible();

  rerender(
    <ThemeProvider colorScheme="light">
      <Status color="green" ref={ref}>
        Saved
      </Status>
    </ThemeProvider>,
  );
  expect(ref.current).not.toHaveAttribute('aria-busy');
  expect(ref.current?.querySelector('[aria-hidden="true"]')).toBeNull();

  rerender(
    <ThemeProvider colorScheme="light">
      <Status color="blue" loading aria-busy={false} role="status" ref={ref}>
        Syncing
      </Status>
    </ThemeProvider>,
  );
  expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'false');
});
