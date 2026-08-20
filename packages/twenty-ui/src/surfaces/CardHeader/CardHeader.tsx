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
    <div className={clsx(styles.cardHeader, className)} {...rest}>
      {children}
    </div>
  );
};
