import { clsx } from 'clsx';
import { forwardRef } from 'react';

import { type ModalOverlay } from '../types/ModalOverlay';

import styles from './ModalBackdrop.module.scss';

// The deprecated Linaria styled.div forwarded refs and accepted all native
// div props (including the data-* attributes Modal relies on), so the port
// preserves that contract.
type ModalBackdropProps = React.ComponentPropsWithoutRef<'div'> & {
  overlay: ModalOverlay;
  backdropZIndex: number;
  isInContainer?: boolean;
  'data-testid'?: string;
  'data-click-outside-id'?: string;
};

export const ModalBackdrop = forwardRef<HTMLDivElement, ModalBackdropProps>(
  (
    { overlay, backdropZIndex, isInContainer, className, style, ...divProps },
    ref,
  ) => (
    <div
      ref={ref}
      className={clsx(
        styles.backdrop,
        overlay === 'light' && styles.overlayLight,
        isInContainer && styles.inContainer,
        className,
      )}
      style={
        {
          '--modal-backdrop-z-index': backdropZIndex,
          ...style,
        } as React.CSSProperties
      }
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...divProps}
    />
  ),
);

ModalBackdrop.displayName = 'ModalBackdrop';
