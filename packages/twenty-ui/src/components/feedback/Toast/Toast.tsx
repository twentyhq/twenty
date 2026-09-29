import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';
import { type FocusEvent, type MouseEvent, useState } from 'react';

import {
  IconAlertTriangle,
  IconInfoCircle,
  IconSquareRoundedCheck,
  IconX,
} from '@ui/icon';
import { Button } from '@ui/primitives/input/Button/Button';
import { HorizontalSeparator } from '@ui/primitives/layout/HorizontalSeparator/HorizontalSeparator';
import { useTheme } from '@ui/theme';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './Toast.module.scss';
import { ToastProgress } from './internal/components/ToastProgress';
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
  onFocus,
  onBlur,
  render,
  ref,
  ...props
}: ToastProps) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
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
              barColor={theme.snackBar[variant].backgroundColor}
              progress={progress}
              duration={duration}
              isPaused={isHovered || isFocused}
              onClose={onClose}
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
