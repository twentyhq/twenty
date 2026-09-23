import { Progress } from '@base-ui/react/progress';
import { clsx } from 'clsx';

import styles from './ProgressBar.module.scss';

export type ProgressBarProps = {
  value: number;
  className?: string;
  barColor?: string;
  backgroundColor?: string;
  withBorderRadius?: boolean;
  ariaLabel?: string;
  countdownDurationInMs?: number;
  isCountdownPaused?: boolean;
  onCountdownComplete?: () => void;
};

export const ProgressBar = ({
  value,
  className,
  barColor,
  backgroundColor = 'none',
  withBorderRadius = false,
  ariaLabel,
  countdownDurationInMs,
  isCountdownPaused = false,
  onCountdownComplete,
}: ProgressBarProps) => {
  const isCountdown = countdownDurationInMs !== undefined;

  return (
    <Progress.Root
      className={clsx(styles.bar, className)}
      data-with-border-radius={withBorderRadius || undefined}
      aria-label={ariaLabel}
      value={value}
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
          data-nonzero={(value > 0 && !isCountdown) || undefined}
          data-paused={(isCountdown && isCountdownPaused) || undefined}
          onAnimationEnd={isCountdown ? onCountdownComplete : undefined}
        />
      </Progress.Track>
    </Progress.Root>
  );
};
