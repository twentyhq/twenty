import { clsx } from 'clsx';
import { type ComponentPropsWithoutRef, forwardRef } from 'react';

import styles from './OverlayContainer.module.scss';

type OverlayContainerProps = ComponentPropsWithoutRef<'div'> & {
  borderRadius?: 'sm' | 'md';
  hasDangerBorder?: boolean;
};

export const OverlayContainer = forwardRef<
  HTMLDivElement,
  OverlayContainerProps
>(({ borderRadius = 'md', hasDangerBorder, className, ...props }, ref) => (
  <div
    {...props}
    ref={ref}
    className={clsx(styles.overlay, className)}
    data-border-radius={borderRadius}
    data-danger-border={hasDangerBorder || undefined}
  />
));

OverlayContainer.displayName = 'OverlayContainer';
