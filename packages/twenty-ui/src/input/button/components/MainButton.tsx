import { clsx } from 'clsx';
import React, { type FunctionComponent, useContext } from 'react';

import { type IconComponent } from '@ui/display';
import { ThemeContext } from '@ui/theme-constants';

import styles from './MainButton.module.scss';

export type MainButtonVariant = 'primary' | 'secondary';

type Props = {
  title: string;
  fullWidth?: boolean;
  width?: number;
  variant?: MainButtonVariant;
  soon?: boolean;
} & React.ComponentProps<'button'>;

type MainButtonProps = Props & {
  Icon?: IconComponent | FunctionComponent<{ size: number }>;
};

export const MainButton = ({
  Icon,
  title,
  width,
  fullWidth = false,
  variant = 'primary',
  type,
  onClick,
  disabled,
  className,
}: MainButtonProps) => {
  const { theme } = useContext(ThemeContext);

  // Replicates the legacy ternary exactly: fullWidth wins over width, and a
  // falsy width (0) falls back to the 'auto' default.
  const widthValue = fullWidth ? '100%' : width ? `${width}px` : undefined;

  return (
    <button
      className={clsx(styles.button, className)}
      data-variant={variant}
      data-disabled={disabled || undefined}
      disabled={disabled}
      onClick={onClick}
      type={type}
      style={
        widthValue
          ? ({ '--main-button-width': widthValue } as React.CSSProperties)
          : undefined
      }
    >
      {Icon && <Icon size={theme.icon.size.sm} />}
      {title}
    </button>
  );
};
