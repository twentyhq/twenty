import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { Tooltip } from '../Tooltip';
import styles from '../Tooltip.module.scss';

const TooltipRootWrapper = ({ children }: { children: ReactNode }) => (
  <Tooltip.Root>{children}</Tooltip.Root>
);

const OpenTooltipWrapper = ({ children }: { children: ReactNode }) => (
  <Tooltip.Root open>{children}</Tooltip.Root>
);

runComponentConformance({
  name: 'Tooltip.Trigger',
  element: <Tooltip.Trigger>Details</Tooltip.Trigger>,
  refInstanceOf: HTMLButtonElement,
  wrapper: TooltipRootWrapper,
  renderPropTagName: 'button',
});

runComponentConformance({
  name: 'Tooltip.Popup',
  element: <Tooltip.Popup />,
  refInstanceOf: HTMLDivElement,
  wrapper: OpenTooltipWrapper,
  ownClassName: styles.popup,
});

runComponentConformance({
  name: 'Tooltip.Content',
  element: <Tooltip.Content>Details</Tooltip.Content>,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.content,
});

runComponentConformance({
  name: 'Tooltip',
  element: (
    <Tooltip content="Details" open>
      <button type="button">Trigger</button>
    </Tooltip>
  ),
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.popup,
});

const ControlledTooltip = () => {
  const [open, setOpen] = useState(false);

  return (
    <Tooltip content="Controlled hint" open={open} onOpenChange={setOpen}>
      <button type="button">Details</button>
    </Tooltip>
  );
};

describe('Tooltip interactions', () => {
  it('can enable an uncontrolled tooltip without changing its state contract', async () => {
    const user = userEvent.setup();
    const consoleError = vi.spyOn(console, 'error');
    const { rerender } = render(
      <Tooltip content="Account details" disabled>
        <button type="button">Account</button>
      </Tooltip>,
    );

    rerender(
      <Tooltip content="Account details">
        <button type="button">Account</button>
      </Tooltip>,
    );
    await user.tab();

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Account details',
    );
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('composes the existing trigger and preserves its handlers', async () => {
    const user = userEvent.setup();
    const onFocus = vi.fn();
    const onClick = vi.fn();
    const { container } = render(
      <Tooltip content="Account details">
        <button type="button" onFocus={onFocus} onClick={onClick}>
          Account
        </button>
      </Tooltip>,
    );

    expect(container.firstElementChild).toBe(screen.getByRole('button'));

    await user.tab();

    expect(onFocus).toHaveBeenCalledOnce();
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Account details',
    );

    await user.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
  });

  it('reports controlled opening and Escape dismissal', async () => {
    const user = userEvent.setup();
    render(<ControlledTooltip />);

    await user.tab();
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Controlled hint',
    );

    await user.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
    expect(screen.getByRole('button')).toHaveFocus();
  });

  it('shares one popup across detached triggers with their own content', async () => {
    const user = userEvent.setup();
    const handle = Tooltip.createHandle<string>();
    render(
      <>
        <Tooltip.Trigger handle={handle} payload="First hint">
          First
        </Tooltip.Trigger>
        <Tooltip.Trigger handle={handle} payload="Second hint">
          Second
        </Tooltip.Trigger>
        <Tooltip.Root handle={handle}>
          {({ payload }) => <Tooltip.Popup>{payload}</Tooltip.Popup>}
        </Tooltip.Root>
      </>,
    );

    await user.tab();
    expect(await screen.findByRole('tooltip')).toHaveTextContent('First hint');

    await user.tab();

    await waitFor(() =>
      expect(screen.getByRole('tooltip')).toHaveTextContent('Second hint'),
    );
    expect(screen.getAllByRole('tooltip')).toHaveLength(1);
  });

  it('suppresses a disabled tooltip without disabling its action', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Tooltip content="Unavailable hint" disabled open>
        <button type="button" onClick={onClick}>
          Action
        </button>
      </Tooltip>,
    );

    await user.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.queryByRole('tooltip')).toBeNull();
  });
});
