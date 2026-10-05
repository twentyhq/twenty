import { Progress } from '@base-ui/react/progress';
import { isNonEmptyString } from '@sniptt/guards';
import { clsx } from 'clsx';
import { type CSSProperties } from 'react';

import styles from './ProgressBar.module.scss';
import { type ProgressBarProps } from './types/ProgressBarProps';

export const ProgressBar = ({
  value,
  size = 'md',
  className,
  barColor,
  backgroundColor = 'none',
  withBorderRadius = false,
  withGrowIn = false,
  withGlint = false,
  withSpringFill = false,
  withMinimumFillWidth = true,
  ariaLabel,
  onGrowInComplete,
}: ProgressBarProps) => {
  return (
    <Progress.Root
      className={clsx(styles.bar, className)}
      data-size={size}
      data-with-border-radius={withBorderRadius || undefined}
      data-grow-in={withGrowIn || undefined}
      aria-label={ariaLabel}
      value={value}
      onAnimationEnd={(event) => {
        if (withGrowIn && event.target === event.currentTarget) {
          onGrowInComplete?.();
        }
      }}
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
          data-spring-fill={withSpringFill || undefined}
          data-nonzero={(withMinimumFillWidth && value > 0) || undefined}
        >
          {withGlint && <span key={value} className={styles.glint} />}
        </Progress.Indicator>
      </Progress.Track>
    </Progress.Root>
  );
};
