import { clsx } from 'clsx';
import { type LightIconButtonProps } from './types/LightIconButtonProps';

import { useTheme } from '@ui/theme-constants';

import styles from './LightIconButton.module.scss';

export const LightIconButton = ({
  'aria-label': ariaLabel,
  className,
  testId,
  Icon,
  active = false,
  size = 'small',
  accent = 'secondary',
  disabled = false,
  focus = false,
  onClick,
  title,
}: LightIconButtonProps) => {
  const theme = useTheme();

  return (
    <button
      data-testid={testId}
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      className={clsx(styles.button, styles[size], className)}
      data-accent={accent}
      data-active={active || undefined}
      data-disabled={disabled || undefined}
      data-focus={(focus && !disabled) || undefined}
      title={title}
    >
      {Icon && (
        <Icon
          size={size === 'medium' ? theme.icon.size.md : theme.icon.size.sm}
          aria-hidden={!!ariaLabel}
        />
      )}
    </button>
  );
};
