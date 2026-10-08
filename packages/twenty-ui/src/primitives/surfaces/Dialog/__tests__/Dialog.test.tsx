import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, type ReactNode } from 'react';
import { expect, it, vi } from 'vitest';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { DirectionProvider } from '@ui/primitives/layout/DirectionProvider/DirectionProvider';
import styles from '@ui/primitives/surfaces/internal/Dialog.module.scss';
import { Dialog } from '../Dialog';

const DialogRootWrapper = ({ children }: { children: ReactNode }) => (
  <Dialog.Root>{children}</Dialog.Root>
);
const OpenDialogWrapper = ({ children }: { children: ReactNode }) => (
  <Dialog.Root open>{children}</Dialog.Root>
);
const DialogPortalWrapper = ({ children }: { children: ReactNode }) => (
  <Dialog.Root open>
    <Dialog.Portal>{children}</Dialog.Portal>
  </Dialog.Root>
);
const DialogViewportWrapper = ({ children }: { children: ReactNode }) => (
  <Dialog.Root open>
    <Dialog.Portal>
      <Dialog.Viewport>{children}</Dialog.Viewport>
    </Dialog.Portal>
  </Dialog.Root>
);
const DialogPopupWrapper = ({ children }: { children: ReactNode }) => (
  <Dialog.Root open>
    <Dialog.Portal>
      <Dialog.Viewport>
        <Dialog.Popup initialFocus={false}>{children}</Dialog.Popup>
      </Dialog.Viewport>
    </Dialog.Portal>
  </Dialog.Root>
);

runComponentConformance({
  name: 'Dialog.Trigger',
  element: <Dialog.Trigger>Open</Dialog.Trigger>,
  refInstanceOf: HTMLButtonElement,
  wrapper: DialogRootWrapper,
  renderPropTagName: 'button',
});
runComponentConformance({
  name: 'Dialog.Portal',
  element: <Dialog.Portal />,
  refInstanceOf: HTMLDivElement,
  wrapper: OpenDialogWrapper,
});
runComponentConformance({
  name: 'Dialog.Backdrop',
  element: <Dialog.Backdrop />,
  refInstanceOf: HTMLDivElement,
  wrapper: DialogPortalWrapper,
  ownClassName: styles.backdrop,
});
runComponentConformance({
  name: 'Dialog.Viewport',
  element: <Dialog.Viewport />,
  refInstanceOf: HTMLDivElement,
  wrapper: DialogPortalWrapper,
  ownClassName: styles.viewport,
});
runComponentConformance({
  name: 'Dialog.Popup',
  element: <Dialog.Popup initialFocus={false} />,
  refInstanceOf: HTMLDivElement,
  wrapper: DialogViewportWrapper,
  ownClassName: styles.popup,
});
runComponentConformance({
  name: 'Dialog.Description',
  element: <Dialog.Description>Description</Dialog.Description>,
  refInstanceOf: HTMLParagraphElement,
  wrapper: DialogPopupWrapper,
  ownClassName: styles.description,
});
runComponentConformance({
  name: 'Dialog.Close',
  element: <Dialog.Close>Cancel</Dialog.Close>,
  refInstanceOf: HTMLButtonElement,
  wrapper: DialogPopupWrapper,
  renderPropTagName: 'button',
});
runComponentConformance({
  name: 'Dialog.Header',
  element: <Dialog.Header>Header</Dialog.Header>,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.header,
});
runComponentConformance({
  name: 'Dialog.Body',
  element: <Dialog.Body>Body</Dialog.Body>,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.body,
});
runComponentConformance({
  name: 'Dialog.Footer',
  element: <Dialog.Footer>Footer</Dialog.Footer>,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.footer,
});

it('keeps each composed part ref and native handler on its own element', async () => {
  const user = userEvent.setup();
  const portal = createRef<HTMLDivElement>();
  const backdrop = createRef<HTMLDivElement>();
  const viewport = createRef<HTMLDivElement>();
  const popup = createRef<HTMLDivElement>();
  const onPortalClick = vi.fn();
  const onBackdropClick = vi.fn();
  const onViewportClick = vi.fn();
  const onPopupClick = vi.fn();

  render(
    <Dialog.Root open disablePointerDismissal>
      <Dialog.Portal ref={portal} onClick={onPortalClick}>
        <Dialog.Backdrop
          ref={backdrop}
          data-testid="dialog-backdrop"
          onClick={onBackdropClick}
        />
        <Dialog.Viewport ref={viewport} onClick={onViewportClick}>
          <Dialog.Popup
            ref={popup}
            onClick={onPopupClick}
            initialFocus={false}
            aria-label="Composed dialog"
          >
            Content
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>,
  );

  const dialog = screen.getByRole('dialog', { name: 'Composed dialog' });

  expect(popup.current).toBe(dialog);
  expect(viewport.current).toBe(dialog.parentElement);
  expect(portal.current).toBe(viewport.current?.parentElement);
  expect(backdrop.current?.parentElement).toBe(portal.current);
  expect(backdrop.current).not.toBe(viewport.current);

  await user.click(dialog);

  expect(onPopupClick).toHaveBeenCalledOnce();
  expect(onViewportClick).toHaveBeenCalledOnce();
  expect(onPortalClick).toHaveBeenCalledOnce();
  expect(onBackdropClick).not.toHaveBeenCalled();

  await user.click(screen.getByTestId('dialog-backdrop'));

  expect(onBackdropClick).toHaveBeenCalledOnce();
  expect(onPortalClick).toHaveBeenCalledTimes(2);
  expect(onViewportClick).toHaveBeenCalledOnce();
  expect(onPopupClick).toHaveBeenCalledOnce();
});

it('preserves explicit native direction on viewport and popup', () => {
  render(
    <DirectionProvider direction="rtl">
      <Dialog.Root open>
        <Dialog.Portal>
          <Dialog.Viewport dir="ltr" data-testid="dialog-viewport">
            <Dialog.Popup
              dir="ltr"
              initialFocus={false}
              aria-label="Left to right dialog"
            />
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>
    </DirectionProvider>,
  );

  expect(screen.getByTestId('dialog-viewport')).toHaveAttribute('dir', 'ltr');
  expect(
    screen.getByRole('dialog', { name: 'Left to right dialog' }),
  ).toHaveAttribute('dir', 'ltr');
});
