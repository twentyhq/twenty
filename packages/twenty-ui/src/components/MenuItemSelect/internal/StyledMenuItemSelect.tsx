import { clsx } from 'clsx';
import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import styles from '../MenuItemSelect.module.scss';
type StyledMenuItemSelectProps = {
  disabled?: boolean;
  focused?: boolean;
  isKeySelected?: boolean;
} & ComponentPropsWithoutRef<'div'>;

export const StyledMenuItemSelect = forwardRef<
  HTMLDivElement,
  StyledMenuItemSelectProps
>(({ disabled, focused, isKeySelected, className, children, ...rest }, ref) => (
  <div
    ref={ref}
    className={clsx(styles.menuItemSelect, className)}
    data-disabled={disabled || undefined}
    data-focused={focused || undefined}
    data-key-selected={isKeySelected || undefined}
    {...rest}
  >
    {children}
  </div>
));

StyledMenuItemSelect.displayName = 'StyledMenuItemSelect';
