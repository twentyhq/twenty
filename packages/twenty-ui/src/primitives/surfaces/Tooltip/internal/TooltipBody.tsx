import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';

import { isRenderableSlot } from '@ui/utilities/internal/isRenderableSlot';

import styles from '../Tooltip.module.scss';
import { type TooltipBodyProps } from '../types/TooltipBodyProps';

export const TooltipBody = ({
  children,
  description,
  startIcon,
  className,
  render,
  ref,
  ...props
}: TooltipBodyProps) =>
  useRender({
    render,
    ref,
    props: {
      ...props,
      className: clsx(styles.content, className),
      children: (
        <>
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
        </>
      ),
    },
  });
