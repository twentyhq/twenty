import { clsx } from 'clsx';
import { type AnimatedLightIconButtonProps } from './types/AnimatedLightIconButtonProps';

import { useTheme } from '@ui/theme-constants';

import styles from './AnimatedLightIconButton.module.scss';

export const AnimatedLightIconButton = ({
  'aria-label': ariaLabel,
  className,
  testId,
  Icon,
  active = false,
  size = 'small',
  accent = 'secondary',
  disabled = false,
  focus = false,
  rotate,
  onClick,
  title,
}: AnimatedLightIconButtonProps) => {
  const theme = useTheme();

  return (
    <button
      data-testid={testId}
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      data-disabled={disabled || undefined}
      data-focus={(focus && !disabled) || undefined}
      data-accent={accent}
      data-active={active || undefined}
      className={clsx(styles.button, styles[size], className)}
      title={title}
    >
      <div
        className={styles.iconContainer}
        style={
          rotate !== undefined
            ? { transform: `rotate(${rotate}deg)` }
            : undefined
        }
      >
        {Icon && (
          <Icon
            size={size === 'medium' ? theme.icon.size.md : theme.icon.size.sm}
            aria-hidden={!!ariaLabel}
          />
        )}
      </div>
    </button>
  );
};
