import { Progress } from '@base-ui/react/progress';
import { clsx } from 'clsx';

import styles from './ProgressBar.module.scss';

export type ProgressBarProps = {
  value: number;
  size?: 'sm' | 'md';
  className?: string;
  barColor?: string;
  backgroundColor?: string;
  withBorderRadius?: boolean;
  withGrowIn?: boolean;
  withGlint?: boolean;
  withSpringFill?: boolean;
  withMinimumFillWidth?: boolean;
  ariaLabel?: string;
  countdownDurationInMs?: number;
  isCountdownPaused?: boolean;
  onCountdownComplete?: () => void;
  onGrowInComplete?: () => void;
};

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
  countdownDurationInMs,
  isCountdownPaused = false,
  onCountdownComplete,
  onGrowInComplete,
}: ProgressBarProps) => {
  const isCountdown = countdownDurationInMs !== undefined;

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
          ...(barColor ? { '--progress-bar-color': barColor } : {}),
          ...(isCountdown
            ? {
                '--progress-bar-countdown-duration': `${countdownDurationInMs}ms`,
              }
            : {}),
        } as React.CSSProperties
      }
    >
      <Progress.Track className={styles.track}>
        <Progress.Indicator
          className={clsx(styles.indicator, isCountdown && styles.countdown)}
          data-with-border-radius={withBorderRadius || undefined}
          data-spring-fill={withSpringFill || undefined}
          data-nonzero={
            (withMinimumFillWidth && value > 0 && !isCountdown) || undefined
          }
          data-paused={(isCountdown && isCountdownPaused) || undefined}
          onAnimationEnd={isCountdown ? onCountdownComplete : undefined}
        >
          {withGlint && <span key={value} className={styles.glint} />}
        </Progress.Indicator>
      </Progress.Track>
    </Progress.Root>
  );
};
