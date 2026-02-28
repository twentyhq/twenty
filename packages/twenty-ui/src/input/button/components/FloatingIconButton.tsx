import { styled } from '@linaria/react';
import { type IconComponent } from '@ui/display';
import { ThemeContext, themeVar } from '@ui/theme';
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
    applyBlur ? themeVar.blur.medium : 'none'};
  background: ${({ isActive }) =>
    isActive
      ? themeVar.background.transparent.medium
      : themeVar.background.primary};
  border: ${({ focus }) =>
    focus
      ? `1px solid ${themeVar.color.blue}`
      : `1px solid ${themeVar.border.color.strong}`};
  border-radius: ${({ position }) => {
    switch (position) {
      case 'left':
        return `${themeVar.border.radius.sm} 0px 0px ${themeVar.border.radius.sm}`;
      case 'right':
        return `0px ${themeVar.border.radius.sm} ${themeVar.border.radius.sm} 0px`;
      case 'middle':
        return '0px';
      case 'standalone':
        return themeVar.border.radius.sm;
    }
    return '';
  }};
  box-shadow: ${({ applyShadow, focus }) =>
    applyShadow
      ? themeVar.boxShadow.light
      : focus
        ? `0 0 0 3px ${themeVar.color.blue3}`
        : 'none'};
  box-sizing: border-box;
  color: ${({ disabled, focus }) => {
    return !disabled
      ? focus
        ? themeVar.color.blue
        : themeVar.font.color.tertiary
      : themeVar.font.color.extraLight;
  }};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  flex-direction: row;

  font-family: ${themeVar.font.family};
  font-weight: ${themeVar.font.weight.regular};
  gap: ${themeVar.spacing[1]};
  justify-content: center;
  padding: 0;
  position: relative;
  transition: background ${themeVar.animation.duration.instant}s ease;
  white-space: nowrap;

  height: ${({ position, size }) =>
    (size === 'small' ? 24 : 32) - (position === 'standalone' ? 0 : 4)}px;
  width: ${({ position, size }) =>
    (size === 'small' ? 24 : 32) - (position === 'standalone' ? 0 : 4)}px;

  &:hover {
    background: ${({ disabled }) =>
      !disabled ? themeVar.background.transparent.lighter : 'transparent'};
  }

  &:active {
    background: ${({ disabled }) =>
      !disabled ? themeVar.background.transparent.medium : 'transparent'};
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
