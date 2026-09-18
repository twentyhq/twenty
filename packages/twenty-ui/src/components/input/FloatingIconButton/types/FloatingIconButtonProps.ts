import { type IconComponent } from '@ui/icon';
import React from 'react';
import { type FloatingIconButtonPosition } from './FloatingIconButtonPosition';
import { type FloatingIconButtonSize } from './FloatingIconButtonSize';

export type FloatingIconButtonProps = {
  className?: string;
  Icon?: IconComponent;
  ariaLabel?: string;
  size?: FloatingIconButtonSize;
  position?: FloatingIconButtonPosition;
  applyShadow?: boolean;
  applyBlur?: boolean;
  disabled?: boolean;
  focus?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  isActive?: boolean;
};
