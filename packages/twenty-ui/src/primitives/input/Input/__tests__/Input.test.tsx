import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { vi } from 'vitest';

import { Field } from '@ui/primitives/input/Field/Field';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { Input } from '../Input';
import styles from '../Input.module.scss';

runComponentConformance({
  name: 'Input',
  element: <Input />,
  refInstanceOf: HTMLInputElement,
  ownClassName: styles.input,
  renderPropTagName: 'input',
});

describe('Input native integration', () => {
  it('retains native events and Base UI value details on the input', async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLInputElement>();
    const onValueChange = vi.fn();
    const onChange = vi.fn();

    render(
      <Input
        ref={ref}
        aria-label="Name"
        onChange={onChange}
        onValueChange={onValueChange}
      />,
    );
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'a');

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith(
      'a',
      expect.objectContaining({
        reason: 'none',
        event: onChange.mock.calls[0]?.[0].nativeEvent,
        cancel: expect.any(Function),
      }),
    );
  });

  it('preserves Field naming, native form validation, submission and reset', async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLInputElement>();
    render(
      <form aria-label="Contact">
        <Field.Root name="email">
          <Field.Label>Email</Field.Label>
          <Input
            ref={ref}
            type="email"
            required
            defaultValue="alex@example.com"
          />
          <Field.Description>Work address</Field.Description>
        </Field.Root>
        <Input
          name="reference"
          aria-label="Reference"
          defaultValue="REF-42"
          readOnly
        />
        <Input
          name="excluded"
          aria-label="Disabled"
          defaultValue="locked"
          disabled
        />
      </form>,
    );
    const form = screen.getByRole<HTMLFormElement>('form', { name: 'Contact' });
    const input = screen.getByRole('textbox', { name: 'Email' });
    await user.click(screen.getByText('Email'));
    expect(input).toHaveFocus();
    expect(input).toHaveAccessibleDescription('Work address');
    expect(ref.current?.checkValidity()).toBe(true);
    expect(Object.fromEntries(new FormData(form))).toEqual({
      email: 'alex@example.com',
      reference: 'REF-42',
    });
    await user.clear(input);
    expect(ref.current?.checkValidity()).toBe(false);
    form.reset();
    expect(input).toHaveValue('alex@example.com');
  });
});
