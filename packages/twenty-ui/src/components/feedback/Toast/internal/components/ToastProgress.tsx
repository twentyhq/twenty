import { type CSSProperties } from 'react';

import { ProgressBar } from '@ui/primitives/feedback/ProgressBar/ProgressBar';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { isCountdownDuration } from '../utils/isCountdownDuration';
import styles from './ToastProgress.module.scss';

type ToastProgressProps = {
  progress?: number;
  duration: number;
  remainingDuration: number;
  revision: number;
  isPaused: boolean;
  barColor: string;
};

export const ToastProgress = ({
  progress,
  duration,
  remainingDuration,
  revision,
  isPaused,
  barColor,
}: ToastProgressProps) => {
  if (isDefined(progress)) {
    return <ProgressBar value={progress} barColor={barColor} />;
  }

  if (!isCountdownDuration(duration)) {
    return null;
  }

  return (
    <div
      key={revision}
      className={styles.countdown}
      data-paused={isPaused || undefined}
      style={
        {
          '--toast-countdown-color': barColor,
          '--toast-countdown-width': `${(remainingDuration / duration) * 100}%`,
          '--toast-countdown-duration': `${remainingDuration}ms`,
        } as CSSProperties
      }
    />
  );
};
