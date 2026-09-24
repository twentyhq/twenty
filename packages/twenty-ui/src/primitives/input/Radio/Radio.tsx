import { Radio as RadioPrimitive } from '@base-ui/react/radio';
import { clsx } from 'clsx';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from './Radio.module.scss';
import { type RadioProps } from './types/RadioProps';

export const Radio = <TValue,>({
  children,
  className,
  size = 'sm',
  ...props
}: RadioProps<TValue>) => (
  <RadioPrimitive.Root
    {...props}
    className={mergeClassNames(clsx(styles.root, styles[size]), className)}
  >
    <span className={styles.control} aria-hidden>
      <RadioPrimitive.Indicator className={styles.indicator} />
    </span>
    {children}
  </RadioPrimitive.Root>
);
