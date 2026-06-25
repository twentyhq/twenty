import { clsx } from 'clsx';
import { type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './EmptyPlaceholderStyled.module.scss';

type AnimatedPlaceholderEmptyContainerProps = {
  children?: ReactNode;
  className?: string;
  width?: number;
};

export const AnimatedPlaceholderEmptyContainer = ({
  children,
  className,
  width,
}: AnimatedPlaceholderEmptyContainerProps) => {
  return (
    <div
      className={clsx(styles.emptyContainer, className)}
      style={isDefined(width) ? { width: `${width}px` } : undefined}
    >
      {children}
    </div>
  );
};

export const AnimatedPlaceholderEmptyTextContainer = ({
  className,
  ...rest
}: ComponentPropsWithoutRef<'div'>) => (
  <div
    className={clsx(styles.emptyTextContainer, className)}
    // oxlint-disable-next-line react/jsx-props-no-spreading
    {...rest}
  />
);

export const AnimatedPlaceholderEmptyTitle = ({
  className,
  ...rest
}: ComponentPropsWithoutRef<'div'>) => (
  <div
    className={clsx(styles.emptyTitle, className)}
    // oxlint-disable-next-line react/jsx-props-no-spreading
    {...rest}
  />
);

export const AnimatedPlaceholderEmptySubTitle = ({
  className,
  ...rest
}: ComponentPropsWithoutRef<'div'>) => (
  <div
    className={clsx(styles.emptySubTitle, className)}
    // oxlint-disable-next-line react/jsx-props-no-spreading
    {...rest}
  />
);
