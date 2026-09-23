import { clsx } from 'clsx';
import { type ComponentPropsWithRef } from 'react';

import { Text } from '@ui/primitives/typography/Text/Text';

import styles from '../Dropdown.module.scss';

export const DropdownEmpty = ({
  className,
  ...props
}: ComponentPropsWithRef<'div'>) => (
  <Text
    {...props}
    role="status"
    aria-live="polite"
    className={clsx(styles.status, className)}
  />
);
