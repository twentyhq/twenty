import { useRender } from '@base-ui/react/use-render';
import { isNonEmptyString } from '@sniptt/guards';
import { clsx } from 'clsx';
import { useId } from 'react';

import { ProgressRing } from '@ui/primitives/feedback/ProgressRing/ProgressRing';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './MetricRow.module.scss';
import { type MetricRowProps } from './types/MetricRowProps';

export const MetricRow = ({
  children,
  startIcon,
  value,
  progress,
  progressColor,
  progressValueText,
  render,
  ref,
  className,
  ...props
}: MetricRowProps) => {
  const labelId = useId();
  const accessibleValueText = progressValueText ?? value;

  return useRender({
    render,
    ref,
    props: {
      ...props,
      className: clsx(styles.row, className),
      children: (
        <>
          <div className={styles.label}>
            {isDefined(startIcon) && (
              <span className={styles.icon} aria-hidden="true">
                {startIcon}
              </span>
            )}
            <span id={labelId}>{children}</span>
          </div>
          {isDefined(progress) ? (
            <ProgressRing
              value={progress}
              size="sm"
              barColor={progressColor}
              aria-labelledby={labelId}
              {...(isNonEmptyString(accessibleValueText)
                ? { 'aria-valuetext': accessibleValueText }
                : {})}
            >
              {value}
            </ProgressRing>
          ) : (
            <span>{value}</span>
          )}
        </>
      ),
    },
  });
};
