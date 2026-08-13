import { clsx } from 'clsx';
import { type ComponentProps, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';

import { type IconComponent } from '@ui/icon';
import { useTheme } from '@ui/theme-constants';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './LightIconButton.module.scss';

export type LightIconButtonAccent = 'secondary' | 'tertiary';
export type LightIconButtonSize = 'small' | 'medium';

export type LightIconButtonProps = {
  className?: string;
  testId?: string;
  Icon?: IconComponent;
  size?: LightIconButtonSize;
  accent?: LightIconButtonAccent;
  active?: boolean;
  disabled?: boolean;
  focus?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  to?: string;
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
  to,
  title,
}: LightIconButtonProps) => {
  const theme = useTheme();
  const buttonClassName = clsx(styles.button, styles[size], className);
  const icon = Icon && (
    <Icon
      size={size === 'medium' ? theme.icon.size.md : theme.icon.size.sm}
      aria-hidden={!!ariaLabel}
    />
  );

  if (isDefined(to) && !disabled) {
    return (
      <Link
        data-testid={testId}
        aria-label={ariaLabel}
        className={buttonClassName}
        data-accent={accent}
        data-active={active || undefined}
        data-focus={focus || undefined}
        title={title}
        to={to}
      >
        {icon}
      </Link>
    );
  }

  return (
    <button
      data-testid={testId}
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      className={buttonClassName}
      data-accent={accent}
      data-active={active || undefined}
      data-disabled={disabled || undefined}
      data-focus={(focus && !disabled) || undefined}
      title={title}
    >
      {icon}
    </button>
  );
};
