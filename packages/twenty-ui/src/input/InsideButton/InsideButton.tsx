import { clsx } from 'clsx';
import React, { useContext } from 'react';

import { type IconComponent } from '@ui/icon';
import { ThemeContext } from '@ui/theme-constants';

import styles from './InsideButton.module.scss';

export type InsideButtonProps = {
  className?: string;
  Icon?: IconComponent;
  ariaLabel?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
};

export const InsideButton = ({
  className,
  Icon,
  ariaLabel,
  onClick,
  disabled = false,
}: InsideButtonProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <button
      className={clsx(styles.button, className)}
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      data-disabled={disabled || undefined}
    >
      {Icon && <Icon size={theme.icon.size.sm} aria-hidden={!!ariaLabel} />}
    </button>
  );
};
