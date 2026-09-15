import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox';
import { clsx } from 'clsx';

import { IconCheck, IconMinus } from '@ui/icon';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from './Checkbox.module.scss';
import { type CheckboxProps } from './types/CheckboxProps';

export const Checkbox = ({
  size = 'sm',
  variant = 'solid',
  shape = 'square',
  color = 'accent',
  hoverable = true,
  className,
  children,
  ...props
}: CheckboxProps) => (
  <CheckboxPrimitive.Root
    {...props}
    className={mergeClassNames(
      clsx(
        styles.root,
        styles[size],
        styles[variant],
        styles[shape],
        styles[color],
        hoverable && styles.hoverable,
      ),
      className,
    )}
  >
    <span className={styles.box}>
      <CheckboxPrimitive.Indicator className={styles.indicator}>
        <IconCheck className={styles.check} aria-hidden />
        <IconMinus className={styles.minus} aria-hidden />
      </CheckboxPrimitive.Indicator>
    </span>
    {children}
  </CheckboxPrimitive.Root>
);
