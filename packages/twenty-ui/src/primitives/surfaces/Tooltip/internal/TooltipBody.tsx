import { type ReactNode } from 'react';

import { isRenderableSlot } from '@ui/utilities/internal/isRenderableSlot';

import styles from '../Tooltip.module.scss';

type TooltipBodyProps = {
  children: ReactNode;
  description?: ReactNode;
  startIcon?: ReactNode;
};

export const TooltipBody = ({
  children,
  description,
  startIcon,
}: TooltipBodyProps) => (
  <div className={styles.content}>
    {isRenderableSlot(children) && (
      <div className={styles.title}>
        {isRenderableSlot(startIcon) && (
          <span className={styles.icon} aria-hidden>
            {startIcon}
          </span>
        )}
        <span>{children}</span>
      </div>
    )}
    {isRenderableSlot(description) && (
      <div className={styles.description}>{description}</div>
    )}
  </div>
);
