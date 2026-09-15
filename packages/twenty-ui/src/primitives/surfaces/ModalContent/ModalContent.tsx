import { clsx } from 'clsx';

import styles from './ModalContent.module.scss';

export type ModalContentProps = React.PropsWithChildren & {
  isVerticallyCentered?: boolean;
  isHorizontallyCentered?: boolean;
  noPadding?: boolean;
  overflowHidden?: boolean;
  gap?: number;
  contentPadding?: number;
};

export const ModalContent = ({
  children,
  isVerticallyCentered,
  isHorizontallyCentered,
  noPadding,
  overflowHidden,
  gap,
  contentPadding,
}: ModalContentProps) => (
  <div
    className={clsx(
      styles.content,
      isVerticallyCentered && styles.verticallyCentered,
      isHorizontallyCentered && styles.horizontallyCentered,
      overflowHidden && styles.overflowHidden,
      contentPadding !== undefined && styles.withContentPadding,
      noPadding && styles.noPadding,
    )}
    style={
      {
        gap: gap !== undefined ? `var(--t-spacing-${gap})` : undefined,
        '--modal-content-padding':
          contentPadding !== undefined
            ? `var(--t-spacing-${contentPadding})`
            : undefined,
      } as React.CSSProperties
    }
  >
    {children}
  </div>
);
