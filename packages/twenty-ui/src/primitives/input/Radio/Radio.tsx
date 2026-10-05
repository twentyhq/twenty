import { Radio as RadioPrimitive } from '@base-ui/react/radio';
import { clsx } from 'clsx';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from './Radio.module.scss';
import { type RadioProps } from './types/RadioProps';

export const Radio = <TValue,>({
  children,
  className,
  size = 'sm',
  variant = 'default',
  ...props
}: RadioProps<TValue>) => (
  <RadioPrimitive.Root
    render={variant === 'card' ? <div /> : undefined}
    {...props}
    className={mergeClassNames(
      clsx(styles.root, styles[size], variant === 'card' && styles.card),
      className,
    )}
  >
    <span className={styles.control} aria-hidden>
      <RadioPrimitive.Indicator className={styles.indicator} />
    </span>
    {variant === 'card' ? (
      <div className={styles.cardContent}>{children}</div>
    ) : (
      children
    )}
  </RadioPrimitive.Root>
);
