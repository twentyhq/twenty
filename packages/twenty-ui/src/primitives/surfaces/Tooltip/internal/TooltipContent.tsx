import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';

import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from '../Tooltip.module.scss';
import { type TooltipContentProps } from '../types/TooltipContentProps';

export const TooltipContent = ({
  children,
  description,
  startIcon,
  className,
  render,
  ref,
  ...props
}: TooltipContentProps) =>
  useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...props,
      className: clsx(styles.content, className),
      children: (
        <>
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
        </>
      ),
    },
  });
