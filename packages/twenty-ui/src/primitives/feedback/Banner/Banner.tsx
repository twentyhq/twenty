import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';

import { isRenderableSlot } from '@ui/utilities/internal/isRenderableSlot';

import styles from './Banner.module.scss';
import { type BannerColor } from './types/BannerColor';
import { type BannerProps } from './types/BannerProps';
import { type BannerStatus } from './types/BannerStatus';

const BANNER_STATUS_COLORS = {
  neutral: 'gray',
  info: 'blue',
  success: 'green',
  warning: 'orange',
  error: 'red',
} satisfies Record<BannerStatus, BannerColor>;

export const Banner = ({
  status = 'info',
  variant = 'solid',
  color = BANNER_STATUS_COLORS[status],
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
