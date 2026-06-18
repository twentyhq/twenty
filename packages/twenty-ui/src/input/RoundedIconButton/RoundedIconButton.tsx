import { clsx } from 'clsx';
import React, { useContext } from 'react';

import { type IconComponent } from '@ui/icon';
import { ThemeContext } from '@ui/theme-constants';

import styles from './RoundedIconButton.module.scss';

export type RoundedIconButtonSize = 'small' | 'medium';

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
}: RoundedIconButtonProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <button
      className={clsx(styles.button, styles[size], className)}
      disabled={disabled}
      onClick={onClick}
    >
      <Icon size={theme.icon.size.md} />
    </button>
  );
};
