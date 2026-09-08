import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';
import { vi } from 'vitest';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import { ThemeProvider } from '@ui/theme-constants/ThemeProvider';

import { Popover } from '../Popover';
import styles from '../Popover.module.scss';
import { type PopoverPopupProps } from '../types/PopoverPopupProps';
import { type PopoverRootProps } from '../types/PopoverRootProps';

const PopoverRootWrapper = ({ children }: { children: ReactNode }) => (
  <Popover.Root>{children}</Popover.Root>
);
const OpenPopoverWrapper = ({ children }: { children: ReactNode }) => (
  <Popover.Root open>{children}</Popover.Root>
);
const PopoverPopupWrapper = ({ children }: { children: ReactNode }) => (
  <Popover.Root open>
    <Popover.Popup>{children}</Popover.Popup>
  </Popover.Root>
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

const PopoverExample = ({
  popupProps,
  ...props
}: PopoverRootProps & { popupProps?: PopoverPopupProps }) => (
  <>
    <Popover.Root {...props}>
      <Popover.Trigger>Open</Popover.Trigger>
      <Popover.Popup {...popupProps}>
        <Popover.Title>Details</Popover.Title>
        <Popover.Description>More information</Popover.Description>
        <button type="button">First action</button>
        <Popover.Close>Close</Popover.Close>
      </Popover.Popup>
    </Popover.Root>
    <button type="button">Outside</button>
  </>
);

describe('Popover', () => {
  it('opens a named and described dialog in the body from the trigger', async () => {
    const user = userEvent.setup();
    const { container } = render(<PopoverExample />);
    const trigger = screen.getByRole('button', { name: 'Open' });
    await user.click(trigger);
    const dialog = screen.getByRole('dialog', {
      name: 'Details',
      description: 'More information',
    });
    expect(document.body).toContainElement(dialog);
    expect(container).not.toContainElement(dialog);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-controls', dialog.id);
    expect(dialog).toHaveAttribute(
      'aria-labelledby',
      screen.getByRole('heading', { name: 'Details' }).id,
    );
    expect(dialog).toHaveAttribute(
      'aria-describedby',
      screen.getByText('More information').id,
    );
  });

  it.each(['{Enter}', ' '])(
    'opens with %s, focuses the first control and restores focus on Escape',
    async (key) => {
      const user = userEvent.setup();
      render(<PopoverExample />);
      await user.tab();
      const trigger = screen.getByRole('button', { name: 'Open' });
      expect(trigger).toHaveFocus();
      await user.keyboard(key);
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: 'First action' }),
        ).toHaveFocus(),
      );
      await user.keyboard('{Escape}');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      await waitFor(() => expect(trigger).toHaveFocus());
    },
  );

  it('focuses the popup when it has no tabbable content', async () => {
    const user = userEvent.setup();
    render(
      <Popover.Root>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Popup>
          <Popover.Title>Details</Popover.Title>
        </Popover.Popup>
      </Popover.Root>,
    );
    await user.tab();
    await user.keyboard('{Enter}');
    await waitFor(() => expect(screen.getByRole('dialog')).toHaveFocus());
  });

  it.each(['Close', 'Outside'])('closes when clicking %s', async (name) => {
    const user = userEvent.setup();
    render(<PopoverExample />);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(screen.getByRole('button', { name }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('reports controlled changes and waits for the open prop', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <PopoverExample open onOpenChange={onOpenChange} />,
    );
    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(
      false,
      expect.objectContaining({ reason: 'escape-key' }),
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    rerender(<PopoverExample open={false} onOpenChange={onOpenChange} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('supports defaultOpen', () => {
    render(<PopoverExample defaultOpen />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes when tabbing past the last control in a non-modal popup', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<PopoverExample onOpenChange={onOpenChange} />);
    await user.tab();
    await user.keyboard('{Enter}');
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'First action' }),
      ).toHaveFocus(),
    );
    await user.tab();
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
    await user.tab();
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'focus-out' }),
    );
    expect(screen.getByRole('button', { name: 'Outside' })).toHaveFocus();
  });

  it('traps forward and backward tabbing with trap-focus', async () => {
    const user = userEvent.setup();
    render(<PopoverExample modal="trap-focus" />);
    await user.tab();
    await user.keyboard('{Enter}');
    const first = screen.getByRole('button', { name: 'First action' });
    const last = screen.getByRole('button', { name: 'Close' });
    await waitFor(() => expect(first).toHaveFocus());
    await user.tab();
    expect(last).toHaveFocus();
    await user.tab();
    await waitFor(() => expect(first).toHaveFocus());
    await user.tab({ shift: true });
    await waitFor(() => expect(last).toHaveFocus());
  });

  it('portals into an explicit container', () => {
    const portalContainer = document.createElement('div');
    document.body.append(portalContainer);
    try {
      const { unmount } = render(
        <PopoverExample open popupProps={{ container: portalContainer }} />,
      );
      expect(within(portalContainer).getByRole('dialog')).toBeInTheDocument();
      unmount();
    } finally {
      portalContainer.remove();
    }
  });

  it('uses the scoped theme container by default', () => {
    const { container } = render(
      <ThemeProvider colorScheme="dark" applyToRoot={false}>
        <PopoverExample open />
      </ThemeProvider>,
    );
    expect(container).toContainElement(screen.getByRole('dialog'));
  });

  it('exposes placement and renders an arrow only when requested', async () => {
    const { rerender } = render(
      <PopoverExample
        open
        popupProps={{ side: 'top', align: 'end', arrow: true }}
      />,
    );
    const dialog = screen.getByRole('dialog');
    await waitFor(() => expect(dialog).toHaveAttribute('data-side', 'top'));
    expect(dialog).toHaveAttribute('data-align', 'end');
    expect(dialog.querySelectorAll(':scope > [data-side]')).toHaveLength(1);
    rerender(<PopoverExample open />);
    expect(
      screen.getByRole('dialog').querySelectorAll(':scope > [data-side]'),
    ).toHaveLength(0);
  });

  it('keeps a closed popup mounted and hidden when requested', async () => {
    const user = userEvent.setup();
    render(<PopoverExample defaultOpen popupProps={{ keepMounted: true }} />);
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('dialog', { hidden: true })).not.toBeVisible();
  });
});
