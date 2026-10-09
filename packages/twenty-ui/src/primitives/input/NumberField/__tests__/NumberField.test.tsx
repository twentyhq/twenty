import { render, screen } from '@testing-library/react';
import { createRef, type ReactNode } from 'react';
import { expect, it } from 'vitest';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import inputStyles from '@ui/primitives/input/Input/Input.module.scss';

import { NumberField } from '../NumberField';
import styles from '../NumberField.module.scss';

const RootWrapper = ({ children }: { children: ReactNode }) => (
  <NumberField.Root defaultValue={1}>{children}</NumberField.Root>
);

runComponentConformance({
  name: 'NumberField.Root',
  element: <NumberField.Root />,
  refInstanceOf: HTMLDivElement,
  renderPropTagName: 'div',
});

runComponentConformance({
  name: 'NumberField.Group',
  element: <NumberField.Group />,
  wrapper: RootWrapper,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.group,
  renderPropTagName: 'div',
});

runComponentConformance({
  name: 'NumberField.Input',
  element: <NumberField.Input aria-label="Quantity" />,
  wrapper: RootWrapper,
  refInstanceOf: HTMLInputElement,
  ownClassName: inputStyles.input,
  renderPropTagName: 'input',
});

runComponentConformance({
  name: 'NumberField.Increment',
  element: <NumberField.Increment aria-label="Increase value" />,
  wrapper: RootWrapper,
  refInstanceOf: HTMLButtonElement,
  ownClassName: styles.button,
  renderPropTagName: 'button',
});

runComponentConformance({
  name: 'NumberField.Decrement',
  element: <NumberField.Decrement aria-label="Decrease value" />,
  wrapper: RootWrapper,
  refInstanceOf: HTMLButtonElement,
  ownClassName: styles.button,
  renderPropTagName: 'button',
});

runComponentConformance({
  name: 'NumberField.ScrubArea',
  element: <NumberField.ScrubArea />,
  wrapper: RootWrapper,
  refInstanceOf: HTMLSpanElement,
});

it('keeps wrapper, visible control and native form refs distinct with live render state', () => {
  const rootRef = createRef<HTMLDivElement>();
  const inputRef = createRef<HTMLInputElement>();
  const hiddenInputRef = createRef<HTMLInputElement>();
  const { rerender } = render(
    <NumberField.Root
      ref={rootRef}
      inputRef={hiddenInputRef}
      value={null}
      name="quantity"
      render={(props, state) => (
        <div {...props} data-quantity={state.value ?? 'empty'} />
      )}
    >
      <NumberField.Input
        ref={inputRef}
        aria-label="Quantity"
        className={(state) =>
          state.value === null ? 'empty-control' : 'filled-control'
        }
      />
    </NumberField.Root>,
  );
  const input = screen.getByRole('textbox', { name: 'Quantity' });

  expect(rootRef.current).toBeInstanceOf(HTMLDivElement);
  expect(rootRef.current).toContainElement(input);
  expect(rootRef.current).toHaveAttribute('data-quantity', 'empty');
  expect(inputRef.current).toBe(input);
  expect(inputRef.current?.type).toBe('text');
  expect(input).toHaveClass('empty-control', inputStyles.input);
  expect(input).toHaveValue('');
  expect(hiddenInputRef.current?.type).toBe('number');
  expect(hiddenInputRef.current?.name).toBe('quantity');
  expect(hiddenInputRef.current).not.toBe(input);

  rerender(
    <NumberField.Root
      ref={rootRef}
      inputRef={hiddenInputRef}
      value={3}
      name="quantity"
    >
      <NumberField.Input ref={inputRef} aria-label="Quantity" />
    </NumberField.Root>,
  );

  expect(inputRef.current).toHaveValue('3');
  expect(hiddenInputRef.current?.value).toBe('3');
});
