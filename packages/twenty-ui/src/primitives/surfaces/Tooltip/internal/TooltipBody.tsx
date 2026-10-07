import { type ReactNode } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

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
    {isDefined(children) && children !== '' && (
      <div className={styles.title}>
        {isDefined(startIcon) && (
          <span className={styles.icon} aria-hidden>
            {startIcon}
          </span>
        )}
        <span>{children}</span>
      </div>
    )}
    {isDefined(description) && (
      <div className={styles.description}>{description}</div>
    )}
  </div>
);
