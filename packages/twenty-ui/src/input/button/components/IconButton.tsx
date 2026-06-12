import { clsx } from 'clsx';
import React, { useContext } from 'react';

import { type IconComponent } from '@ui/display';
import { ThemeContext } from '@ui/theme-constants';

import styles from './IconButton.module.scss';

export type IconButtonSize = 'medium' | 'small';
export type IconButtonPosition = 'standalone' | 'left' | 'middle' | 'right';
export type IconButtonVariant = 'primary' | 'secondary' | 'tertiary';
export type IconButtonAccent = 'default' | 'blue' | 'danger';

export type IconButtonProps = {
  className?: string;
  Icon?: IconComponent;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  position?: IconButtonPosition;
  accent?: IconButtonAccent;
  disabled?: boolean;
  focus?: boolean;
  dataTestId?: string;
  ariaLabel?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  to?: string;
};

export const IconButton = ({
  className,
  Icon,
  variant = 'primary',
  size = 'medium',
  accent = 'default',
  position = 'standalone',
  disabled = false,
  focus = false,
  dataTestId,
  ariaLabel,
  onClick,
  to,
}: IconButtonProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <button
      data-testid={dataTestId}
      className={clsx(styles.button, styles[size], className)}
      data-variant={variant}
      data-accent={accent}
      data-position={position}
      data-disabled={disabled || undefined}
      data-focus={focus || undefined}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      // The legacy Linaria button never navigated: `to` was simply forwarded
      // to the DOM as an inert attribute. Keep forwarding it for DOM parity.
      {...{ to }}
    >
      {Icon && <Icon size={theme.icon.size.md} />}
    </button>
  );
};
