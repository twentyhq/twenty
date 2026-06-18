import { clsx } from 'clsx';
import React, { useContext } from 'react';

import { type IconComponent } from '@ui/icon';
import { ThemeContext } from '@ui/theme-constants';

import styles from './FloatingIconButton.module.scss';

export type FloatingIconButtonSize = 'small' | 'medium';
export type FloatingIconButtonPosition =
  | 'standalone'
  | 'left'
  | 'middle'
  | 'right';

export type FloatingIconButtonProps = {
  className?: string;
  Icon?: IconComponent;
  ariaLabel?: string;
  size?: FloatingIconButtonSize;
  position?: FloatingIconButtonPosition;
  applyShadow?: boolean;
  applyBlur?: boolean;
  disabled?: boolean;
  focus?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  isActive?: boolean;
};

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
  const { theme } = useContext(ThemeContext);

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
      {Icon && <Icon size={theme.icon.size.md} />}
    </button>
  );
};
