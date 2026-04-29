import { type IconComponent } from '@ui/display/icon/types/IconComponent';
import { type ClickOutsideAttributes } from '@ui/utilities/types/ClickOutsideAttributes';
import React from 'react';

export type ButtonSize = 'medium' | 'small';
export type ButtonPosition = 'standalone' | 'left' | 'middle' | 'right';
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary';
export type ButtonAccent = 'default' | 'blue' | 'danger';

export type ButtonProps = {
  className?: string;
  Icon?: IconComponent;
  title?: string;
  fullWidth?: boolean;
  variant?: ButtonVariant;
  inverted?: boolean;
  size?: ButtonSize;
  position?: ButtonPosition;
  accent?: ButtonAccent;
  soon?: boolean;
  justify?: 'center' | 'flex-start' | 'flex-end';
  disabled?: boolean;
  focus?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  to?: string;
  target?: string;
  dataTestId?: string;
  hotkeys?: string[];
  ariaLabel?: string;
  isLoading?: boolean;
} & Pick<React.ComponentProps<'button'>, 'type'> &
  ClickOutsideAttributes;

export type ButtonDynamicStyles = {
  background: string;
  borderColor: string;
  borderWidthOverride: string;
  boxShadow: string;
  color: string;
  hoverBackground: string;
  activeBackground: string;
};
