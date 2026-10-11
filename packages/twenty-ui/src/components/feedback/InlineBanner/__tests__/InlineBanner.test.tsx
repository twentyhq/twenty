import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import { Button } from '@ui/primitives/input/Button/Button';

import { InlineBanner } from '../InlineBanner';
import styles from '../InlineBanner.module.scss';

runComponentConformance({
  name: 'InlineBanner',
  element: <InlineBanner layout="compact">Sync result</InlineBanner>,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.banner,
});

describe('InlineBanner composition', () => {
  it('keeps rich content accessible and accepts multiple arbitrary actions', async () => {
    const onRetry = vi.fn();
    render(
      <InlineBanner
        status="error"
        variant="solid"
        color="blue"
        icon={null}
        action={
          <>
            <Button onClick={onRetry}>Retry sync</Button>
            <Button href="/support">Contact support</Button>
          </>
        }
      >
        <a href="/connections">Review connections</a>
      </InlineBanner>,
    );
    const content = screen.getByRole('link', { name: 'Review connections' });
    expect(content).not.toHaveAttribute('tabindex');
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    await userEvent.tab();
    expect(content).toHaveFocus();
    await userEvent.tab();
    await userEvent.keyboard(' ');
    expect(onRetry).toHaveBeenCalledTimes(1);
    await userEvent.tab();
    expect(screen.getByRole('link', { name: 'Contact support' })).toHaveFocus();
  });

  it('renders the default icon with valid SVG dimensions', () => {
    render(<InlineBanner data-testid="feedback">Sync failed</InlineBanner>);
    const icon = screen.getByTestId('feedback').querySelector('svg');

    // A CSS variable is not a valid SVG length, so browsers ignore it and
    // stretch the icon to fill the banner
    expect(icon).toBeInTheDocument();
    expect(icon?.getAttribute('width')).toMatch(/^\d+$/);
    expect(icon?.getAttribute('height')).toMatch(/^\d+$/);
  });

  it('preserves caller-owned announcements across both layouts', () => {
    const { rerender } = render(
      <InlineBanner status="error" data-testid="feedback">
        Sync failed
      </InlineBanner>,
    );
    const banner = screen.getByTestId('feedback');
    expect(banner).not.toHaveAttribute('role');
    expect(banner).not.toHaveAttribute('aria-live');
    expect(screen.getByText('Sync failed')).toHaveAttribute('tabindex', '0');
    rerender(
      <InlineBanner
        layout="compact"
        status="warning"
        color="red"
        role="status"
        aria-live="polite"
        data-testid="feedback"
      >
        Sync paused
      </InlineBanner>,
    );
    expect(screen.getByRole('status')).toBe(banner);
    expect(banner).toHaveAttribute('data-status', 'warning');
    expect(banner).toHaveAttribute('data-color', 'red');
    expect(banner).toHaveAttribute('data-variant', 'soft');
    expect(banner).toHaveAttribute('data-layout', 'compact');
    expect(banner).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('Sync paused')).not.toHaveAttribute('tabindex');
  });
});
