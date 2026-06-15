import { clsx } from 'clsx';

import styles from './ModalHeader.module.scss';

export type ModalHeaderProps = React.PropsWithChildren & {
  noPadding?: boolean;
  autoHeight?: boolean;
  hasBorderBottom?: boolean;
  paddingHorizontal?: number;
  backgroundColor?: string;
};

export const ModalHeader = ({
  children,
  noPadding,
  autoHeight,
  hasBorderBottom,
  paddingHorizontal,
  backgroundColor,
}: ModalHeaderProps) => (
  <div
    className={clsx(
      styles.header,
      autoHeight && styles.autoHeight,
      noPadding && styles.noPadding,
      paddingHorizontal !== undefined && styles.withHorizontalPadding,
      hasBorderBottom && styles.withBorderBottom,
    )}
    style={
      {
        '--modal-header-padding-horizontal':
          paddingHorizontal !== undefined
            ? `var(--t-spacing-${paddingHorizontal})`
            : undefined,
        backgroundColor,
      } as React.CSSProperties
    }
  >
    {children}
  </div>
);
