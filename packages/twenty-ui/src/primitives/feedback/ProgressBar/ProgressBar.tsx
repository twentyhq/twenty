import { isFunction, isNonEmptyString } from '@sniptt/guards';
import { type CSSProperties } from 'react';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import { getProgressIndicatorPercentage } from '../Progress/internal/getProgressIndicatorPercentage';
import { Progress } from '../Progress/Progress';

import styles from './ProgressBar.module.scss';
import { type ProgressBarProps } from './types/ProgressBarProps';

export const ProgressBar = ({
  size = 'md',
  className,
  style,
  children,
  barColor,
  backgroundColor = 'none',
  withBorderRadius = false,
  withMinimumFillWidth = true,
  ...props
}: ProgressBarProps) => (
  <Progress.Root
    {...props}
    className={mergeClassNames(styles.bar, className)}
    data-size={size}
    data-with-border-radius={withBorderRadius || undefined}
    style={(state) =>
      ({
        '--progress-bar-background-color': backgroundColor,
        ...(isNonEmptyString(barColor)
          ? { '--progress-bar-color': barColor }
          : {}),
        ...(isFunction(style) ? style(state) : style),
      }) as CSSProperties
    }
  >
    <Progress.Track className={styles.track}>
      <Progress.Indicator
        className={styles.indicator}
        data-with-border-radius={withBorderRadius || undefined}
        render={(indicatorProps) => {
          const percentage = getProgressIndicatorPercentage({
            width: indicatorProps.style?.width,
            fallbackPercentage: 0,
          });
          const hasMinimumFill =
            withMinimumFillWidth && percentage > 0 && percentage < 100;

          return (
            <div
              {...indicatorProps}
              data-minimum-fill={hasMinimumFill || undefined}
            />
          );
        }}
      />
    </Progress.Track>
    {children}
  </Progress.Root>
);
