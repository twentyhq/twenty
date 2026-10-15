import { isFunction, isNonEmptyString } from '@sniptt/guards';
import { type CSSProperties } from 'react';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import { Progress } from '../Progress/Progress';

import styles from './ProgressRing.module.scss';
import { ProgressRingIndicator } from './internal/ProgressRingIndicator';
import { type ProgressRingProps } from './types/ProgressRingProps';

export const ProgressRing = ({
  size = 'md',
  barColor,
  children,
  className,
  style,
  ...props
}: ProgressRingProps) => (
  <Progress.Root
    {...props}
    className={mergeClassNames(styles.root, className)}
    style={(state) =>
      ({
        ...(isNonEmptyString(barColor)
          ? { '--progress-ring-color': barColor }
          : {}),
        ...(isFunction(style) ? style(state) : style),
      }) as CSSProperties
    }
  >
    {children}
    <ProgressRingIndicator size={size} />
  </Progress.Root>
);
