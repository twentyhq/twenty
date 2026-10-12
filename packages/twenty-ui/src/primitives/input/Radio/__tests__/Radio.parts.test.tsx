import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';

import { RadioGroup } from '@ui/primitives/input/RadioGroup/RadioGroup';

import { Radio } from '../Radio';

describe('Radio parts', () => {
  it('preserves distinct root, hidden input and custom indicator refs', () => {
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
  });

  it('mounts the indicator for the selected option', () => {
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
  });

  it('keeps explicit native button composition independent of card appearance', () => {
    const rootRef = createRef<HTMLButtonElement>();
    const groupRef = createRef<HTMLDivElement>();
    const inputRef = createRef<HTMLInputElement>();

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
  });
});
