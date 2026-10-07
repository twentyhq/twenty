import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';

import { IconHelp, IconX } from '@ui/icon/components/TablerIcons';
import { Button } from '@ui/primitives/input/Button/Button';
import { FEEDBACK_STATUS_COLORS } from '@ui/primitives/feedback/internal/constants/FeedbackStatusColors';
import { isRenderableSlot } from '@ui/utilities/internal/isRenderableSlot';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './Callout.module.scss';
import { type CalloutProps } from './types/CalloutProps';

export const Callout = ({
  status = 'info',
  variant = 'soft',
  color = FEEDBACK_STATUS_COLORS[status],
  title,
  description,
  fullWidth = false,
  icon = <IconHelp size={16} aria-hidden="true" />,
  action,
  closeLabel = 'Close',
  onDismiss,
  className,
  render,
  ref,
  ...props
}: CalloutProps) => {
  const hasIcon = isRenderableSlot(icon);
  const hasAction = isRenderableSlot(action);

  return useRender({
    render,
    ref,
    state: { status, variant, color },
    props: {
      ...props,
      className: clsx(
        styles.container,
        fullWidth && styles.containerFullWidth,
        className,
      ),
      children: (
        <>
          <div className={styles.header}>
            {hasIcon && <div className={styles.iconContainer}>{icon}</div>}
            <div className={styles.title}>{title}</div>
            {isDefined(onDismiss) && (
              <Button
                type="button"
                startIcon={<IconX aria-hidden="true" />}
                className={styles.closeButton}
                variant="ghost"
                size="sm"
                aria-label={closeLabel}
                onClick={() => onDismiss()}
              />
            )}
          </div>
          {isRenderableSlot(description) && (
            <div
              className={clsx(
                styles.descriptionWrapper,
                hasIcon && styles.descriptionWrapperWithIcon,
                hasAction && styles.descriptionWrapperWithAction,
              )}
            >
              <div className={styles.description}>{description}</div>
            </div>
          )}
          {hasAction && <div className={styles.footer}>{action}</div>}
        </>
      ),
    },
  });
};
