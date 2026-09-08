import { clsx } from 'clsx';
import {
  Fragment,
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentType,
  type ReactNode,
} from 'react';

import { Avatar } from '@ui/data-display/Avatar/Avatar';
import { IconChevronDown } from '@ui/icon';
import { useTheme } from '@ui/theme-constants';

import styles from './WorkspaceDropdownTrigger.module.scss';

type WorkspaceDropdownTriggerProps = ComponentPropsWithoutRef<'button'> & {
  workspaceName: string;
  avatarUrl?: string;
  hideLabel?: boolean;
  isExpanded?: boolean;
  size?: 'small' | 'medium';
  LabelWrapper?: ComponentType<{ children: ReactNode }>;
};

export const WorkspaceDropdownTrigger = forwardRef<
  HTMLButtonElement,
  WorkspaceDropdownTriggerProps
>(
  (
    {
      workspaceName,
      avatarUrl,
      hideLabel = false,
      isExpanded = true,
      size = 'small',
      LabelWrapper = Fragment,
      disabled,
      className,
      ...props
    },
    ref,
  ) => {
    const theme = useTheme();

    return (
      <button
        type="button"
        {...props}
        ref={ref}
        disabled={disabled}
        className={clsx(styles.trigger, className)}
        data-expanded={isExpanded || undefined}
        data-size={size}
      >
        <Avatar
          placeholder={workspaceName}
          avatarUrl={avatarUrl}
          size="md"
        />
        {!hideLabel && (
          <>
            <span className={styles.labelWrapper}>
              <LabelWrapper>
                <span className={styles.label}>{workspaceName}</span>
              </LabelWrapper>
            </span>
            <LabelWrapper>
              <span className={styles.chevron}>
                <IconChevronDown
                  size={theme.icon.size.md}
                  stroke={theme.icon.stroke.sm}
                  aria-hidden
                />
              </span>
            </LabelWrapper>
          </>
        )}
      </button>
    );
  },
);

WorkspaceDropdownTrigger.displayName = 'WorkspaceDropdownTrigger';
