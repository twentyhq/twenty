import { clsx } from 'clsx';
import { type ComponentPropsWithoutRef } from 'react';

import styles from './CardFooter.module.scss';

type CardFooterProps = ComponentPropsWithoutRef<'div'> & {
  divider?: boolean;
};

export const CardFooter = ({
  children,
  className,
  divider,
  ...rest
}: CardFooterProps) => {
  return (
    <div
      className={clsx(styles.cardFooter, className)}
      data-no-divider={divider === false || undefined}
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...rest}
    >
      {children}
    </div>
  );
};
