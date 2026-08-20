import { clsx } from 'clsx';
import { forwardRef } from 'react';

import styles from './IllustrationIconWrapper.module.scss';

// The deprecated Linaria styled.div forwarded refs and accepted all native
// div props, so the port preserves that contract.
export const IllustrationIconWrapper = forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={clsx(styles.root, className)} {...props} />
));

IllustrationIconWrapper.displayName = 'IllustrationIconWrapper';
