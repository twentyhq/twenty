import { render, screen, waitFor, within } from '@testing-library/react';
import { type ReactNode } from 'react';

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
  it('renders a named and described dialog in the body', () => {
    const { container } = render(<PopoverExample open />);
    const trigger = screen.getByRole('button', { name: 'Open' });
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

  it('supports defaultOpen', () => {
    render(<PopoverExample defaultOpen />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
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
});
