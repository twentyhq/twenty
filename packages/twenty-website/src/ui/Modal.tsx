'use client';

import { Dialog } from '@base-ui/react/dialog';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { MODAL_SURFACE, mediaUp, radius, spacing, Z_INDEX } from '@/tokens';

const Backdrop = styled(Dialog.Backdrop)`
  align-items: center;
  /* -webkit- prefix is required for the blur to render on Safari < 18. */
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
  background: ${MODAL_SURFACE.backdrop};
  display: flex;
  inset: 0;
  justify-content: center;
  padding: ${spacing(4)};
  position: fixed;
  z-index: ${Z_INDEX.modal};
`;

// The panel width is a CSS variable defaulting to the standard 720px cap;
// a consumer overrides it (responsively, or per state) by setting
// --modal-panel-width through `className`.
const Popup = styled(Dialog.Popup)`
  background: ${MODAL_SURFACE.panel};
  border-radius: ${radius(2)};
  display: flex;
  flex-direction: column;
  gap: ${spacing(4)};
  /* Base UI positions the popup itself; pin it with absolute centering so
     it sits inside the padded backdrop instead. */
  left: 50%;
  max-height: calc(100% - ${spacing(8)});
  max-width: calc(100% - ${spacing(8)});
  overflow-y: auto;
  padding: ${spacing(5)} ${spacing(4)} ${spacing(6)};
  position: fixed;
  top: 50%;
  transform: translate(-50%, -50%);
  width: var(--modal-panel-width, min(100%, 720px));
  z-index: ${Z_INDEX.modal};

  ${mediaUp('md')} {
    padding: ${spacing(6)} ${spacing(6)} ${spacing(8)};
  }
`;

export type ModalProps = {
  // Names the dialog when its content has no Dialog.Title (the partner wizard);
  // omit it when the content renders its own Dialog.Title (the Cal modal).
  ariaLabel?: string;
  children: ReactNode;
  className?: string;
  onClose: () => void;
  open: boolean;
};

// The site's one dark dialog shell: a blurred backdrop and a centred near-black
// panel. Consumers supply the content (and either a Dialog.Title or ariaLabel
// for the accessible name).
export function Modal({
  ariaLabel,
  children,
  className,
  onClose,
  open,
}: ModalProps) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <Dialog.Portal>
        <Backdrop />
        <Popup aria-label={ariaLabel} className={className}>
          {children}
        </Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
