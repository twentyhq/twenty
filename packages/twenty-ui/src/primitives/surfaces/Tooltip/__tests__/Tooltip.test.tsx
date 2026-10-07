import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, type ReactNode, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { Tooltip } from '../Tooltip';
import styles from '../Tooltip.module.scss';
import { type TooltipRootActions } from '../types/TooltipRootActions';

const TooltipRootWrapper = ({ children }: { children: ReactNode }) => (
  <Tooltip.Root>{children}</Tooltip.Root>
);

const OpenTooltipWrapper = ({ children }: { children: ReactNode }) => (
  <Tooltip.Root open>
    <Tooltip.Portal>
      <Tooltip.Positioner>{children}</Tooltip.Positioner>
    </Tooltip.Portal>
  </Tooltip.Root>
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

const PopupWrapper = ({ children }: { children: ReactNode }) => (
  <OpenTooltipWrapper>
    <Tooltip.Popup>{children}</Tooltip.Popup>
  </OpenTooltipWrapper>
);

runComponentConformance({
  name: 'Tooltip.Portal',
  element: <Tooltip.Portal />,
  refInstanceOf: HTMLDivElement,
  wrapper: ({ children }) => <Tooltip.Root open>{children}</Tooltip.Root>,
});

runComponentConformance({
  name: 'Tooltip.Positioner',
  element: <Tooltip.Positioner />,
  refInstanceOf: HTMLDivElement,
  wrapper: ({ children }) => (
    <Tooltip.Root open>
      <Tooltip.Portal>{children}</Tooltip.Portal>
    </Tooltip.Root>
  ),
  ownClassName: styles.positioner,
});

runComponentConformance({
  name: 'Tooltip.Arrow',
  element: <Tooltip.Arrow />,
  refInstanceOf: HTMLDivElement,
  wrapper: PopupWrapper,
  ownClassName: styles.arrow,
});

runComponentConformance({
  name: 'Tooltip.Viewport',
  element: <Tooltip.Viewport>Details</Tooltip.Viewport>,
  refInstanceOf: HTMLDivElement,
  wrapper: PopupWrapper,
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
          {({ payload }) => (
            <Tooltip.Portal>
              <Tooltip.Positioner sideOffset={10} style={{ maxWidth: '300px' }}>
                <Tooltip.Popup>{payload}</Tooltip.Popup>
              </Tooltip.Positioner>
            </Tooltip.Portal>
          )}
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

describe('Tooltip shorthand configuration', () => {
  it('shows a description when its title is empty', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="" description="Account help">
        <button type="button">Account</button>
      </Tooltip>,
    );

    await user.tab();

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Account help',
    );
  });

  it('suppresses empty payloads without disconnecting their triggers', async () => {
    const user = userEvent.setup();
    const handle = Tooltip.createHandle<string>();
    render(
      <>
        <Tooltip.Trigger handle={handle}>Missing</Tooltip.Trigger>
        <Tooltip.Trigger handle={handle} payload="">
          Empty
        </Tooltip.Trigger>
        <Tooltip<string>
          handle={handle}
          content={({ payload }) => payload}
          triggerProps={{ payload: 'Account help' }}
        >
          <button type="button">Account</button>
        </Tooltip>
      </>,
    );

    await user.tab();
    await user.tab();
    await user.tab();
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Account help',
    );

    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Empty' })).toHaveFocus();
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());

    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Missing' })).toHaveFocus();
    expect(screen.queryByRole('tooltip')).toBeNull();

    await user.tab();
    await user.tab();
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Account help',
    );
  });

  it('shows a description when a payload callback returns no title', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip<string>
        content={({ payload }) => payload}
        description="Account help"
      >
        <button type="button">Account</button>
      </Tooltip>,
    );

    await user.tab();

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Account help',
    );
  });

  it('shares typed payloads with detached triggers and exposes imperative actions', async () => {
    const user = userEvent.setup();
    const handle = Tooltip.createHandle<string>();
    const actionsRef = createRef<TooltipRootActions>();
    render(
      <>
        <Tooltip.Trigger handle={handle} payload="Detached hint">
          Detached
        </Tooltip.Trigger>
        <Tooltip<string>
          handle={handle}
          actionsRef={actionsRef}
          content={({ payload }) => payload}
          triggerProps={{ payload: 'Local hint' }}
        >
          <button type="button">Local</button>
        </Tooltip>
      </>,
    );
    await user.tab();
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Detached hint',
    );
    await user.tab();
    await waitFor(() =>
      expect(screen.getByRole('tooltip')).toHaveTextContent('Local hint'),
    );
    expect(handle.isOpen).toBe(true);
    act(() => actionsRef.current?.close());
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
    expect(handle.isOpen).toBe(false);
  });

  it('preserves event details and cancellation in both forms', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn((...changeArguments) => {
      const [, details] = changeArguments;
      details.cancel();
    });
    render(
      <>
        <Tooltip content="Shorthand hint" onOpenChange={onOpenChange}>
          <button type="button">Shorthand</button>
        </Tooltip>
        <Tooltip.Root onOpenChange={onOpenChange}>
          <Tooltip.Trigger>Compound</Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Positioner>
              <Tooltip.Popup>Compound hint</Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip.Root>
      </>,
    );
    await user.tab();
    expect(onOpenChange).toHaveBeenLastCalledWith(
      true,
      expect.objectContaining({
        reason: 'trigger-focus',
        trigger: screen.getByRole('button', { name: 'Shorthand' }),
        event: expect.any(Object),
        cancel: expect.any(Function),
      }),
    );
    await user.tab();
    expect(onOpenChange).toHaveBeenCalledWith(
      true,
      expect.objectContaining({
        reason: 'trigger-focus',
        trigger: screen.getByRole('button', { name: 'Compound' }),
      }),
    );
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('targets native props, render composition and refs at each shorthand part', () => {
    const triggerRef = createRef<HTMLButtonElement>();
    const positionerRef = createRef<HTMLDivElement>();
    const portalRef = createRef<HTMLDivElement>();
    const popupRef = createRef<HTMLDivElement>();
    render(
      <Tooltip
        content="Hint"
        open
        ref={popupRef}
        render={<section />}
        aria-label="Popup"
        triggerProps={{
          ref: triggerRef,
          'aria-label': 'Trigger',
          render: (props) => <button {...props} type="button" />,
        }}
        positionerProps={{
          ref: positionerRef,
          'aria-label': 'Positioner',
          style: { maxWidth: 240 },
        }}
        portalProps={{ ref: portalRef, 'aria-label': 'Portal' }}
      >
        <button type="button">Original</button>
      </Tooltip>,
    );
    expect(triggerRef.current).toBe(screen.getByLabelText('Trigger'));
    expect(positionerRef.current).toBe(screen.getByLabelText('Positioner'));
    expect(positionerRef.current).toHaveStyle({ maxWidth: '240px' });
    expect(portalRef.current).toBe(screen.getByLabelText('Portal'));
    expect(popupRef.current).toBe(screen.getByLabelText('Popup'));
    expect(popupRef.current?.localName).toBe('section');
  });
});
