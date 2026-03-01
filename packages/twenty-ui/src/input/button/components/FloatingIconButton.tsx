import { styled } from '@linaria/react';
import { type IconComponent } from '@ui/display';
import { ThemeContext, themeCssVariables } from '@ui/theme';
import React, { useContext } from 'react';

export type FloatingIconButtonSize = 'small' | 'medium';
export type FloatingIconButtonPosition =
  | 'standalone'
  | 'left'
  | 'middle'
  | 'right';

export type FloatingIconButtonProps = {
  className?: string;
  Icon?: IconComponent;
  size?: FloatingIconButtonSize;
  position?: FloatingIconButtonPosition;
  applyShadow?: boolean;
  applyBlur?: boolean;
  disabled?: boolean;
  focus?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  isActive?: boolean;
};
const StyledButton = styled.button<
  Pick<
    FloatingIconButtonProps,
    'size' | 'position' | 'applyShadow' | 'applyBlur' | 'focus' | 'isActive'
  >
>`
  align-items: center;
  backdrop-filter: ${({ applyBlur }) =>
    applyBlur ? themeCssVariables.blur.medium : 'none'};
  background: ${({ isActive }) =>
    isActive
      ? themeCssVariables.background.transparent.medium
      : themeCssVariables.background.primary};
  border: ${({ focus }) =>
    focus
      ? `1px solid ${themeCssVariables.color.blue}`
      : `1px solid ${themeCssVariables.border.color.strong}`};
  border-radius: ${({ position }) => {
    switch (position) {
      case 'left':
        return `${themeCssVariables.border.radius.sm} 0px 0px ${themeCssVariables.border.radius.sm}`;
      case 'right':
        return `0px ${themeCssVariables.border.radius.sm} ${themeCssVariables.border.radius.sm} 0px`;
      case 'middle':
        return '0px';
      case 'standalone':
        return themeCssVariables.border.radius.sm;
    }
    return '';
  }};
  box-shadow: ${({ applyShadow, focus }) =>
    applyShadow
      ? themeCssVariables.boxShadow.light
      : focus
        ? `0 0 0 3px ${themeCssVariables.color.blue3}`
        : 'none'};
  box-sizing: border-box;
  color: ${({ disabled, focus }) => {
    return !disabled
      ? focus
        ? themeCssVariables.color.blue
        : themeCssVariables.font.color.tertiary
      : themeCssVariables.font.color.extraLight;
  }};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  flex-direction: row;

  font-family: ${themeCssVariables.font.family};
  font-weight: ${themeCssVariables.font.weight.regular};
  gap: ${themeCssVariables.spacing[1]};
  justify-content: center;
  padding: 0;
  position: relative;
  transition: background
    calc(${themeCssVariables.animation.duration.instant} * 1s) ease;
  white-space: nowrap;

  height: ${({ position, size }) =>
    (size === 'small' ? 24 : 32) - (position === 'standalone' ? 0 : 4)}px;
  width: ${({ position, size }) =>
    (size === 'small' ? 24 : 32) - (position === 'standalone' ? 0 : 4)}px;

  &:hover {
    background: ${({ disabled }) =>
      !disabled
        ? themeCssVariables.background.transparent.lighter
        : 'transparent'};
  }

  &:active {
    background: ${({ disabled }) =>
      !disabled
        ? themeCssVariables.background.transparent.medium
        : 'transparent'};
  }

  &:focus {
    outline: none;
  }
`;

export const FloatingIconButton = ({
  className,
  Icon,
  size = 'small',
  position = 'standalone',
  applyShadow = true,
  applyBlur = true,
  disabled = false,
  focus = false,
  onClick,
  isActive,
}: FloatingIconButtonProps) => {
  const { theme } = useContext(ThemeContext);
  return (
    <StyledButton
      disabled={disabled}
      focus={focus && !disabled}
      size={size}
      applyShadow={applyShadow}
      applyBlur={applyBlur}
      className={className}
      position={position}
      onClick={onClick}
      isActive={isActive}
    >
      {Icon && <Icon size={theme.icon.size.md} />}
    </StyledButton>
  );
};
