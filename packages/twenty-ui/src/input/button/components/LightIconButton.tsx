import { clsx } from 'clsx';
import { type ComponentProps, type MouseEvent, useContext } from 'react';

import { type IconComponent } from '@ui/display';
import { ThemeContext } from '@ui/theme-constants';

import styles from './LightIconButton.module.scss';

export type LightIconButtonAccent = 'secondary' | 'tertiary';
export type LightIconButtonSize = 'small' | 'medium';

export type LightIconButtonProps = {
  className?: string;
  testId?: string;
  Icon?: IconComponent;
  title?: string;
  size?: LightIconButtonSize;
  accent?: LightIconButtonAccent;
  active?: boolean;
  disabled?: boolean;
  focus?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
} & Pick<ComponentProps<'button'>, 'aria-label' | 'title'>;

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
  const { theme } = useContext(ThemeContext);

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
        />
      )}
    </button>
  );
};
