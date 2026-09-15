import { clsx } from 'clsx';

import styles from './ModalFooter.module.scss';

export type ModalFooterProps = React.PropsWithChildren & {
  autoHeight?: boolean;
  centered?: boolean;
  smallPadding?: boolean;
  className?: string;
};

export const ModalFooter = ({
  children,
  autoHeight,
  centered,
  smallPadding,
  className,
}: ModalFooterProps) => (
  <div
    className={clsx(
      styles.footer,
      autoHeight && styles.autoHeight,
      centered && styles.centered,
      smallPadding && styles.smallPadding,
      className,
    )}
  >
    {children}
  </div>
);
