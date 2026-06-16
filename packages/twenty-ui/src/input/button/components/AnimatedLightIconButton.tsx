import { clsx } from 'clsx';
import { motion, type MotionProps } from 'framer-motion';
import { type ComponentProps, type MouseEvent, useContext } from 'react';

import { type IconComponent } from '@ui/display';
import {
  type LightIconButtonAccent,
  type LightIconButtonSize,
} from '@ui/input/button/components/LightIconButton';
import { ThemeContext } from '@ui/theme-constants';

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
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
} & Pick<ComponentProps<'button'>, 'aria-label' | 'title'> &
  Pick<MotionProps, 'animate' | 'transition'>;

export const AnimatedLightIconButton = ({
  'aria-label': ariaLabel,
  className,
  testId,
  animate,
  transition,
  Icon,
  active = false,
  size = 'small',
  accent = 'secondary',
  disabled = false,
  focus = false,
  onClick,
  title,
}: AnimatedLightIconButtonProps) => {
  const { theme } = useContext(ThemeContext);

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
      <motion.div
        className={styles.iconContainer}
        animate={animate}
        transition={transition}
      >
        {Icon && (
          <Icon
            size={size === 'medium' ? theme.icon.size.md : theme.icon.size.sm}
          />
        )}
      </motion.div>
    </button>
  );
};
