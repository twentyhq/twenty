import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import { Button } from '@ui/primitives/input/Button/Button';

import { Banner } from '../Banner';
import styles from '../Banner.module.scss';

runComponentConformance({
  name: 'Banner',
  element: <Banner>Sync result</Banner>,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.banner,
});

describe('Banner feedback', () => {
  it('keeps status independent from appearance and explicit palette overrides', () => {
    const { rerender } = render(
      <Banner status="error" variant="soft" color="blue" data-testid="feedback">
        Sync failed
      </Banner>,
    );
    const banner = screen.getByTestId('feedback');
    expect(banner).toHaveAttribute('data-status', 'error');
    expect(banner).toHaveAttribute('data-variant', 'soft');
    expect(banner).toHaveAttribute('data-color', 'blue');
    rerender(
      <Banner
        status="success"
        variant="solid"
        color="blue"
        data-testid="feedback"
      >
        Sync finished
      </Banner>,
    );
    expect(banner).toHaveAttribute('data-status', 'success');
    expect(banner).toHaveAttribute('data-variant', 'solid');
    expect(banner).toHaveAttribute('data-color', 'blue');
    rerender(
      <Banner status="success" data-testid="feedback">
        Sync finished
      </Banner>,
    );
    expect(banner).toHaveAttribute('data-color', 'green');
  });

  it('leaves live-region semantics with the caller when feedback changes', () => {
    const { rerender } = render(
      <Banner status="error" data-testid="feedback">
        Sync failed
      </Banner>,
    );
    const banner = screen.getByTestId('feedback');
    expect(banner).not.toHaveAttribute('role');
    expect(banner).not.toHaveAttribute('aria-live');
    rerender(
      <Banner
        status="success"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        data-testid="feedback"
      >
        Sync finished
      </Banner>,
    );
    expect(screen.getByRole('status')).toBe(banner);
    expect(banner).toHaveAttribute('aria-live', 'polite');
    expect(banner).toHaveAttribute('aria-atomic', 'true');
  });

  it('composes node content and actions without taking ownership of activation', async () => {
    const onRetry = vi.fn();
    render(
      <Banner
        icon={<span aria-label="Connection issue" />}
        action={<Button onClick={onRetry}>Retry sync</Button>}
      >
        <a href="/connections">Review connections</a>
      </Banner>,
    );
    expect(
      screen.getByRole('link', { name: 'Review connections' }),
    ).toHaveAttribute('href', '/connections');
    expect(screen.getByLabelText('Connection issue')).toBeInTheDocument();
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
