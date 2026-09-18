import { type IconComponent } from '@ui/icon';
import { type ButtonProps } from '@ui/primitives/input/Button/types/ButtonProps';
import { type FloatingButtonPosition } from './FloatingButtonPosition';
import { type FloatingButtonSize } from './FloatingButtonSize';

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
  href?: string;
  render?: ButtonProps['render'];
  onClick?: ButtonProps['onClick'];
};
