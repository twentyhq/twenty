import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { expect, expectTypeOf, it, vi } from 'vitest';

import { ThemeProvider } from '@ui/theme/ThemeProvider';

import { Tag } from '../Tag';
import styles from '../Tag.module.scss';

runComponentConformance({
  name: 'Tag',
  element: <Tag color="blue">Label</Tag>,
  ownClassName: styles.tag,
  refInstanceOf: HTMLSpanElement,
});

it('keeps its presentational root when native handlers are provided', async () => {
  const ref = createRef<HTMLSpanElement>();
  const handleClick = vi.fn();
  render(
    <ThemeProvider colorScheme="light">
      <Tag color="blue" ref={ref} onClick={handleClick} title="Category">
        Customer
      </Tag>
    </ThemeProvider>,
  );

  expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  expect(ref.current).toHaveAttribute('title', 'Category');
  expect(ref.current).not.toHaveAttribute('role');
  expect(ref.current).not.toHaveAttribute('tabindex');
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
  await userEvent.click(screen.getByText('Customer'));
  expect(handleClick).toHaveBeenCalledOnce();
});

it('lets a native button owner receive attributes, refs, keyboard activation and disabled state', async () => {
  const user = userEvent.setup();
  const ref = createRef<HTMLButtonElement>();
  const handleClick = vi.fn();
  const compose = (disabled: boolean) => (
    <ThemeProvider colorScheme="light">
      <Tag
        color="blue"
        render={
          <button
            ref={ref}
            type="button"
            name="category"
            disabled={disabled}
            onClick={(event) => {
              expectTypeOf(event.currentTarget).toEqualTypeOf<
                EventTarget & HTMLButtonElement
              >();
              handleClick(event.currentTarget.name);
            }}
          />
        }
      >
        Customer
      </Tag>
    </ThemeProvider>
  );
  const { rerender } = render(compose(true));
  const button = screen.getByRole('button', { name: 'Customer' });

  expect(ref.current).toBe(button);
  expect(button).toBeDisabled();
  await user.click(button);
  expect(handleClick).not.toHaveBeenCalled();

  rerender(compose(false));
  await user.tab();
  expect(button).toHaveFocus();
  await user.keyboard('{Enter} ');
  expect(handleClick).toHaveBeenCalledTimes(2);
  expect(handleClick).toHaveBeenLastCalledWith('category');
});

it('preserves caller-owned link nodes and URL strings', () => {
  render(
    <ThemeProvider colorScheme="light">
      <Tag color="blue">
        <a href="#account">Account</a>
      </Tag>
      <Tag color="blue" truncate={false}>
        https://twenty.com
      </Tag>
    </ThemeProvider>,
  );

  expect(screen.getByRole('link', { name: 'Account' })).toHaveAttribute(
    'href',
    '#account',
  );
  expect(screen.getAllByRole('link')).toHaveLength(1);
  expect(screen.getByText('https://twenty.com')).toBeVisible();
});
