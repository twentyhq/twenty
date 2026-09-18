import { clsx } from 'clsx';
import React from 'react';
import { type RoundedIconButtonSize } from './types/RoundedIconButtonSize';

import { type IconComponent } from '@ui/icon';
import { useTheme } from '@ui/theme-constants';

import styles from './RoundedIconButton.module.scss';

type RoundedIconButtonProps = {
  Icon: IconComponent;
  size?: RoundedIconButtonSize;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const RoundedIconButton = ({
  Icon,
  onClick,
  disabled,
  className,
  size = 'small',
  'aria-label': ariaLabel,
}: RoundedIconButtonProps) => {
  const theme = useTheme();

  return (
    <button
      className={clsx(styles.button, styles[size], className)}
      disabled={disabled}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      <Icon size={theme.icon.size.md} aria-hidden={!!ariaLabel} />
    </button>
  );
};
