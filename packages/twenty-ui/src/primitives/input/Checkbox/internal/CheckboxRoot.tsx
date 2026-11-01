import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox';
import { clsx } from 'clsx';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Checkbox.module.scss';
import { type CheckboxRootProps } from '../types/CheckboxRootProps';

export const CheckboxRoot = ({
  size = 'sm',
  variant = 'solid',
  shape = 'square',
  color = 'accent',
  hoverable = true,
  className,
  ...props
}: CheckboxRootProps) => (
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
  />
);
