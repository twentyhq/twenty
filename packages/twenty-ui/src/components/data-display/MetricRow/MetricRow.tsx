import { useRender } from '@base-ui/react/use-render';
import { isString } from '@sniptt/guards';
import { clsx } from 'clsx';
import { useId } from 'react';

import { ProgressRing } from '@ui/primitives/feedback/ProgressRing/ProgressRing';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './MetricRow.module.scss';
import { type MetricRowProps } from './types/MetricRowProps';

export const MetricRow = ({
  children,
  startIcon: StartIcon,
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

  return useRender({
    render,
    ref,
    props: {
      ...props,
      className: clsx(styles.row, className),
      children: (
        <>
          <div className={styles.label}>
            {isDefined(StartIcon) && <StartIcon size={14} aria-hidden={true} />}
            <span id={labelId}>{children}</span>
          </div>
          {isDefined(progress) ? (
            <ProgressRing
              value={progress}
              size="sm"
              barColor={progressColor}
              aria-labelledby={labelId}
              aria-valuetext={
                progressValueText ?? (isString(value) ? value : undefined)
              }
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
