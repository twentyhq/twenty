import { Dialog } from '@base-ui/react/dialog';
import { clsx } from 'clsx';
import { useRef } from 'react';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { type ModalOverlay } from '@ui/surfaces/Modal/types/ModalOverlay';
import { type ModalPadding } from '@ui/surfaces/Modal/types/ModalPadding';
import { type ModalProps } from '@ui/surfaces/Modal/types/ModalProps';

import styles from './Modal.module.scss';
import { ModalBackdrop } from '@ui/surfaces/ModalBackdrop/ModalBackdrop';

const DEFAULT_MODAL_Z_INDEX = 40;
const DEFAULT_BACKDROP_Z_INDEX = 39;

// Base UI's Dialog.Popup stops the propagation of these keydown events, but
// the deprecated Modal let them bubble up to global hotkey listeners.
const KEYDOWN_EVENTS_TO_PROPAGATE = new Set([
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
]);

const PADDING_CLASS_NAMES: Record<ModalPadding, string> = {
  none: styles.paddingNone,
  small: styles.paddingSmall,
  medium: styles.paddingMedium,
  large: styles.paddingLarge,
};

// The 'light' overlay is the base style of the modal, so it needs no class
const OVERLAY_CLASS_NAMES: Record<ModalOverlay, string | undefined> = {
  dark: styles.overlayDark,
  light: undefined,
  transparent: styles.overlayTransparent,
};

export const Modal = ({
  isOpen,
  ariaLabel,
  children,
  size = 'medium',
  padding = 'medium',
  overlay = 'dark',
  isMobile = false,
  isInContainer = false,
  container,
  gap,
  smallBorderRadius,
  narrowWidth,
  autoHeight,
  modalZIndex = DEFAULT_MODAL_Z_INDEX,
  backdropZIndex = DEFAULT_BACKDROP_Z_INDEX,
  backdropTestId = 'modal-backdrop',
  backdropClickOutsideId,
  preventClickOutside,
  onBackdropMouseDown,
  modalRef: externalRef,
}: ModalProps) => {
  const internalRef = useRef<HTMLDivElement>(null);
  const resolvedRef = externalRef ?? internalRef;

  const handleBackdropMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBackdropMouseDown?.(e);
  };

  // modal={false} and disablePointerDismissal keep Base UI from trapping
  // focus, locking scroll or closing on outside press: like the deprecated
  // Modal, open/close is fully controlled by the isOpen prop
  return (
    <Dialog.Root open={isOpen} modal={false} disablePointerDismissal>
      <Dialog.Portal container={isDefined(container) ? container : undefined}>
        <ModalBackdrop
          data-testid={backdropTestId}
          data-click-outside-id={backdropClickOutsideId}
          onMouseDown={handleBackdropMouseDown}
          overlay={overlay}
          backdropZIndex={backdropZIndex}
          isInContainer={isInContainer}
        >
          <Dialog.Popup
            initialFocus={false}
            finalFocus={false}
            onKeyDown={(event) => {
              if (KEYDOWN_EVENTS_TO_PROPAGATE.has(event.key)) {
                event.preventBaseUIHandler();
              }
            }}
            render={
              <div
                ref={resolvedRef}
                aria-label={ariaLabel}
                className={clsx(
                  styles.modal,
                  styles[size],
                  PADDING_CLASS_NAMES[padding],
                  OVERLAY_CLASS_NAMES[overlay],
                  isMobile && styles.mobile,
                  smallBorderRadius && styles.smallBorderRadius,
                  narrowWidth && styles.narrowWidth,
                  autoHeight && styles.autoHeight,
                )}
                style={
                  {
                    '--modal-z-index': modalZIndex,
                    gap:
                      gap !== undefined ? `var(--t-spacing-${gap})` : undefined,
                  } as React.CSSProperties
                }
                data-globally-prevent-click-outside={preventClickOutside}
              />
            }
          >
            {children}
          </Dialog.Popup>
        </ModalBackdrop>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
