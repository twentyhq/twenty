import { Progress } from '@base-ui/react/progress';
import { isNonEmptyString } from '@sniptt/guards';
import { clsx } from 'clsx';
import { type CSSProperties } from 'react';

import styles from './ProgressBar.module.scss';
import { type ProgressBarProps } from './types/ProgressBarProps';

export const ProgressBar = ({
  value,
  className,
  barColor,
  backgroundColor = 'none',
  withBorderRadius = false,
  ariaLabel,
}: ProgressBarProps) => {
  return (
    <Progress.Root
      className={clsx(styles.bar, className)}
      data-with-border-radius={withBorderRadius || undefined}
      aria-label={ariaLabel}
      value={value}
      style={
        {
          '--progress-bar-background-color': backgroundColor,
          ...(isNonEmptyString(barColor)
            ? { '--progress-bar-color': barColor }
            : {}),
        } as CSSProperties
      }
    >
      <Progress.Track className={styles.track}>
        <Progress.Indicator
          className={styles.indicator}
          data-with-border-radius={withBorderRadius || undefined}
          data-nonzero={value > 0 || undefined}
        />
      </Progress.Track>
    </Progress.Root>
  );
};
