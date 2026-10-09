import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { expect, it } from 'vitest';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { Switch } from '../Switch';
import styles from '../Switch.module.scss';

runComponentConformance({
  name: 'Switch.Root',
  element: <Switch.Root aria-label="Notifications" />,
  refInstanceOf: HTMLSpanElement,
  ownClassName: styles.root,
});

runComponentConformance({
  name: 'Switch.Thumb',
  element: <Switch.Thumb />,
  wrapper: ({ children }) => <Switch.Root>{children}</Switch.Root>,
  refInstanceOf: HTMLSpanElement,
  ownClassName: styles.thumb,
});

it('composes a native button and a thumb with state callbacks and refs', async () => {
  const rootRef = createRef<HTMLButtonElement>();
  const thumbRef = createRef<HTMLSpanElement>();
  render(
    <Switch.Root
      ref={rootRef}
      nativeButton
      render={<button />}
      aria-label="Notifications"
    >
      <Switch.Thumb
        ref={thumbRef}
        className={(state) => (state.checked ? 'enabled' : 'disabled')}
        style={(state) => ({ opacity: state.checked ? 1 : 0.5 })}
        render={(props, state) => (
          <span {...props} data-active={state.checked}>
            {state.checked ? 'On' : 'Off'}
          </span>
        )}
      />
    </Switch.Root>,
  );
  expect(rootRef.current).toBe(screen.getByRole('switch'));
  expect(rootRef.current).toBeInstanceOf(HTMLButtonElement);
  expect(thumbRef.current).toBe(screen.getByText('Off'));
  await userEvent.click(screen.getByRole('switch'));
  expect(thumbRef.current).toHaveTextContent('On');
  expect(thumbRef.current).toHaveClass('enabled');
  expect(thumbRef.current).toHaveStyle({ opacity: '1' });
  expect(thumbRef.current).toHaveAttribute('data-active', 'true');
});
