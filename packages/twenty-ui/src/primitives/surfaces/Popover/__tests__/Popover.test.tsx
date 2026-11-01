import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ThemeProvider } from '@ui/theme/ThemeProvider';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { Popover } from '../Popover';
import styles from '../Popover.module.scss';

const PopoverRootWrapper = ({ children }: { children: ReactNode }) => (
  <Popover.Root>{children}</Popover.Root>
);
const OpenPopoverWrapper = ({ children }: { children: ReactNode }) => (
  <Popover.Root open>
    <Popover.Portal>
      <Popover.Positioner>{children}</Popover.Positioner>
    </Popover.Portal>
  </Popover.Root>
);
const PopoverPopupWrapper = ({ children }: { children: ReactNode }) => (
  <OpenPopoverWrapper>
    <Popover.Popup>{children}</Popover.Popup>
  </OpenPopoverWrapper>
);

runComponentConformance({
  name: 'Popover.Trigger',
  element: <Popover.Trigger>Open</Popover.Trigger>,
  refInstanceOf: HTMLButtonElement,
  wrapper: PopoverRootWrapper,
  renderPropTagName: 'button',
});
runComponentConformance({
  name: 'Popover.Popup',
  element: <Popover.Popup />,
  refInstanceOf: HTMLDivElement,
  wrapper: OpenPopoverWrapper,
  ownClassName: styles.popup,
});
runComponentConformance({
  name: 'Popover.Title',
  element: <Popover.Title>Title</Popover.Title>,
  refInstanceOf: HTMLHeadingElement,
  wrapper: PopoverPopupWrapper,
  ownClassName: styles.title,
});
runComponentConformance({
  name: 'Popover.Description',
  element: <Popover.Description>Description</Popover.Description>,
  refInstanceOf: HTMLParagraphElement,
  wrapper: PopoverPopupWrapper,
  ownClassName: styles.description,
});
runComponentConformance({
  name: 'Popover.Close',
  element: <Popover.Close>Close</Popover.Close>,
  refInstanceOf: HTMLButtonElement,
  wrapper: PopoverPopupWrapper,
  renderPropTagName: 'button',
});

runComponentConformance({
  name: 'Popover.Portal',
  element: <Popover.Portal />,
  refInstanceOf: HTMLDivElement,
  wrapper: ({ children }) => <Popover.Root open>{children}</Popover.Root>,
});
runComponentConformance({
  name: 'Popover.Positioner',
  element: <Popover.Positioner />,
  refInstanceOf: HTMLDivElement,
  wrapper: ({ children }) => (
    <Popover.Root open>
      <Popover.Portal>{children}</Popover.Portal>
    </Popover.Root>
  ),
  ownClassName: styles.positioner,
});
runComponentConformance({
  name: 'Popover.Arrow',
  element: <Popover.Arrow />,
  refInstanceOf: HTMLDivElement,
  wrapper: PopoverPopupWrapper,
  ownClassName: styles.arrow,
});
runComponentConformance({
  name: 'Popover.Backdrop',
  element: <Popover.Backdrop />,
  refInstanceOf: HTMLDivElement,
  wrapper: ({ children }) => (
    <Popover.Root open>
      <Popover.Portal>{children}</Popover.Portal>
    </Popover.Root>
  ),
});
runComponentConformance({
  name: 'Popover.Viewport',
  element: <Popover.Viewport />,
  refInstanceOf: HTMLDivElement,
  wrapper: PopoverPopupWrapper,
});

describe('Popover portal destinations', () => {
  it('uses the scoped theme when omitted and waits when explicitly null', async () => {
    const content = (container?: HTMLElement | null) => (
      <ThemeProvider colorScheme="dark" applyToRoot={false}>
        <Popover.Root open>
          <Popover.Portal container={container}>
            <Popover.Positioner>
              <Popover.Popup aria-label="Details" />
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
      </ThemeProvider>
    );
    const { container, rerender } = render(content());
    const scope = container.querySelector('.dark');
    expect(scope).toContainElement(await screen.findByRole('dialog'));

    rerender(content(null));
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );

    rerender(content());
    expect(scope).toContainElement(await screen.findByRole('dialog'));
  });

  it('forwards element and ref targets and retargets without a body fallback', async () => {
    const target = document.createElement('div');
    const nextTarget = document.createElement('div');
    document.body.append(target, nextTarget);
    const targetRef = createRef<HTMLDivElement>();
    targetRef.current = nextTarget;
    const content = (container: HTMLElement | typeof targetRef | null) => (
      <Popover.Root open>
        <Popover.Portal container={container}>
          <Popover.Positioner>
            <Popover.Popup aria-label="Details" />
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    );
    const { rerender, unmount } = render(content(target));
    expect(target).toContainElement(await screen.findByRole('dialog'));
    rerender(content(targetRef));
    expect(nextTarget).toContainElement(await screen.findByRole('dialog'));
    expect(target).toBeEmptyDOMElement();
    rerender(content(null));
    await waitFor(() => expect(nextTarget).toBeEmptyDOMElement());
    unmount();
    target.remove();
    nextTarget.remove();
  });

  it('accepts a ShadowRoot without replacing its target', async () => {
    const host = document.createElement('div');
    document.body.append(host);
    const shadowRoot = host.attachShadow({ mode: 'open' });
    const { unmount } = render(
      <Popover.Root open>
        <Popover.Portal container={shadowRoot}>
          <Popover.Positioner>
            <Popover.Popup aria-label="Shadow details" />
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>,
    );
    await waitFor(() =>
      expect(shadowRoot.querySelector('[role="dialog"]')).toHaveAttribute(
        'aria-label',
        'Shadow details',
      ),
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    unmount();
    expect(shadowRoot.childNodes).toHaveLength(0);
    host.remove();
  });
});

describe('Popover root contracts', () => {
  it('preserves typed detached payloads, cancellation and imperative actions', async () => {
    const user = userEvent.setup();
    const handle = Popover.createHandle<{ name: string }>();
    const onOpenChange = vi.fn();
    render(
      <>
        <Popover.Trigger
          handle={handle}
          id="account"
          payload={{ name: 'Alice' }}
        >
          Account
        </Popover.Trigger>
        <Popover.Root
          handle={handle}
          onOpenChange={(open, details) => {
            onOpenChange(open, details);
            if (details.reason === 'close-press') {
              details.cancel();
            }
          }}
        >
          {({ payload }) => (
            <Popover.Portal>
              <Popover.Positioner>
                <Popover.Popup aria-label="Owner">
                  {payload?.name}
                  <Popover.Close>Close</Popover.Close>
                </Popover.Popup>
              </Popover.Positioner>
            </Popover.Portal>
          )}
        </Popover.Root>
        <button onClick={() => handle.close()}>Apply close</button>
      </>,
    );
    await user.click(screen.getByRole('button', { name: 'Account' }));
    expect(await screen.findByRole('dialog')).toHaveTextContent('Alice');
    expect(onOpenChange).toHaveBeenLastCalledWith(
      true,
      expect.objectContaining({
        reason: 'trigger-press',
        trigger: screen.getByRole('button', { name: 'Account' }),
        event: expect.any(Event),
      }),
    );
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Apply close' }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(onOpenChange).toHaveBeenCalledWith(
      false,
      expect.objectContaining({ reason: 'imperative-action' }),
    );
  });
});
