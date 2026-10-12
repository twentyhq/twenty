import { type CSSProperties } from 'react';

import { ProgressBar } from '@ui/primitives/feedback/ProgressBar/ProgressBar';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './ToastProgress.module.scss';

type ToastProgressProps = {
  progress?: number;
  duration: number;
  isPaused: boolean;
  barColor: string;
  onClose?: () => void;
};

export const ToastProgress = ({
  progress,
  duration,
  isPaused,
  barColor,
  onClose,
}: ToastProgressProps) => {
  if (isDefined(progress)) {
    return <ProgressBar value={progress} barColor={barColor} />;
  }

  return (
    <div
      className={styles.countdown}
      data-paused={isPaused || undefined}
      onAnimationEnd={onClose}
      style={
        {
          '--toast-countdown-color': barColor,
          '--toast-countdown-duration': `${duration}ms`,
        } as CSSProperties
      }
    />
  );
};
