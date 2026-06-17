import { clsx } from 'clsx';

import styles from './ProgressBar.module.scss';

export type ProgressBarProps = {
  value: number;
  className?: string;
  barColor?: string;
  backgroundColor?: string;
  withBorderRadius?: boolean;
};

export type StyledBarProps = {
  className?: string;
  backgroundColor?: string;
  withBorderRadius?: boolean;
};

const MIN_BAR_WIDTH_PX = 12;

export const ProgressBar = ({
  value,
  className,
  barColor,
  backgroundColor = 'none',
  withBorderRadius = false,
}: ProgressBarProps) => (
  <div
    className={clsx(styles.bar, className)}
    data-with-border-radius={withBorderRadius || undefined}
    role="progressbar"
    aria-valuenow={Math.ceil(value)}
    style={
      {
        '--progress-bar-background-color': backgroundColor,
      } as React.CSSProperties
    }
  >
    <div
      style={{
        height: '100%',
        minWidth: value > 0 ? MIN_BAR_WIDTH_PX : 0,
        width: `${Math.ceil(value)}%`,
        transition: 'width 0.3s linear',
      }}
    >
      <div
        className={styles.barFilling}
        data-with-border-radius={withBorderRadius || undefined}
        style={
          barColor
            ? ({ '--progress-bar-color': barColor } as React.CSSProperties)
            : undefined
        }
      />
    </div>
  </div>
);
