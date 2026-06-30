import { clsx } from 'clsx';
import { type ComponentPropsWithoutRef, type ReactNode } from 'react';

import styles from './CardContent.module.scss';

type CardContentProps = {
  children?: ReactNode;
  className?: string;
  divider?: boolean;
  isClickable?: boolean;
  hasHoverHighlight?: boolean;
} & ComponentPropsWithoutRef<'div'>;

export const CardContent = ({
  children,
  className,
  divider,
  isClickable,
  hasHoverHighlight,
  ...rest
}: CardContentProps) => {
  return (
    <div
      className={clsx(styles.cardContent, className)}
      data-divider={divider || undefined}
      data-clickable={isClickable || undefined}
      data-hover-highlight={hasHoverHighlight || undefined}
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...rest}
    >
      {children}
    </div>
  );
};
