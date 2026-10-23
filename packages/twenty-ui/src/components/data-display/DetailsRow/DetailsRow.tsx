import { useRender } from '@base-ui/react/use-render';
import { isNumber } from '@sniptt/guards';
import { clsx } from 'clsx';
import { type CSSProperties } from 'react';

import { isRenderableSlot } from '@ui/utilities/internal/isRenderableSlot';

import styles from './DetailsRow.module.scss';
import { type DetailsRowProps } from './types/DetailsRowProps';

export const DetailsRow = ({
  label,
  children,
  startIcon,
  action,
  labelWidth = '7rem',
  render,
  ref,
  className,
  style,
  ...props
}: DetailsRowProps) => {
  const rowStyle: CSSProperties & {
    '--details-row-label-width': string;
  } = {
    '--details-row-label-width': isNumber(labelWidth)
      ? `${labelWidth}px`
      : labelWidth,
    ...style,
  };

  return useRender({
    render,
    ref,
    props: {
      ...props,
      className: clsx(styles.row, className),
      style: rowStyle,
      children: (
        <>
          <dt className={styles.label}>
            {isRenderableSlot(startIcon) && (
              <span className={styles.icon} aria-hidden="true">
                {startIcon}
              </span>
            )}
            <span className={styles.labelText}>{label}</span>
          </dt>
          <dd className={styles.description}>
            <div className={styles.value}>{children}</div>
            {isRenderableSlot(action) && (
              <div className={styles.action}>{action}</div>
            )}
          </dd>
        </>
      ),
    },
  });
};
