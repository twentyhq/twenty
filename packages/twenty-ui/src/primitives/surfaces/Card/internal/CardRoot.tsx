import { clsx } from 'clsx';
import { type ComponentPropsWithoutRef, type CSSProperties } from 'react';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from '../Card.module.scss';

type CardRootProps = ComponentPropsWithoutRef<'div'> & {
  fullWidth?: boolean;
  rounded?: boolean;
  backgroundColor?: string;
};

export const CardRoot = ({
  children,
  className,
  fullWidth,
  rounded,
  backgroundColor,
  style,
  ...rest
}: CardRootProps) => {
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
      {...rest}
    >
      {children}
    </div>
  );
};
