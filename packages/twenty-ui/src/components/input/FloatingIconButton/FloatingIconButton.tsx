import { clsx } from 'clsx';
import { type FloatingIconButtonProps } from './types/FloatingIconButtonProps';

import { useTheme } from '@ui/theme-constants';

import styles from './FloatingIconButton.module.scss';

export const FloatingIconButton = ({
  className,
  Icon,
  ariaLabel,
  size = 'small',
  position = 'standalone',
  applyShadow = true,
  applyBlur = true,
  disabled = false,
  focus = false,
  onClick,
  isActive,
}: FloatingIconButtonProps) => {
  const theme = useTheme();

  return (
    <button
      disabled={disabled}
      aria-label={ariaLabel}
      className={clsx(styles.button, styles[size], className)}
      data-position={position}
      data-apply-shadow={applyShadow || undefined}
      data-apply-blur={applyBlur || undefined}
      data-disabled={disabled || undefined}
      data-focus={(focus && !disabled) || undefined}
      data-is-active={isActive || undefined}
      onClick={onClick}
    >
      {Icon && <Icon size={theme.icon.size.md} aria-hidden={!!ariaLabel} />}
    </button>
  );
};
