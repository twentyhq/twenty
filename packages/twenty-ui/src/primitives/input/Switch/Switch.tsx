import { Switch as SwitchPrimitive } from '@base-ui/react/switch';
import { clsx } from 'clsx';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from './Switch.module.scss';
import { type SwitchProps } from './types/SwitchProps';

export const Switch = ({
  size = 'md',
  className,
  children,
  ...props
}: SwitchProps) => (
  <SwitchPrimitive.Root
    {...props}
    className={mergeClassNames(clsx(styles.root, styles[size]), className)}
  >
    <SwitchPrimitive.Thumb className={styles.thumb} />
    {children}
  </SwitchPrimitive.Root>
);
