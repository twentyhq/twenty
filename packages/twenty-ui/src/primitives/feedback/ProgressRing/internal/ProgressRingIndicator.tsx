import { getProgressIndicatorPercentage } from '../../Progress/internal/getProgressIndicatorPercentage';
import { Progress } from '../../Progress/Progress';
import styles from '../ProgressRing.module.scss';
import { type ProgressRingProps } from '../types/ProgressRingProps';

const RING_SIZE = { sm: 14, md: 16 };
const STROKE_WIDTH = 2;
const INDETERMINATE_PERCENTAGE = 25;

export const ProgressRingIndicator = ({
  size,
}: Required<Pick<ProgressRingProps, 'size'>>) => {
  const diameter = RING_SIZE[size];
  const radius = (diameter - STROKE_WIDTH) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <Progress.Indicator
      className={styles.ring}
      aria-hidden="true"
      render={(indicatorProps) => {
        const percentage = getProgressIndicatorPercentage({
          width: indicatorProps.style?.width,
          fallbackPercentage: INDETERMINATE_PERCENTAGE,
        });

        return (
          <div
            {...indicatorProps}
            style={{
              ...indicatorProps.style,
              width: diameter,
              height: diameter,
            }}
          >
            <svg
              width={diameter}
              height={diameter}
              viewBox={`0 0 ${diameter} ${diameter}`}
              aria-hidden="true"
              focusable="false"
            >
              <circle
                className={styles.track}
                cx={diameter / 2}
                cy={diameter / 2}
                r={radius}
                strokeWidth={STROKE_WIDTH}
              />
              <circle
                className={styles.indicator}
                cx={diameter / 2}
                cy={diameter / 2}
                r={radius}
                strokeWidth={STROKE_WIDTH}
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - percentage / 100)}
                strokeLinecap={percentage === 0 ? 'butt' : 'round'}
              />
            </svg>
          </div>
        );
      }}
    />
  );
};
