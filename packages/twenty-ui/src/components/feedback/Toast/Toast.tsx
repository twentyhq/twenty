import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';
import { type MouseEvent, useState } from 'react';

import {
  IconAlertTriangle,
  IconInfoCircle,
  IconSquareRoundedCheck,
  IconX,
} from '@ui/icon';
import { ProgressBar } from '@ui/primitives/feedback/ProgressBar/ProgressBar';
import { Button } from '@ui/primitives/input/Button/Button';
import { HorizontalSeparator } from '@ui/primitives/layout/HorizontalSeparator/HorizontalSeparator';
import { useTheme } from '@ui/theme';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './Toast.module.scss';
import { type ToastProps } from './types/ToastProps';
import { type ToastVariant } from './types/ToastVariant';

const TOAST_ICONS = {
  default: IconAlertTriangle,
  error: IconAlertTriangle,
  success: IconSquareRoundedCheck,
  info: IconInfoCircle,
  warning: IconAlertTriangle,
} satisfies Record<ToastVariant, typeof IconAlertTriangle>;

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
  variant = 'default',
  role = 'status',
  className,
  onMouseEnter,
  onMouseLeave,
  render,
  ref,
  ...props
}: ToastProps) => {
  const theme = useTheme();
  const [isPaused, setIsPaused] = useState(false);
  const Icon = TOAST_ICONS[variant];

  return useRender({
    render,
    ref,
    props: {
      role,
      'aria-live': role === 'alert' ? 'assertive' : 'polite',
      ...props,
      className: clsx(styles.root, className),
      onMouseEnter: (event: MouseEvent<HTMLDivElement>) => {
        setIsPaused(true);
        onMouseEnter?.(event);
      },
      onMouseLeave: (event: MouseEvent<HTMLDivElement>) => {
        setIsPaused(false);
        onMouseLeave?.(event);
      },
      children: (
        <>
          <div className={styles.progress} aria-hidden>
            <ProgressBar
              barColor={theme.snackBar[variant].backgroundColor}
              value={progress ?? 100}
              countdownDurationInMs={isDefined(progress) ? undefined : duration}
              isCountdownPaused={isPaused}
              onCountdownComplete={onClose}
            />
          </div>
          <div className={styles.header}>
            <div className={styles.icon}>
              {icon ?? (
                <Icon
                  aria-label={iconLabel}
                  aria-hidden={!isDefined(iconLabel)}
                  color={theme.snackBar[variant].color}
                  size={theme.icon.size.md}
                />
              )}
            </div>
            <div className={styles.message}>{children}</div>
            <div className={styles.actions}>
              {isDefined(onCancel) && (
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
          {isDefined(description) && (
            <div className={styles.description}>{description}</div>
          )}
          {isDefined(action) && (
            <div className={styles.footer}>
              <HorizontalSeparator noMargin />
              <div className={styles.footerAction}>{action}</div>
            </div>
          )}
        </>
      ),
    },
  });
};
