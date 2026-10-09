import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '@ui/primitives/input/Button/Button';
import { Field } from '@ui/primitives/input/Field/Field';
import { RadioGroup } from '@ui/primitives/input/RadioGroup/RadioGroup';
import { type RadioGroupProps } from '@ui/primitives/input/RadioGroup/types/RadioGroupProps';

import { Radio } from '../Radio';

describe('Radio parts', () => {
  it('preserves distinct root, hidden input and custom indicator refs', async () => {
    const rootRef = createRef<HTMLSpanElement>();
    const inputRef = createRef<HTMLInputElement>();
    const indicatorRef = createRef<HTMLSpanElement>();

    render(
      <RadioGroup aria-label="Number" name="number">
        <Radio.Root
          ref={rootRef}
          inputRef={inputRef}
          value={0}
          aria-label="Zero"
        >
          <Radio.Indicator
            ref={indicatorRef}
            keepMounted
            className={({ checked }) => (checked ? 'selected' : 'unselected')}
            style={({ checked }) => ({ opacity: checked ? 1 : 0.5 })}
            render={(props, state) => (
              <span {...props} data-active={state.checked}>
                {state.checked ? 'Selected' : 'Unselected'}
              </span>
            )}
          />
        </Radio.Root>
      </RadioGroup>,
    );

    const radio = screen.getByRole('radio', { name: 'Zero' });
    expect(rootRef.current).toBe(radio);
    expect(rootRef.current).toBeInstanceOf(HTMLSpanElement);
    expect(inputRef.current).toBeInstanceOf(HTMLInputElement);
    expect(inputRef.current?.type).toBe('radio');
    expect(inputRef.current?.value).toBe('0');
    expect(inputRef.current?.previousElementSibling).toBe(radio);
    expect(indicatorRef.current).toBe(screen.getByText('Unselected'));
    expect(indicatorRef.current).toHaveClass('unselected');
    expect(indicatorRef.current).toHaveStyle({ opacity: '0.5' });

    await userEvent.click(radio);

    expect(radio).toBeChecked();
    expect(inputRef.current).toBeChecked();
    expect(indicatorRef.current).toHaveTextContent('Selected');
    expect(indicatorRef.current).toHaveClass('selected');
    expect(indicatorRef.current).toHaveStyle({ opacity: '1' });
    expect(indicatorRef.current).toHaveAttribute('data-active', 'true');
  });

  it('mounts the indicator for the selected option', async () => {
    render(
      <RadioGroup aria-label="Fruit" defaultValue="apple">
        <Radio.Root value="apple" aria-label="Apple">
          <Radio.Indicator>Apple indicator</Radio.Indicator>
        </Radio.Root>
        <Radio.Root value="cherry" aria-label="Cherry">
          <Radio.Indicator>Cherry indicator</Radio.Indicator>
        </Radio.Root>
      </RadioGroup>,
    );

    expect(screen.getByText('Apple indicator')).toBeVisible();
    expect(screen.queryByText('Cherry indicator')).toBeNull();
    await userEvent.click(screen.getByRole('radio', { name: 'Cherry' }));
    expect(screen.getByText('Cherry indicator')).toBeVisible();
    expect(screen.queryByText('Apple indicator')).toBeNull();
  });

  it('keeps explicit native button composition independent of card appearance', async () => {
    const rootRef = createRef<HTMLButtonElement>();
    const groupRef = createRef<HTMLDivElement>();
    const inputRef = createRef<HTMLInputElement>();
    const onClick = vi.fn();

    render(
      <RadioGroup
        ref={groupRef}
        aria-label="Plan"
        render={<fieldset title="Available plans" />}
      >
        <Radio
          ref={rootRef}
          inputRef={inputRef}
          variant="card"
          value="pro"
          nativeButton
          onClick={onClick}
          render={<button type="button" title="Pro choice" />}
        >
          Pro
        </Radio>
      </RadioGroup>,
    );

    const radio = screen.getByRole('radio', { name: 'Pro' });
    expect(groupRef.current).toBeInstanceOf(HTMLFieldSetElement);
    expect(groupRef.current).toHaveAttribute('title', 'Available plans');
    expect(rootRef.current).toBe(radio);
    expect(rootRef.current).toBeInstanceOf(HTMLButtonElement);
    expect(radio).toHaveAttribute('type', 'button');
    expect(radio).toHaveAttribute('title', 'Pro choice');
    expect(inputRef.current).toBeInstanceOf(HTMLInputElement);

    await userEvent.click(radio);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(radio).toBeChecked();
    expect(inputRef.current).toBeChecked();
  });
});

