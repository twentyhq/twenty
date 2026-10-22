import { clsx } from 'clsx';
import { type ComponentPropsWithRef } from 'react';

import { Text } from '@ui/primitives/typography/Text/Text';

import styles from '../Dropdown.module.scss';

export const DropdownLoading = ({
  color: nativeColor,
  className,
  ...props
}: ComponentPropsWithRef<'div'>) => (
  <Text
    // oxlint-disable-next-line react/jsx-props-no-spreading
    {...props}
    render={<div color={nativeColor} />}
    size="sm"
    color="secondary"
    role="status"
    aria-live="polite"
    aria-busy="true"
    className={clsx(styles.status, className)}
  />
);
