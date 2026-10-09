import { clsx } from 'clsx';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Radio.module.scss';
import { type RadioProps } from '../types/RadioProps';

import { RadioIndicator } from './RadioIndicator';
import { RadioRoot } from './RadioRoot';

export const RadioComponent = <TValue,>({
  children,
  className,
  size = 'sm',
  variant = 'default',
  ...props
}: RadioProps<TValue>) => (
  <RadioRoot
    {...props}
    className={mergeClassNames(
      clsx(styles.root, styles[size], variant === 'card' && styles.card),
      className,
    )}
  >
    <span className={styles.control} aria-hidden>
      <RadioIndicator className={styles.indicator} />
    </span>
    {variant === 'card' ? (
      <span className={styles.cardContent}>{children}</span>
    ) : (
      children
    )}
  </RadioRoot>
);
