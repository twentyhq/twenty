import { clsx } from 'clsx';
import { type ComponentPropsWithoutRef } from 'react';

import styles from './CardHeader.module.scss';

type CardHeaderProps = ComponentPropsWithoutRef<'div'>;

export const CardHeader = ({
  children,
  className,
  ...rest
}: CardHeaderProps) => {
  return (
    // oxlint-disable-next-line react/jsx-props-no-spreading
    <div className={clsx(styles.cardHeader, className)} {...rest}>
      {children}
    </div>
  );
};
