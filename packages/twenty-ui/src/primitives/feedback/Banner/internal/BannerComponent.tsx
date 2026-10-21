import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';

import { Button } from '@ui/primitives/input/Button/Button';
import { IconX } from '@ui/icon/components/TablerIcons';
import { doNotTranslate } from '@ui/utilities/internal/doNotTranslate';
import { isDefined } from '@ui/utilities/utils/isDefined';

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
  onDismiss,
  closeLabel = doNotTranslate('Close'),
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
      className: clsx(
        styles.banner,
        isDefined(onDismiss) && styles.dismissible,
        className,
      ),
      children: (
        <>
          {isRenderableSlot(icon) && (
            <span className={styles.icon}>{icon}</span>
          )}
          {children}
          {isRenderableSlot(action) && (
            <div className={styles.action}>{action}</div>
          )}
          {isDefined(onDismiss) && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              color="inherit"
              className={styles.closeButton}
              aria-label={closeLabel}
              onClick={onDismiss}
              startIcon={<IconX aria-hidden="true" />}
            />
          )}
        </>
      ),
    },
  });
};
