import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import { IconHome, IconMoon } from '@ui/icon';

import { SegmentedControl } from '../SegmentedControl';
import styles from '../SegmentedControl.module.scss';

const OPTIONS = [
  { label: 'Annual', value: 'annual' },
  { label: 'Weekly', value: 'weekly', disabled: true },
  { label: 'Monthly', value: 'monthly' },
];

runComponentConformance({
  name: 'SegmentedControl',
  element: <SegmentedControl options={OPTIONS} />,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.container,
});

describe('SegmentedControl', () => {
  it('changes an uncontrolled choice without deselecting it on repeat activation', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <SegmentedControl
        aria-label="Billing period"
        options={OPTIONS}
        defaultValue="annual"
        onValueChange={onValueChange}
      />,
    );

    expect(
      screen.getByRole('radiogroup', { name: 'Billing period' }),
    ).toBeVisible();
    const monthly = screen.getByRole('radio', { name: 'Monthly' });
    await user.click(monthly);
    await user.click(monthly);

    expect(monthly).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Annual' })).not.toBeChecked();
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(
      'monthly',
      expect.anything(),
    );
  });

  it('keeps the controlled selection until its owner applies a change', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(
      <SegmentedControl
        options={OPTIONS}
        value="annual"
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByRole('radio', { name: 'Monthly' }));

    expect(onValueChange).toHaveBeenCalledWith('monthly', expect.anything());
    expect(screen.getByRole('radio', { name: 'Annual' })).toBeChecked();

    rerender(
      <SegmentedControl
        options={OPTIONS}
        value="monthly"
        onValueChange={onValueChange}
      />,
    );
    expect(screen.getByRole('radio', { name: 'Monthly' })).toBeChecked();
  });

  it('prevents disabled options and pending groups from changing the choice', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(
      <SegmentedControl
        options={OPTIONS}
        defaultValue="annual"
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByRole('radio', { name: 'Weekly' }));
    expect(onValueChange).not.toHaveBeenCalled();

    rerender(
      <SegmentedControl
        options={OPTIONS}
        defaultValue="annual"
        onValueChange={onValueChange}
        disabled
      />,
    );
    await user.click(screen.getByRole('radio', { name: 'Monthly' }));
    expect(screen.getByRole('radio', { name: 'Monthly' })).toBeDisabled();
    expect(screen.getByRole('radio', { name: 'Annual' })).toBeChecked();
    expect(onValueChange).not.toHaveBeenCalled();

    rerender(
      <SegmentedControl
        options={OPTIONS}
        defaultValue="annual"
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByRole('radio', { name: 'Monthly' }));
    expect(screen.getByRole('radio', { name: 'Monthly' })).toBeChecked();
  });

  it('names icon-only choices and hides decorative icons', () => {
    render(
      <SegmentedControl
        aria-label="Appearance"
        defaultValue="dark"
        options={[
          { value: 'system', startIcon: <IconHome />, 'aria-label': 'System' },
          { value: 'dark', startIcon: <IconMoon />, 'aria-label': 'Dark' },
        ]}
      />,
    );
    expect(screen.getByRole('radio', { name: 'Dark' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'System' })).not.toBeChecked();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('submits the selected value without submitting on option activation', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <form aria-label="Subscription" onSubmit={onSubmit}>
        <SegmentedControl
          name="interval"
          options={OPTIONS}
          defaultValue="annual"
        />
      </form>,
    );
    await user.click(screen.getByRole('radio', { name: 'Monthly' }));

    const form = screen.getByRole<HTMLFormElement>('form', {
      name: 'Subscription',
    });
    expect(new FormData(form).getAll('interval')).toEqual(['monthly']);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
