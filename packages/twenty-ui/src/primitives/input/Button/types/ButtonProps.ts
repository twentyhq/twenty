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
  'data-base-ui-click-trigger'?: string;
  'data-popup-open'?: string;
  'data-pressed'?: string;
} & Pick<
  React.ComponentPropsWithRef<'button'>,
  | 'ref'
  | 'type'
  | 'role'
  | 'tabIndex'
  | 'style'
  | 'aria-label'
  | 'aria-expanded'
  | 'aria-controls'
  | 'aria-haspopup'
  | 'aria-disabled'
  | 'onFocus'
  | 'onBlur'
  | 'onKeyDown'
  | 'onKeyUp'
  | 'onMouseDown'
  | 'onMouseMove'
  | 'onMouseLeave'
  | 'onPointerDown'
  | 'onPointerEnter'
> &
  ClickOutsideAttributes;
