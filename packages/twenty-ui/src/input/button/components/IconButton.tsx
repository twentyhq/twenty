import { useTheme } from '@emotion/react';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { type IconComponent } from '@ui/display';
import React from 'react';

export type IconButtonSize = 'medium' | 'small';
export type IconButtonPosition = 'standalone' | 'left' | 'middle' | 'right';
export type IconButtonVariant = 'primary' | 'secondary' | 'tertiary';
export type IconButtonAccent = 'default' | 'blue' | 'danger';

export type IconButtonProps = {
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
};

const StyledButton = styled.button<
  Pick<
    IconButtonProps,
    'variant' | 'size' | 'position' | 'accent' | 'focus' | 'to'
  >
>`
  align-items: center;
  ${({ variant, accent, disabled, focus }) => {
    switch (variant) {
      case 'primary':
        switch (accent) {
          case 'default':
            return css`
              background: var(--background-secondary);
              border-color: ${focus
                ? 'var(--font-color-blue)'
                : 'var(--background-transparent-light)'};
              border-width: ${!disabled && focus ? '1px 1px !important' : 0};
              box-shadow: ${!disabled && focus
                ? `0 0 0 3px var(--accent-tertiary)`
                : 'none'};
              color: ${!disabled
                ? 'var(--font-color-secondary)'
                : 'var(--font-color-extra-light)'};
              &:hover {
                background: ${!disabled
                  ? 'var(--background-tertiary)'
                  : 'var(--background-secondary)'};
              }
              &:active {
                background: ${!disabled
                  ? 'var(--background-quaternary)'
                  : 'var(--background-secondary)'};
              }
            `;
          case 'blue':
            return css`
              background: var(--font-color-blue);
              border-color: ${!disabled
                ? focus
                  ? 'var(--font-color-blue)'
                  : 'var(--background-transparent-light)'
                : 'transparent'};
              border-width: ${!disabled && focus ? '1px 1px !important' : 0};
              box-shadow: ${!disabled && focus
                ? `0 0 0 3px var(--accent-tertiary)`
                : 'none'};
              color: var(--font-color-gray-0);
              opacity: ${disabled ? 0.24 : 1};

              ${disabled
                ? ''
                : css`
                    &:hover {
                      background: var(--font-color-blue-50);
                    }
                    &:active {
                      background: var(--font-color-blue-60);
                    }
                  `}
            `;
          case 'danger':
            return css`
              background: var(--font-color-red);
              border-color: ${!disabled
                ? focus
                  ? 'var(--font-color-red)'
                  : 'var(--background-transparent-light)'
                : 'transparent'};
              border-width: ${!disabled && focus ? '1px 1px !important' : 0};
              box-shadow: ${!disabled && focus
                ? `0 0 0 3px var(--font-color-red-10)`
                : 'none'};
              color: var(--font-color-gray-0);
              opacity: ${disabled ? 0.24 : 1};

              ${disabled
                ? ''
                : css`
                    &:hover,
                    &:active {
                      background: var(--font-color-red-50);
                    }
                  `}
            `;
          default:
            return css``;
        }
      case 'secondary':
      case 'tertiary':
        switch (accent) {
          case 'default':
            return css`
              background: ${focus
                ? 'var(--background-transparent-primary)'
                : 'transparent'};
              border-color: ${variant === 'secondary'
                ? !disabled && focus
                  ? 'var(--font-color-blue)'
                  : 'var(--background-transparent-medium)'
                : focus
                  ? 'var(--font-color-blue)'
                  : 'transparent'};
              border-width: ${!disabled && focus ? '1px 1px !important' : 0};
              box-shadow: ${!disabled && focus
                ? `0 0 0 3px var(--accent-tertiary)`
                : 'none'};
              color: ${disabled
                ? 'var(--font-color-extra-light)'
                : variant === 'secondary'
                  ? 'var(--font-color-secondary)'
                  : 'var(--font-color-tertiary)'};
              &:hover {
                background: ${!disabled
                  ? 'var(--background-transparent-light)'
                  : 'transparent'};
              }
              &:active {
                background: ${!disabled
                  ? 'var(--background-transparent-light)'
                  : 'transparent'};
              }
            `;
          case 'blue':
            return css`
              background: ${focus
                ? 'var(--background-transparent-primary)'
                : 'transparent'};
              border-color: ${variant === 'secondary'
                ? !disabled
                  ? 'var(--font-color-blue)'
                  : 'var(--font-color-blue-20)'
                : focus
                  ? 'var(--font-color-blue)'
                  : 'transparent'};
              border-width: ${!disabled && focus ? '1px 1px !important' : 0};
              box-shadow: ${!disabled && focus
                ? `0 0 0 3px var(--accent-tertiary)`
                : 'none'};
              color: ${!disabled
                ? 'var(--font-color-blue)'
                : 'var(--accent-accent-40-60)'};
              &:hover {
                background: ${!disabled
                  ? 'var(--accent-tertiary)'
                  : 'transparent'};
              }
              &:active {
                background: ${!disabled
                  ? 'var(--accent-secondary)'
                  : 'transparent'};
              }
            `;
          case 'danger':
            return css`
              background: transparent;
              border-color: ${variant === 'secondary'
                ? 'var(--border-color-danger)'
                : focus
                  ? 'var(--font-color-red)'
                  : 'transparent'};
              border-width: ${!disabled && focus ? '1px 1px !important' : 0};
              box-shadow: ${!disabled && focus
                ? `0 0 0 3px var(--font-color-red-10)`
                : 'none'};
              color: ${!disabled
                ? 'var(--font-color-danger)'
                : 'var(--font-color-red-20)'};
              &:hover {
                background: ${!disabled
                  ? 'var(--background-danger)'
                  : 'transparent'};
              }
              &:active {
                background: ${!disabled
                  ? 'var(--background-danger)'
                  : 'transparent'};
              }
            `;
          default:
            return css``;
        }
      default:
        return css``;
    }
  }}

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
  border-style: solid;
  border-width: ${({ variant, position }) => {
    switch (variant) {
      case 'primary':
      case 'secondary':
        return position === 'middle' ? '1px 0px' : '1px';
      case 'tertiary':
        return '0';
      default:
        return '';
    }
  }};
  box-sizing: border-box;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  flex-direction: row;
  font-family: var(--font-family-primary);
  font-weight: 500;
  gap: var(--spacing-1);
  height: ${({ size }) => (size === 'small' ? '24px' : '32px')};
  justify-content: center;
  padding: 0;
  transition: background 0.1s ease;

  white-space: nowrap;

  min-width: ${({ size }) => (size === 'small' ? '24px' : '32px')};

  &:focus {
    outline: none;
  }
`;

export const IconButton = ({
  className,
  Icon,
  variant = 'primary',
  size = 'medium',
  accent = 'default',
  position = 'standalone',
  disabled = false,
  focus = false,
  dataTestId,
  ariaLabel,
  onClick,
  to,
}: IconButtonProps) => {
  const theme = useTheme();
  return (
    <StyledButton
      data-testid={dataTestId}
      variant={variant}
      size={size}
      position={position}
      disabled={disabled}
      focus={focus}
      accent={accent}
      className={className}
      onClick={onClick}
      aria-label={ariaLabel}
      to={to}
    >
      {Icon && <Icon size={theme.icon.size.md} />}
    </StyledButton>
  );
};
