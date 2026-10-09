import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';

import { FEEDBACK_STATUS_COLORS } from '@ui/primitives/feedback/internal/constants/FeedbackStatusColors';
import { isRenderableSlot } from '@ui/utilities/internal/isRenderableSlot';

import styles from '../Banner.module.scss';
import { type BannerProps } from '../types/BannerProps';

export const BannerComponent = ({
  status = 'info',
  variant = 'solid',
  color = FEEDBACK_STATUS_COLORS[status],
  icon,
  action,
  className,
  children,
  render,
  ref,
  ...props
}: BannerProps) => {
  return useRender({
    render,
    ref,
    state: { status, variant, color },
    props: {
      ...props,
      className: clsx(styles.banner, className),
      children: (
        <>
          {isRenderableSlot(icon) && (
            <span className={styles.icon}>{icon}</span>
          )}
          {children}
          {isRenderableSlot(action) && (
            <div className={styles.action}>{action}</div>
          )}
        </>
      ),
    },
  });
};
