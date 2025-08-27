import { useTheme } from '@emotion/react';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { type IconComponent } from '@ui/display';
import React from 'react';

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

// TODO: CharlesFix this
const StyledButton = styled('button')<
  Pick<
    FloatingIconButtonProps,
    'size' | 'position' | 'applyShadow' | 'applyBlur' | 'focus' | 'isActive'
  >
>`
  align-items: center;
  backdrop-filter: ${({ applyBlur }) => (applyBlur ? 'blur(20px)' : 'none')};
  background: ${({ isActive }) =>
    isActive
      ? 'var(--background-transparent-medium)'
      : 'var(--background-primary)'};
  border: ${({ focus }) =>
    focus
      ? `1px solid var(--font-color-blue)`
      : `1px solid var(--border-color-strong)`};
  border-radius: ${({ position }) => {
    switch (position) {
      case 'left':
        return `var(--border-radius-sm) 0px 0px var(--border-radius-sm)`;
      case 'right':
        return `0px var(--border-radius-sm) var(--border-radius-sm) 0px`;
      case 'middle':
        return '0px';
      case 'standalone':
        return 'var(--border-radius-sm)';
      default:
        return '';
    }
  }};
  box-shadow: ${({ applyShadow, focus }) =>
    applyShadow
      ? 'var(--box-shadow-light)'
      : focus
        ? `0 0 0 3px var(--accent-tertiary)`
        : 'none'};
  box-sizing: border-box;
  color: ${({ disabled, focus }) => {
    return !disabled
      ? focus
        ? 'var(--font-color-blue)'
        : 'var(--font-color-tertiary)'
      : 'var(--font-color-extra-light)';
  }};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  flex-direction: row;

  font-family: var(--font-family);
  font-weight: var(--font-weight-regular);
  gap: var(--spacing-1);
  justify-content: center;
  padding: 0;
  position: relative;
  transition: background var(--animation-duration-instant) ease;
  white-space: nowrap;

  ${({ position, size }) => {
    const sizeInPx =
      (size === 'small' ? 24 : 32) - (position === 'standalone' ? 0 : 4);

    return `
      height: ${sizeInPx}px;
      width: ${sizeInPx}px;
    `;
  }}

  ${({ disabled }) =>
    !disabled
      ? css`
          &:hover {
            background: var(--background-transparent-lighter);
          }
        `
      : css``}

  &:active {
    background: ${({ disabled }) =>
      !disabled ? 'var(--background-transparent-medium)' : 'transparent'};
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
  const theme = useTheme();
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
