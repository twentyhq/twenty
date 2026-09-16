import React from 'react';
import { type IconComponent } from '@ui/icon';
import { type IconButtonSize } from './IconButtonSize';
import { type IconButtonPosition } from './IconButtonPosition';
import { type IconButtonVariant } from './IconButtonVariant';
import { type IconButtonAccent } from './IconButtonAccent';

export type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
  Icon?: IconComponent;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  position?: IconButtonPosition;
  accent?: IconButtonAccent;
  disabled?: boolean;
  focus?: boolean;
  dataTestId?: string;
  ariaLabel?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  to?: string;
  children?: React.ReactNode;
};
