import { Switch as SwitchPrimitive } from '@base-ui/react/switch';
import { clsx } from 'clsx';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Switch.module.scss';
import { type SwitchRootProps } from '../types/SwitchRootProps';

export const SwitchRoot = ({
  size = 'md',
  className,
  ...props
}: SwitchRootProps) => (
  <SwitchPrimitive.Root
    {...props}
    className={mergeClassNames(clsx(styles.root, styles[size]), className)}
  />
);
