import { clsx } from 'clsx';
import { type ComponentPropsWithoutRef, forwardRef } from 'react';
import { Link } from 'react-router-dom';

import styles from './StyledTabBase.module.scss';

// The deprecated Linaria styled components forwarded refs and arbitrary
// native props (twenty-front spreads drag-and-drop props onto
// StyledTabContainer), so the ports preserve that contract.
type StyledTabButtonProps = {
  active?: boolean;
  disabled?: boolean;
  to?: string;
} & ComponentPropsWithoutRef<'button'>;

export const StyledTabButton = forwardRef<HTMLElement, StyledTabButtonProps>(
  ({ active, disabled, to, className, children, ...rest }, ref) => {
    // Replaces the legacy Linaria `as` polymorphism: react-router Link when a
    // `to` is provided, a native button otherwise. Typed as any to forward all
    // props untyped, exactly like the legacy `as` prop did.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const TabButtonComponent: any = to ? Link : 'button';

    return (
      <TabButtonComponent
        ref={ref}
        to={to}
        disabled={to ? undefined : disabled}
        className={clsx(styles.tabButton, className)}
        data-active={active || undefined}
        data-disabled={disabled || undefined}
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...rest}
      >
        {children}
      </TabButtonComponent>
    );
  },
);

StyledTabButton.displayName = 'StyledTabButton';

type StyledTabContainerProps = {
  active?: boolean;
  disabled?: boolean;
} & ComponentPropsWithoutRef<'div'>;

export const StyledTabContainer = forwardRef<
  HTMLDivElement,
  StyledTabContainerProps
>(({ active, disabled, className, children, ...rest }, ref) => (
  <div
    ref={ref}
    className={clsx(styles.tabContainer, className)}
    data-active={active || undefined}
    data-disabled={disabled || undefined}
    // oxlint-disable-next-line react/jsx-props-no-spreading
    {...rest}
  >
    {children}
  </div>
));

StyledTabContainer.displayName = 'StyledTabContainer';

type StyledTabHoverProps = {
  contentSize?: 'sm' | 'md';
} & ComponentPropsWithoutRef<'span'>;

export const StyledTabHover = forwardRef<HTMLSpanElement, StyledTabHoverProps>(
  ({ contentSize, className, children, ...rest }, ref) => (
    <span
      ref={ref}
      className={clsx(styles.tabHover, className)}
      data-content-size={contentSize}
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...rest}
    >
      {children}
    </span>
  ),
);

StyledTabHover.displayName = 'StyledTabHover';
