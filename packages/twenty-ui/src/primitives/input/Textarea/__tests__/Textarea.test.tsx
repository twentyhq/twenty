import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { isFunction } from '@sniptt/guards';
import { createRef } from 'react';
import { expectTypeOf, vi } from 'vitest';

import { Field } from '@ui/primitives/input/Field/Field';
import { type InputProps } from '@ui/primitives/input/Input/types/InputProps';

import { type TextareaProps } from '../types/TextareaProps';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { Textarea } from '../Textarea';
import styles from '../Textarea.module.scss';

runComponentConformance({
  name: 'Textarea',
  element: <Textarea />,
  refInstanceOf: HTMLTextAreaElement,
  ownClassName: styles.textarea,
  renderPropTagName: 'textarea',
});

describe('Textarea native integration', () => {
  it('types input and textarea native events and attributes separately', () => {
    expectTypeOf<NonNullable<InputProps['onChange']>>()
      .parameter(0)
      .toHaveProperty('currentTarget')
      .toEqualTypeOf<EventTarget & HTMLInputElement>();
    expectTypeOf<NonNullable<TextareaProps['onChange']>>()
      .parameter(0)
      .toHaveProperty('currentTarget')
      .toEqualTypeOf<EventTarget & HTMLTextAreaElement>();
    expectTypeOf<TextareaProps>().not.toHaveProperty('type');
    expectTypeOf<InputProps>().not.toHaveProperty('rows');
    expectTypeOf<TextareaProps['onValueChange']>().toEqualTypeOf<
      InputProps['onValueChange']
    >();
  });

  it('composes native handlers and refs through a textarea render callback', async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLTextAreaElement>();
    const renderRef = createRef<HTMLTextAreaElement>();
    const onValueChange = vi.fn();
    const onChange = vi.fn();
    const onRenderChange = vi.fn();
    render(
      <Field.Root invalid>
        <Textarea
          aria-label="Notes"
          ref={ref}
          onChange={onChange}
          onValueChange={onValueChange}
          render={(props, state) => {
            expectTypeOf(props.ref).toEqualTypeOf<TextareaProps['ref']>();
            return (
              <textarea
                {...props}
                ref={(node) => {
                  renderRef.current = node;
                  if (isFunction(props.ref)) return props.ref(node);
                }}
                data-field-invalid={state.valid === false}
                onChange={(event) => {
                  onRenderChange(event.currentTarget);
                  props.onChange?.(event);
                }}
              />
            );
          }}
        />
      </Field.Root>,
    );
    const textarea = screen.getByRole('textbox', { name: 'Notes' });
    await user.type(textarea, 'a{enter}b');
    expect(ref.current).toBe(textarea);
    expect(renderRef.current).toBe(textarea);
    expect(textarea).toHaveAttribute('data-field-invalid', 'true');
    expect(onRenderChange).toHaveBeenLastCalledWith(textarea);
    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onValueChange).toHaveBeenCalledTimes(3);
    expect(onValueChange).toHaveBeenLastCalledWith(
      'a\nb',
      expect.objectContaining({
        reason: 'none',
        event: onChange.mock.calls[2]?.[0].nativeEvent,
        cancel: expect.any(Function),
      }),
    );
  });

  it('retains native textarea form and Field behavior', async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLTextAreaElement>();
    render(
      <>
        <form id="notes-form" aria-label="Notes form" />
        <Field.Root name="notes">
          <Field.Label>Notes</Field.Label>
          <Textarea
            form="notes-form"
            ref={ref}
            required
            rows={3}
            maxLength={20}
            defaultValue="Initial notes"
          />
          <Field.Description>Team context</Field.Description>
        </Field.Root>
        <Textarea
          form="notes-form"
          aria-label="Private"
          name="private"
          defaultValue="Excluded"
          disabled
        />
        <Textarea
          form="notes-form"
          aria-label="Reference"
          name="reference"
          defaultValue="Read only"
          readOnly
        />
      </>,
    );
    const form = screen.getByRole<HTMLFormElement>('form', {
      name: 'Notes form',
    });
    const textarea = screen.getByRole('textbox', { name: 'Notes' });
    await user.click(screen.getByText('Notes'));
    expect(textarea).toHaveFocus();
    expect(textarea).toHaveAccessibleDescription('Team context');
    expect(ref.current?.form).toBe(form);
    expect(ref.current?.checkValidity()).toBe(true);
    expect(Object.fromEntries(new FormData(form))).toEqual({
      notes: 'Initial notes',
      reference: 'Read only',
    });
    await user.type(textarea, '{enter}More content');
    expect(ref.current?.value).toHaveLength(20);
    await user.clear(textarea);
    expect(ref.current?.checkValidity()).toBe(false);
    form.reset();
    expect(textarea).toHaveValue('Initial notes');
  });
});

it('preserves native render height and manual resize styles when automatic sizing is off', () => {
  render(
    <Textarea
      aria-label="Manual notes"
      style={{ resize: 'vertical' }}
      render={<textarea style={{ blockSize: 120 }} />}
    />,
  );
  expect(screen.getByRole('textbox', { name: 'Manual notes' })).toHaveStyle({
    blockSize: '120px',
    resize: 'vertical',
  });
});
