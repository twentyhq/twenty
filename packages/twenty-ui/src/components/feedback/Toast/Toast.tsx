import { useRender } from '@base-ui/react/use-render';
import { isUndefined } from '@sniptt/guards';
import { clsx } from 'clsx';
import { type FocusEvent, type MouseEvent, useState } from 'react';

import {
  IconAlertTriangle,
  IconInfoCircle,
  IconSquareRoundedCheck,
  IconX,
} from '@ui/icon';
import { Button } from '@ui/primitives/input/Button/Button';
import { Separator } from '@ui/primitives/layout/Separator/Separator';
import { useTheme } from '@ui/theme';
import { isRenderableSlot } from '@ui/utilities/internal/isRenderableSlot';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './Toast.module.scss';
import { ToastProgress } from './internal/components/ToastProgress';
import { type ToastProps } from './types/ToastProps';
import { type ToastStatus } from './types/ToastStatus';

const TOAST_ICONS = {
  neutral: IconAlertTriangle,
  error: IconAlertTriangle,
  success: IconSquareRoundedCheck,
  info: IconInfoCircle,
  warning: IconAlertTriangle,
} satisfies Record<ToastStatus, typeof IconAlertTriangle>;

export const Toast = ({
  children,
  description,
  icon,
  iconLabel,
  action,
  progress,
  duration = 6000,
  onCancel,
  onClose,
  cancelLabel = 'Cancel',
  closeLabel = 'Close',
  status = 'neutral',
  role = 'status',
  className,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  render,
  ref,
  ...props
}: ToastProps) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const Icon = TOAST_ICONS[status];
  const toastColors = theme.snackBar[status === 'neutral' ? 'default' : status];
  const toastIcon = isUndefined(icon) ? (
    <Icon
      aria-label={iconLabel}
      aria-hidden={!isDefined(iconLabel)}
      color={toastColors.color}
      size={theme.icon.size.md}
    />
  ) : (
    icon
  );

  return useRender({
    render,
    ref,
    props: {
      role,
      'aria-live': role === 'alert' ? 'assertive' : 'polite',
      ...props,
      className: clsx(styles.root, className),
      onMouseEnter: (event: MouseEvent<HTMLDivElement>) => {
        setIsHovered(true);
        onMouseEnter?.(event);
      },
      onMouseLeave: (event: MouseEvent<HTMLDivElement>) => {
        setIsHovered(false);
        onMouseLeave?.(event);
      },
      onFocus: (event: FocusEvent<HTMLDivElement>) => {
        setIsFocused(true);
        onFocus?.(event);
      },
      onBlur: (event: FocusEvent<HTMLDivElement>) => {
        const isFocusInsideToast = event.currentTarget.contains(
          event.relatedTarget,
        );

        if (!isFocusInsideToast) {
          setIsFocused(false);
        }

        onBlur?.(event);
      },
      children: (
        <>
          <div className={styles.progress} aria-hidden>
            <ToastProgress
              barColor={toastColors.backgroundColor}
              progress={progress}
              duration={duration}
              isPaused={isHovered || isFocused}
              onClose={onClose}
            />
          </div>
          <div className={styles.header}>
            {isRenderableSlot(toastIcon) && (
              <div className={styles.icon}>{toastIcon}</div>
            )}
            <div className={styles.message}>{children}</div>
            <div className={styles.actions}>
              {isDefined(onCancel) && isRenderableSlot(cancelLabel) && (
                <Button
                  onClick={onCancel}
                  size="sm"
                  variant="ghost"
                  style={{ fontWeight: 'var(--t-font-weight-regular)' }}
                >
                  {cancelLabel}
                </Button>
              )}
              {isDefined(onClose) && (
                <Button
                  title={closeLabel}
                  aria-label={closeLabel}
                  startIcon={<IconX />}
                  className={styles.closeButton}
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                />
              )}
            </div>
          </div>
          {isRenderableSlot(description) && (
            <div className={styles.description}>{description}</div>
          )}
          {isRenderableSlot(action) && (
            <div className={styles.footer}>
              <Separator />
              <div className={styles.footerAction}>{action}</div>
            </div>
          )}
        </>
      ),
    },
  });
};
