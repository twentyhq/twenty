import React from 'react';
import { type IconComponent } from '@ui/icon/types/IconComponent';
import { type ClickOutsideAttributes } from '@ui/utilities/types/ClickOutsideAttributes';
import { type ButtonSize } from './ButtonSize';
import { type ButtonPosition } from './ButtonPosition';
import { type ButtonVariant } from './ButtonVariant';
import { type ButtonAccent } from './ButtonAccent';

export type ButtonProps = {
  id?: string;
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
  ariaExpanded?: boolean;
  isLoading?: boolean;
} & Pick<React.ComponentProps<'button'>, 'type'> &
  ClickOutsideAttributes;
