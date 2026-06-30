import { clsx } from 'clsx';
import { forwardRef } from 'react';

import styles from './VisibilityHiddenInput.module.scss';

// The deprecated Linaria styled.input forwarded refs and accepted all native
// input props, so the port preserves that contract.
export const VisibilityHiddenInput = forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<'input'>
>(({ className, ...props }, ref) => (
  // oxlint-disable-next-line react/jsx-props-no-spreading
  <input ref={ref} className={clsx(styles.root, className)} {...props} />
));

VisibilityHiddenInput.displayName = 'VisibilityHiddenInput';