describe('RadioGroup selection', () => {
  it('preserves numeric uncontrolled values and complete change event details', async () => {
    const onValueChange =
      vi.fn<NonNullable<RadioGroupProps<number>['onValueChange']>>();

    render(
      <RadioGroup
        aria-label="Number"
        defaultValue={0}
        onValueChange={onValueChange}
      >
        <Radio.Root value={0}>Zero</Radio.Root>
        <Radio.Root value={1}>One</Radio.Root>
      </RadioGroup>,
    );

    const one = screen.getByRole('radio', { name: 'One' });
    await userEvent.click(one);
    await userEvent.click(one);

    expect(one).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Zero' })).not.toBeChecked();
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        reason: 'none',
        event: expect.any(MouseEvent),
        cancel: expect.any(Function),
        allowPropagation: expect.any(Function),
        isCanceled: false,
        isPropagationAllowed: false,
        trigger: undefined,
      }),
    );
  });

  it('leaves controlled selection updates to the caller', async () => {
    const onValueChange = vi.fn();
    const inputRef = createRef<HTMLInputElement>();
    const { rerender } = render(
      <RadioGroup aria-label="Number" value={0} onValueChange={onValueChange}>
        <Radio.Root value={0}>Zero</Radio.Root>
        <Radio.Root value={1} inputRef={inputRef}>
          One
        </Radio.Root>
      </RadioGroup>,
    );

    const one = screen.getByRole('radio', { name: 'One' });
    await userEvent.click(one);

    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(one).not.toBeChecked();
    expect(inputRef.current).not.toBeChecked();
    expect(screen.getByRole('radio', { name: 'Zero' })).toBeChecked();

    rerender(
      <RadioGroup aria-label="Number" value={1} onValueChange={onValueChange}>
        <Radio.Root value={0}>Zero</Radio.Root>
        <Radio.Root value={1} inputRef={inputRef}>
          One
        </Radio.Root>
      </RadioGroup>,
    );

    expect(one).toBeChecked();
    expect(inputRef.current).toBeChecked();
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it('allows the caller to cancel a selection change', async () => {
    const onValueChange = vi.fn<
      NonNullable<RadioGroupProps<number>['onValueChange']>
    >((_value, details) => details.cancel());
    const inputRef = createRef<HTMLInputElement>();

    render(
      <RadioGroup
        aria-label="Number"
        defaultValue={0}
        onValueChange={onValueChange}
      >
        <Radio.Root value={0}>Zero</Radio.Root>
        <Radio.Root value={1} inputRef={inputRef}>
          One
        </Radio.Root>
      </RadioGroup>,
    );

    await userEvent.click(screen.getByRole('radio', { name: 'One' }));

    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange.mock.calls[0]?.[1].isCanceled).toBe(true);
    expect(screen.getByRole('radio', { name: 'Zero' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'One' })).not.toBeChecked();
    expect(inputRef.current).not.toBeChecked();
  });
});

describe('RadioGroup form integration', () => {
  it('preserves required validation, external form ownership and successful values', async () => {
    const inputRef = createRef<HTMLInputElement>();
    const onReadOnlyChange = vi.fn();

    render(
      <>
        <form id="preferences" aria-label="Preferences" />
        <RadioGroup form="preferences" name="fruit" aria-label="Fruit" required>
          <Radio.Root value="apple" inputRef={inputRef}>
            Apple
          </Radio.Root>
          <Radio.Root value="cherry">Cherry</Radio.Root>
        </RadioGroup>
        <RadioGroup
          form="preferences"
          name="locked"
          aria-label="Read only preference"
          defaultValue="original"
          readOnly
          onValueChange={onReadOnlyChange}
        >
          <Radio.Root value="original">Original</Radio.Root>
          <Radio.Root value="replacement">Replacement</Radio.Root>
        </RadioGroup>
        <RadioGroup
          form="preferences"
          name="excluded"
          aria-label="Disabled preference"
          defaultValue="disabled"
          disabled
        >
          <Radio.Root value="disabled">Disabled</Radio.Root>
        </RadioGroup>
      </>,
    );

    const form = screen.getByRole<HTMLFormElement>('form', {
      name: 'Preferences',
    });
    expect(inputRef.current?.form).toBe(form);
    expect(form.checkValidity()).toBe(false);
    expect(Object.fromEntries(new FormData(form))).toEqual({
      locked: 'original',
    });

    await userEvent.click(screen.getByRole('radio', { name: 'Apple' }));
    await userEvent.click(screen.getByRole('radio', { name: 'Replacement' }));

    expect(form.checkValidity()).toBe(true);
    expect(screen.getByRole('radio', { name: 'Original' })).toBeChecked();
    expect(onReadOnlyChange).not.toHaveBeenCalled();
    expect(Object.fromEntries(new FormData(form))).toEqual({
      fruit: 'apple',
      locked: 'original',
    });
  });

  it('preserves Field naming and caller-controlled form reset', async () => {
    const ControlledForm = () => {
      const [value, setValue] = useState('apple');

      return (
        <form aria-label="Preferences" onReset={() => setValue('apple')}>
          <Field.Root name="fruit">
            <Field.Label>Fruit</Field.Label>
            <RadioGroup value={value} onValueChange={setValue}>
              <Field.Item>
                <Field.Label>
                  <Radio.Root value="apple" />
                  Apple
                </Field.Label>
              </Field.Item>
              <Field.Item>
                <Field.Label>
                  <Radio.Root value="cherry" />
                  Cherry
                </Field.Label>
              </Field.Item>
            </RadioGroup>
            <Field.Description>Choose one fruit</Field.Description>
          </Field.Root>
          <Button type="reset">Reset</Button>
        </form>
      );
    };

    render(<ControlledForm />);

    const group = screen.getByRole('radiogroup', { name: 'Fruit' });
    const cherry = screen.getByRole('radio', { name: 'Cherry' });
    const form = screen.getByRole<HTMLFormElement>('form', {
      name: 'Preferences',
    });

    expect(group).toHaveAccessibleDescription('Choose one fruit');
    await userEvent.click(screen.getByText('Cherry'));
    expect(cherry).toBeChecked();
    expect(new FormData(form).get('fruit')).toBe('cherry');

    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));

    expect(screen.getByRole('radio', { name: 'Apple' })).toBeChecked();
    expect(cherry).not.toBeChecked();
    expect(new FormData(form).get('fruit')).toBe('apple');
  });
});
