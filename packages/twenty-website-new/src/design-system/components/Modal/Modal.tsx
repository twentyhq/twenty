'use client';

import { theme } from '@/theme';
import { Dialog } from '@base-ui/react/dialog';
import { styled } from '@linaria/react';
import type { CSSProperties, ReactNode } from 'react';

/**
 * Compound Modal primitive built on Base UI's `Dialog`.
 *
 * What you get for free from Base UI when `modal={true}` (default):
 * - Portal mount at the document root.
 * - Focus trap inside the popup.
 * - ESC closes (calls `onOpenChange(false, …)`).
 * - Click-outside closes (unless `disablePointerDismissal` is set).
 * - Body scroll lock while open.
 * - Focus restoration to the trigger element on close.
 * - Correct ARIA: `role="dialog"`, `aria-modal="true"`, plus
 *   `aria-labelledby` / `aria-describedby` auto-wired when you nest a
 *   `<Modal.Title>` / `<Modal.Description>` inside `<Modal.Root>`.
 *
 * Compound shape (matches Base UI's slot conventions):
 *
 * ```tsx
 * <Modal.Root open={open} onOpenChange={setOpen}>
 *   <Modal.Title>Talk to us</Modal.Title>
 *   <Modal.Description>Optional subtitle.</Modal.Description>
 *   <Modal.Body>{form}</Modal.Body>
 *   <Modal.Footer>{submit}</Modal.Footer>
 * </Modal.Root>
 * ```
 *
 * Slot contract:
 * - `Modal.Root` owns the overlay + panel visual (dark glass overlay,
 *   `#0c0c0c` panel rounded with `theme.radius(2)`, capped to 720px).
 *   Override the width with `panelWidth` (string, supports clamp/min)
 *   or attach a className that sets `--modal-panel-width` if you need
 *   media-query-aware widths.
 * - `Modal.Title` / `Modal.Description` are *unstyled* re-exports of
 *   `Dialog.Title` / `Dialog.Description`. Their job is to wire
 *   `aria-labelledby` / `aria-describedby` on the popup. Consumers
 *   style them — pass a `render` prop (`render={<MyHeading />}`) or
 *   wrap children in their own styled element. This keeps each modal
 *   free to ship its own typography without fighting a default theme.
 * - `Modal.Body` and `Modal.Footer` are layout-only flex columns with
 *   default spacing (`theme.spacing(4)` / `theme.spacing(2)`). Use
 *   them directly when the default is fine, drop them and use a
 *   bespoke wrapper otherwise.
 */
const Backdrop = styled(Dialog.Backdrop)`
  align-items: center;
  /* -webkit- prefix is required for the blur to render on Safari < 18. */
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
  background: rgba(28, 28, 28, 0.8);
  box-sizing: border-box;
  display: flex;
  inset: 0;
  justify-content: center;
  padding-bottom: ${theme.spacing(4)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(4)};
  position: fixed;
  z-index: ${theme.zIndex.modal};
`;

const Popup = styled(Dialog.Popup)`
  background: #0c0c0c;
  border-radius: ${theme.radius(2)};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(4)};
  /* Center over the (fixed-position) backdrop. Base UI applies its own
   * positioning via a transform; we want the popup to sit *inside* the
   * padded backdrop instead, so we pin it with absolute centering and
   * let the backdrop handle the padding. */
  left: 50%;
  max-height: calc(100% - ${theme.spacing(8)});
  max-width: calc(100% - ${theme.spacing(8)});
  overflow-y: auto;
  padding-bottom: ${theme.spacing(6)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(5)};
  position: fixed;
  top: 50%;
  transform: translate(-50%, -50%);
  width: var(--modal-panel-width, min(100%, 720px));
  z-index: ${theme.zIndex.modal};

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-bottom: ${theme.spacing(8)};
    padding-left: ${theme.spacing(6)};
    padding-right: ${theme.spacing(6)};
    padding-top: ${theme.spacing(6)};
  }
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(4)};
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(2)};
  margin-top: ${theme.spacing(2)};
`;

export type ModalRootProps = {
  open: boolean;
  /**
   * Called whenever Base UI wants to change the open state — ESC,
   * click-outside, focus-out, imperative close, or your own
   * `Modal.Close`. Treat it as `setOpen`.
   */
  onOpenChange: (open: boolean) => void;
  /** Disable click-outside-to-close. ESC still closes. */
  disablePointerDismissal?: boolean;
  /**
   * CSS width applied to the popup. Defaults to `min(100%, 720px)`.
   * Use a CSS string (not a number) so callers can pick clamp/min/etc.
   */
  panelWidth?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

function ModalRoot({
  children,
  className,
  disablePointerDismissal,
  onOpenChange,
  open,
  panelWidth,
  style,
}: ModalRootProps) {
  const popupStyle: CSSProperties = {
    ...style,
    ...(panelWidth !== undefined
      ? ({ '--modal-panel-width': panelWidth } as CSSProperties)
      : null),
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
      }}
      disablePointerDismissal={disablePointerDismissal}
    >
      <Dialog.Portal>
        <Backdrop />
        <Popup className={className} style={popupStyle}>
          {children}
        </Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/**
 * `Modal.Root` is the only entry point — it owns Portal + Backdrop +
 * Popup. Composing the slots manually (e.g. Modal.Portal,
 * Modal.Backdrop) is intentionally not supported: every site modal
 * shares the same overlay/panel visual and we want one place to change
 * it.
 *
 * If a future modal needs a different visual contract, add a sibling
 * primitive (e.g. `Sheet`) rather than punching prop holes through
 * `Modal`.
 */
export const Modal = {
  Root: ModalRoot,
  /** Wires `aria-labelledby` on the popup. Unstyled — bring your own
   * heading typography via `render={<MyHeading />}` or by wrapping
   * children in a styled element. Renders an `<h2>` by default. */
  Title: Dialog.Title,
  /** Wires `aria-describedby` on the popup. Unstyled — see Title. */
  Description: Dialog.Description,
  Body,
  Footer,
  /** Re-exported so submit/cancel buttons can call `<Modal.Close />`
   * instead of plumbing `onClose` through props. Renders a `<button>`
   * by default — pass `render={<MyButton />}` to swap. */
  Close: Dialog.Close,
};
