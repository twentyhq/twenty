import { Progress } from '@base-ui/react/progress';
import { clsx } from 'clsx';
import { type CSSProperties } from 'react';

import { isRenderableSlot } from '@ui/utilities/internal/isRenderableSlot';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './ProgressRing.module.scss';
import { type ProgressRingProps } from './types/ProgressRingProps';

const RING_SIZE = { sm: 14, md: 16 };
const STROKE_WIDTH = 2;

export const ProgressRing = ({
  value,
  size = 'md',
  barColor,
  children,
  className,
  style,
  ...props
}: ProgressRingProps) => {
  const boundedValue = Number.isNaN(value)
    ? 0
    : Math.min(Math.max(value, 0), 100);
  const diameter = RING_SIZE[size];
  const radius = (diameter - STROKE_WIDTH) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <Progress.Root
      {...props}
      value={boundedValue}
      min={0}
      max={100}
      className={clsx(styles.root, className)}
      style={
        {
          ...(isDefined(barColor) ? { '--progress-ring-color': barColor } : {}),
          ...style,
        } as CSSProperties
      }
    >
      {isRenderableSlot(children) && <span>{children}</span>}
      <svg
        className={styles.ring}
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
          strokeDashoffset={
            circumference - (boundedValue / 100) * circumference
          }
          strokeLinecap="round"
        />
      </svg>
    </Progress.Root>
  );
};
