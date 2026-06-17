import { clsx } from 'clsx';
import { type HTMLMotionProps, motion } from 'framer-motion';
import { type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './EmptyPlaceholderStyled.module.scss';

type AnimatedPlaceholderEmptyContainerProps = Pick<
  HTMLMotionProps<'div'>,
  'initial' | 'animate' | 'transition'
> & {
  children?: ReactNode;
  className?: string;
  width?: number;
};

export const AnimatedPlaceholderEmptyContainer = ({
  children,
  className,
  width,
  initial,
  animate,
  transition,
}: AnimatedPlaceholderEmptyContainerProps) => {
  return (
    <motion.div
      className={clsx(styles.emptyContainer, className)}
      style={isDefined(width) ? { width: `${width}px` } : undefined}
      initial={initial}
      animate={animate}
      transition={transition}
    >
      {children}
    </motion.div>
  );
};

export const EMPTY_PLACEHOLDER_TRANSITION_PROPS = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: {
    duration: 0.15,
  },
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
