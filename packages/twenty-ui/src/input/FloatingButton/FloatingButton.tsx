import { clsx } from 'clsx';
import { Link } from 'react-router-dom';

import { type IconComponent } from '@ui/icon';
import { useTheme } from '@ui/theme-constants';

import styles from './FloatingButton.module.scss';

export type FloatingButtonSize = 'small' | 'medium';
export type FloatingButtonPosition = 'standalone' | 'left' | 'middle' | 'right';

export type FloatingButtonProps = {
  className?: string;
  Icon?: IconComponent;
  title?: string;
  ariaLabel?: string;
  size?: FloatingButtonSize;
  position?: FloatingButtonPosition;
  applyShadow?: boolean;
  applyBlur?: boolean;
  disabled?: boolean;
  focus?: boolean;
  to?: string;
};

export const FloatingButton = ({
  className,
  Icon,
  title,
  ariaLabel,
  size = 'small',
  position = 'standalone',
  applyBlur = true,
  applyShadow = true,
  disabled = false,
  focus = false,
  to,
}: FloatingButtonProps) => {
  const theme = useTheme();

  // Replaces the legacy Linaria `as` polymorphism: react-router Link when a
  // `to` is provided, a native button otherwise. Typed as any to forward all
  // props untyped, exactly like the legacy `as` prop did.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ButtonComponent: any = to ? Link : 'button';

  return (
    <ButtonComponent
      disabled={disabled}
      aria-label={ariaLabel}
      className={clsx(styles.button, styles[size], className)}
      data-position={position}
      data-apply-blur={applyBlur || undefined}
      data-apply-shadow={applyShadow || undefined}
      data-disabled={disabled || undefined}
      data-focus={(focus && !disabled) || undefined}
      to={to}
    >
      {Icon && <Icon size={theme.icon.size.sm} aria-hidden />}
      {title}
    </ButtonComponent>
  );
};
