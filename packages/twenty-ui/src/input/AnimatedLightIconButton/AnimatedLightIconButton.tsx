import { clsx } from 'clsx';
import { type ComponentProps, type MouseEvent } from 'react';

import { type IconComponent } from '@ui/icon';
import {
  type LightIconButtonAccent,
  type LightIconButtonSize,
} from '@ui/input/LightIconButton/LightIconButton';
import { useTheme } from '@ui/theme-constants';

import styles from './AnimatedLightIconButton.module.scss';

export type AnimatedLightIconButtonProps = {
  className?: string;
  testId?: string;
  Icon?: IconComponent;
  title?: string;
  size?: LightIconButtonSize;
  accent?: LightIconButtonAccent;
  active?: boolean;
  disabled?: boolean;
  focus?: boolean;
  rotate?: number;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
} & Pick<ComponentProps<'button'>, 'aria-label' | 'title'>;

export const AnimatedLightIconButton = ({
  'aria-label': ariaLabel,
  className,
  testId,
  Icon,
  active = false,
  size = 'small',
  accent = 'secondary',
  disabled = false,
  focus = false,
  rotate,
  onClick,
  title,
}: AnimatedLightIconButtonProps) => {
  const theme = useTheme();

  return (
    <button
      data-testid={testId}
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      data-disabled={disabled || undefined}
      data-focus={(focus && !disabled) || undefined}
      data-accent={accent}
      data-active={active || undefined}
      className={clsx(styles.button, styles[size], className)}
      title={title}
    >
      <div
        className={styles.iconContainer}
        style={
          rotate !== undefined
            ? { transform: `rotate(${rotate}deg)` }
            : undefined
        }
      >
        {Icon && (
          <Icon
            size={size === 'medium' ? theme.icon.size.md : theme.icon.size.sm}
            aria-hidden={!!ariaLabel}
          />
        )}
      </div>
    </button>
  );
};
