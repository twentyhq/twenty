import { clsx } from 'clsx';
import { type MouseEvent, useContext } from 'react';

import { type IconComponent } from '@ui/display';
import { ThemeContext } from '@ui/theme-constants';

import styles from './LightButton.module.scss';

export type LightButtonAccent = 'secondary' | 'tertiary';

export type LightButtonProps = {
  className?: string;
  Icon?: IconComponent;
  title?: string;
  accent?: LightButtonAccent;
  active?: boolean;
  disabled?: boolean;
  focus?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  type?: React.ComponentProps<'button'>['type'];
};

export const LightButton = ({
  className,
  Icon,
  title,
  active = false,
  accent = 'secondary',
  disabled = false,
  focus = false,
  type = 'button',
  onClick,
}: LightButtonProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={clsx(styles.button, className)}
      data-accent={accent}
      data-active={active || undefined}
      data-disabled={disabled || undefined}
      data-focus={(focus && !disabled) || undefined}
    >
      {!!Icon && <Icon size={theme.icon.size.md} />}
      {title}
    </button>
  );
};
