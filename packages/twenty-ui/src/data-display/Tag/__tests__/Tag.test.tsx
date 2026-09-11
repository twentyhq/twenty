import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';

import { ThemeProvider } from '@ui/theme-constants/ThemeProvider';

import { Tag } from '../Tag';
import styles from '../Tag.module.scss';

runComponentConformance({
  name: 'Tag',
  element: <Tag color="blue">Label</Tag>,
  ownClassName: styles.tag,
  refInstanceOf: HTMLSpanElement,
});

it('disables a custom button with its own click handler until re-enabled', async () => {
  const user = userEvent.setup();
  const handleClick = vi.fn();
  const { rerender } = render(
    <ThemeProvider colorScheme="light">
      <Tag color="blue" disabled render={<button onClick={handleClick} />}>
        Save
      </Tag>
    </ThemeProvider>,
  );

  const button = screen.getByRole('button', { name: 'Save' });

  await user.click(button);
  expect(handleClick).not.toHaveBeenCalled();
  expect(button).toBeDisabled();

  rerender(
    <ThemeProvider colorScheme="light">
      <Tag color="blue" render={<button onClick={handleClick} />}>
        Save
      </Tag>
    </ThemeProvider>,
  );

  await user.click(button);
  await user.keyboard('{Enter} ');
  expect(handleClick).toHaveBeenCalledTimes(3);
});

it('blocks disabled render-function links without trapping keyboard focus', async () => {
  const user = userEvent.setup();
  const handleClick = vi.fn();
  const handleKeyDown = vi.fn();
  const handleKeyUp = vi.fn();

  render(
    <ThemeProvider colorScheme="light">
      <Tag
        color="blue"
        disabled
        nativeButton={false}
        render={(props) => (
          <a
            {...props}
            href="#details"
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
          >
            {props.children}
          </a>
        )}
      >
        Details
      </Tag>
      <button>Next</button>
    </ThemeProvider>,
  );

  const link = screen.getByRole('link', { name: 'Details' });

  await user.click(link);
  link.focus();
  await user.keyboard('{Enter} ');
  expect(handleClick).not.toHaveBeenCalled();
  expect(handleKeyDown).not.toHaveBeenCalled();
  expect(handleKeyUp).not.toHaveBeenCalled();
  expect(link).toHaveAttribute('aria-disabled', 'true');
  expect(link).toHaveAttribute('tabindex', '-1');

  await user.tab();
  expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus();
});
