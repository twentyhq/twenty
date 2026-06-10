import { clsx } from 'clsx';
import { type ComponentPropsWithoutRef, type CSSProperties } from 'react';
import { isDefined } from 'twenty-shared/utils';

import styles from './Card.module.scss';

type CardProps = ComponentPropsWithoutRef<'div'> & {
  fullWidth?: boolean;
  rounded?: boolean;
  backgroundColor?: string;
};

export const Card = ({
  children,
  className,
  fullWidth,
  rounded,
  backgroundColor,
  style,
  ...rest
}: CardProps) => {
  return (
    <div
      className={clsx(styles.card, className)}
      data-full-width={fullWidth || undefined}
      data-rounded={rounded || undefined}
      style={
        isDefined(backgroundColor)
          ? ({
              ...style,
              '--card-background-color': backgroundColor,
            } as CSSProperties)
          : style
      }
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...rest}
    >
      {children}
    </div>
  );
};
