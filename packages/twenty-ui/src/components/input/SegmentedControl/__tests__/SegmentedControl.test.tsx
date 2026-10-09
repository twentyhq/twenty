import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { SegmentedControl } from '../SegmentedControl';
import styles from '../SegmentedControl.module.scss';

const OPTIONS = [
  { label: 'Annual', value: 'annual' },
  { label: 'Weekly', value: 'weekly', disabled: true },
  { label: 'Monthly', value: 'monthly' },
];

runComponentConformance({
  name: 'SegmentedControl',
  element: <SegmentedControl aria-label="Billing period" options={OPTIONS} />,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.container,
});

describe('SegmentedControl selection', () => {
  it('keeps one uncontrolled choice and passes cancelable event details', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <SegmentedControl
        aria-label="Billing period"
        defaultValue="annual"
        options={OPTIONS}
        onValueChange={onValueChange}
      />,
    );

    await user.click(screen.getByRole('radio', { name: 'Monthly' }));

    expect(screen.getByRole('radio', { name: 'Monthly' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Annual' })).not.toBeChecked();
    expect(screen.queryByRole('tab')).toBeNull();
    expect(onValueChange).toHaveBeenCalledWith(
      'monthly',
      expect.objectContaining({
        reason: 'none',
        event: expect.any(MouseEvent),
        cancel: expect.any(Function),
      }),
    );
  });

  it('keeps controlled selection until the caller supplies its next value', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(
      <SegmentedControl
        aria-label="Billing period"
        value="annual"
        options={OPTIONS}
        onValueChange={onValueChange}
      />,
    );

    await user.click(screen.getByRole('radio', { name: 'Monthly' }));

    expect(screen.getByRole('radio', { name: 'Annual' })).toBeChecked();
    expect(onValueChange).toHaveBeenCalledWith('monthly', expect.anything());

    rerender(
      <SegmentedControl
        aria-label="Billing period"
        value="monthly"
        options={OPTIONS}
        onValueChange={onValueChange}
      />,
    );

    expect(screen.getByRole('radio', { name: 'Monthly' })).toBeChecked();
  });

  it('lets the caller cancel an uncontrolled selection', async () => {
    const user = userEvent.setup();

    render(
      <SegmentedControl
        aria-label="Billing period"
        defaultValue="annual"
        options={OPTIONS}
        onValueChange={(_value, eventDetails) => eventDetails.cancel()}
      />,
    );

    await user.click(screen.getByRole('radio', { name: 'Monthly' }));

    expect(screen.getByRole('radio', { name: 'Annual' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Monthly' })).not.toBeChecked();
  });
});
