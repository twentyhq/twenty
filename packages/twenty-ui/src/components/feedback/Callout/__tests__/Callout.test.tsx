import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { Callout } from '../Callout';
import styles from '../Callout.module.scss';

runComponentConformance({
  name: 'Callout',
  element: <Callout title="Sync result" />,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.container,
});

describe('Callout feedback', () => {
  it('keeps status, soft appearance and an explicit palette independent', () => {
    const { rerender } = render(
      <Callout
        title="Sync failed"
        status="error"
        color="blue"
        data-testid="feedback"
      />,
    );
    const callout = screen.getByTestId('feedback');
    expect(callout).toHaveAttribute('data-status', 'error');
    expect(callout).toHaveAttribute('data-variant', 'soft');
    expect(callout).toHaveAttribute('data-color', 'blue');
    rerender(
      <Callout title="Sync finished" status="success" data-testid="feedback" />,
    );
    expect(callout).toHaveAttribute('data-status', 'success');
    expect(callout).toHaveAttribute('data-color', 'green');
  });

  it('leaves announcement semantics to the caller', () => {
    const { rerender } = render(
      <Callout title="Sync failed" status="error" data-testid="feedback" />,
    );
    const callout = screen.getByTestId('feedback');
    expect(callout).not.toHaveAttribute('role');
    expect(callout).not.toHaveAttribute('aria-live');
    rerender(
      <Callout
        title="Sync finished"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />,
    );
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByRole('status')).toHaveAttribute('aria-atomic', 'true');
  });

  it('preserves zero content and omits empty optional slots', () => {
    const { rerender } = render(
      <Callout
        title="No records"
        icon={null}
        description={0}
        action={false}
        data-testid="feedback"
      />,
    );
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByTestId('feedback').querySelector('svg')).toBeNull();
    expect(
      screen.getByTestId('feedback').querySelector(`.${styles.footer}`),
    ).toBeNull();
    rerender(<Callout title="No records" description="" />);
    expect(screen.queryByText('0')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
