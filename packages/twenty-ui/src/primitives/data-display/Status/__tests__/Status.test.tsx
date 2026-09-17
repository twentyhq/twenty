import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { expectTypeOf, it, expect, vi } from 'vitest';

import { ThemeProvider } from '@ui/theme-constants/ThemeProvider';

import { Status } from '../Status';
import styles from '../Status.module.scss';

runComponentConformance({
  name: 'Status',
  element: <Status color="blue">Label</Status>,
  ownClassName: styles.status,
  refInstanceOf: HTMLSpanElement,
});

it('forwards native button props, refs, and click event targets', async () => {
  const buttonRef = createRef<HTMLButtonElement>();
  const handleClick = vi.fn();

  render(
    <ThemeProvider colorScheme="light">
      <Status
        color="blue"
        name="connection"
        type="button"
        ref={buttonRef}
        onClick={(event) => {
          expectTypeOf(event.currentTarget).toEqualTypeOf<
            EventTarget & HTMLButtonElement
          >();
          handleClick(event.currentTarget.name);
        }}
      >
        Connection details
      </Status>
    </ThemeProvider>,
  );

  const button = screen.getByRole('button', { name: 'Connection details' });
  expect(buttonRef.current).toBe(button);
  expect(buttonRef.current).toBeInstanceOf(HTMLButtonElement);
  await userEvent.click(button);
  expect(handleClick).toHaveBeenCalledWith('connection');
});

it('uses an HTMLElement contract for a custom non-native button', async () => {
  const elementRef = createRef<HTMLElement>();
  const handleClick = vi.fn();

  render(
    <ThemeProvider colorScheme="light">
      <Status
        color="blue"
        nativeButton={false}
        render={<div />}
        ref={elementRef}
        onClick={(event) => {
          expectTypeOf(event.currentTarget).toEqualTypeOf<
            EventTarget & HTMLElement
          >();
          handleClick(event.currentTarget.tagName);
        }}
      >
        Custom details
      </Status>
    </ThemeProvider>,
  );

  const button = screen.getByRole('button', { name: 'Custom details' });
  expect(elementRef.current).toBe(button);
  expect(elementRef.current).toBeInstanceOf(HTMLDivElement);
  await userEvent.click(button);
  expect(handleClick).toHaveBeenCalledWith('DIV');
});
