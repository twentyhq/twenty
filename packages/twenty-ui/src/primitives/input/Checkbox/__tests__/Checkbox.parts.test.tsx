import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import { Field } from '@ui/primitives/input/Field/Field';
import { Switch } from '@ui/primitives/input/Switch/Switch';

import { Checkbox } from '../Checkbox';
import styles from '../Checkbox.module.scss';

runComponentConformance({
  name: 'Checkbox.Root',
  element: <Checkbox.Root aria-label="Selection" />,
  refInstanceOf: HTMLSpanElement,
  ownClassName: styles.root,
});

runComponentConformance({
  name: 'Checkbox.Indicator',
  element: <Checkbox.Indicator />,
  wrapper: ({ children }) => (
    <Checkbox.Root defaultChecked>{children}</Checkbox.Root>
  ),
  refInstanceOf: HTMLSpanElement,
  ownClassName: styles.indicator,
});

describe.each([
  { name: 'Checkbox.Root', Control: Checkbox.Root, role: 'checkbox' },
  { name: 'Switch.Root', Control: Switch.Root, role: 'switch' },
])('$name native behavior', ({ Control, role }) => {
  it('preserves uncontrolled state and click event details', async () => {
    const onCheckedChange = vi.fn();
    render(
      <Control
        aria-label="Preference"
        defaultChecked
        onCheckedChange={onCheckedChange}
      />,
    );
    const control = screen.getByRole(role, { name: 'Preference' });
    await userEvent.click(control);
    expect(control).not.toBeChecked();
    expect(onCheckedChange).toHaveBeenCalledWith(
      false,
      expect.objectContaining({
        event: expect.objectContaining({ type: 'click' }),
        cancel: expect.any(Function),
      }),
    );
    await userEvent.keyboard(' ');
    expect(control).toBeChecked();
  });

  it('leaves controlled updates to the caller', async () => {
    const onCheckedChange = vi.fn();
    const { rerender } = render(
      <Control
        aria-label="Preference"
        checked={false}
        onCheckedChange={onCheckedChange}
      />,
    );
    const control = screen.getByRole(role, { name: 'Preference' });
    await userEvent.click(control);
    expect(onCheckedChange).toHaveBeenCalledTimes(1);
    expect(control).not.toBeChecked();
    rerender(
      <Control
        aria-label="Preference"
        checked
        onCheckedChange={onCheckedChange}
      />,
    );
    expect(control).toBeChecked();
    expect(onCheckedChange).toHaveBeenCalledTimes(1);
  });

  it('allows the caller to cancel a state change', async () => {
    render(
      <Control
        aria-label="Preference"
        onCheckedChange={(_checked, details) => details.cancel()}
      />,
    );
    const control = screen.getByRole(role, { name: 'Preference' });
    await userEvent.click(control);
    expect(control).not.toBeChecked();
  });

  it.each(['disabled', 'readOnly'] as const)(
    'preserves %s interaction',
    async (mode) => {
      const onCheckedChange = vi.fn();
      render(
        <Control
          aria-label="Preference"
          defaultChecked
          {...{ [mode]: true }}
          onCheckedChange={onCheckedChange}
        />,
      );
      const control = screen.getByRole(role, { name: 'Preference' });
      await userEvent.click(control);
      await userEvent.keyboard(' ');
      expect(control).toBeChecked();
      expect(onCheckedChange).not.toHaveBeenCalled();
    },
  );

  it('associates the Field label, description and name', async () => {
    render(
      <form aria-label="Preferences">
        <Field.Root name="preference">
          <Field.Label>
            <Control value="yes" />
            Preference
          </Field.Label>
          <Field.Description>Workspace updates</Field.Description>
        </Field.Root>
      </form>,
    );
    const control = screen.getByRole(role, { name: 'Preference' });
    expect(control).toHaveAccessibleDescription('Workspace updates');
    await userEvent.click(screen.getByText('Preference'));
    expect(control).toBeChecked();
    expect(
      new FormData(
        screen.getByRole<HTMLFormElement>('form', { name: 'Preferences' }),
      ).get('preference'),
    ).toBe('yes');
  });

  it('preserves native values, required validation, external form ownership', async () => {
    const inputRef = createRef<HTMLInputElement>();
    render(
      <>
        <form id="preferences" aria-label="Preferences" />
        <Control
          form="preferences"
          name="updates"
          value="yes"
          uncheckedValue="no"
          required
          inputRef={inputRef}
          aria-label="Updates"
        />
        <Control
          form="preferences"
          name="disabled"
          defaultChecked
          disabled
          aria-label="Disabled"
        />
        <Control form="preferences" defaultChecked aria-label="Unnamed" />
      </>,
    );
    const form = screen.getByRole<HTMLFormElement>('form', {
      name: 'Preferences',
    });
    expect(inputRef.current?.form).toBe(form);
    expect(form.checkValidity()).toBe(false);
    expect([...new FormData(form).entries()]).toEqual([['updates', 'no']]);
    await userEvent.click(screen.getByRole(role, { name: 'Updates' }));
    expect(form.checkValidity()).toBe(true);
    expect([...new FormData(form).entries()]).toEqual([['updates', 'yes']]);
    await userEvent.click(screen.getByRole(role, { name: 'Updates' }));
    expect(form.checkValidity()).toBe(false);
  });
});

it('customizes the indicator with live indeterminate state and both DOM refs', async () => {
  const rootRef = createRef<HTMLSpanElement>();
  const indicatorRef = createRef<HTMLSpanElement>();
  const inputRef = createRef<HTMLInputElement>();
  const { rerender } = render(
    <Checkbox.Root
      ref={rootRef}
      inputRef={inputRef}
      indeterminate
      aria-label="Partial"
    >
      <Checkbox.Indicator
        ref={indicatorRef}
        keepMounted
        render={(props, state) => (
          <span {...props}>
            {state.indeterminate ? 'Partial indicator' : 'Selected indicator'}
          </span>
        )}
      />
    </Checkbox.Root>,
  );
  expect(rootRef.current).toBe(
    screen.getByRole('checkbox', { name: 'Partial' }),
  );
  expect(rootRef.current).toBePartiallyChecked();
  expect(inputRef.current).toBeInstanceOf(HTMLInputElement);
  expect(inputRef.current?.indeterminate).toBe(true);
  expect(indicatorRef.current).toHaveTextContent('Partial indicator');
  rerender(
    <Checkbox.Root aria-label="Partial">
      <Checkbox.Indicator keepMounted>Retained indicator</Checkbox.Indicator>
    </Checkbox.Root>,
  );
  expect(screen.getByText('Retained indicator')).toHaveAttribute(
    'data-unchecked',
  );
  await userEvent.click(screen.getByRole('checkbox', { name: 'Partial' }));
  expect(screen.getByText('Retained indicator')).not.toHaveAttribute(
    'data-unchecked',
  );
});
