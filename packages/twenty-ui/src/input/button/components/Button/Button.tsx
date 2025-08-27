import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { type IconComponent } from '@ui/display/icon/types/IconComponent';
import { ButtonHotkeys } from '@ui/input/button/components/Button/internal/ButtonHotKeys';
import { ButtonIcon } from '@ui/input/button/components/Button/internal/ButtonIcon';
import { ButtonSoon } from '@ui/input/button/components/Button/internal/ButtonSoon';
import { useIsMobile } from '@ui/utilities';
import { type ClickOutsideAttributes } from '@ui/utilities/types/ClickOutsideAttributes';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { ButtonText } from './internal/ButtonText';

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

const StyledButton = styled.button<
  Pick<
    ButtonProps,
    | 'fullWidth'
    | 'variant'
    | 'inverted'
    | 'size'
    | 'position'
    | 'accent'
    | 'focus'
    | 'justify'
    | 'to'
    | 'target'
    | 'isLoading'
  > & { hasIcon: boolean }
>`
  align-items: center;
  ${({ variant, inverted, accent, disabled, focus }) => {
    switch (variant) {
      case 'primary':
        switch (accent) {
          case 'default':
            return css`
              background: ${!inverted
                ? 'var(--background-secondary)'
                : 'var(--background-primary)'};
              border-color: ${!inverted
                ? !disabled && focus
                  ? 'var(--color-blue)'
                  : 'var(--background-transparent-light)'
                : 'var(--background-transparent-light)'};
              border-width: 1px 1px 1px 1px !important;
              box-shadow: ${!disabled && focus
                ? `0 0 0 3px ${
                    !inverted
                      ? 'var(--accent-tertiary)'
                      : 'var(--background-transparent-medium)'
                  }`
                : 'none'};
              color: ${!inverted
                ? !disabled
                  ? 'var(--font-color-secondary)'
                  : 'var(--font-color-extra-light)'
                : 'var(--font-color-secondary)'};
              &:hover {
                background: ${!inverted
                  ? 'var(--background-tertiary)'
                  : 'var(--background-secondary)'};
              }
              &:active {
                background: ${!inverted
                  ? 'var(--background-quaternary)'
                  : 'var(--background-tertiary)'};
              }
            `;
          case 'blue':
            return css`
              background: ${!inverted
                ? disabled
                  ? 'var(--accent-accent4060)'
                  : 'var(--color-blue)'
                : 'var(--background-primary)'};
              border-color: ${!inverted
                ? focus
                  ? 'var(--color-blue)'
                  : 'var(--background-transparent-light)'
                : 'var(--background-transparent-light)'};
              border-width: 1px 1px 1px 1px !important;
              box-shadow: ${!disabled && focus
                ? `0 0 0 3px ${
                    !inverted
                      ? 'var(--accent-tertiary)'
                      : 'var(--background-transparent-medium)'
                  }`
                : 'none'};
              color: ${!inverted ? 'var(--color-gray-0)' : 'var(--color-blue)'};
              ${disabled
                ? ''
                : css`
                    &:hover {
                      background: ${!inverted
                        ? 'var(--color-blue-50)'
                        : 'var(--background-secondary)'};
                    }
                    &:active {
                      background: ${!inverted
                        ? 'var(--color-blue-60)'
                        : 'var(--background-tertiary)'};
                    }
                  `}
            `;
          case 'danger':
            return css`
              background: ${!inverted
                ? 'var(--color-red)'
                : 'var(--background-primary)'};
              border-color: ${!inverted
                ? focus
                  ? 'var(--color-red)'
                  : 'var(--background-transparent-light)'
                : 'var(--background-transparent-light)'};
              border-width: 1px 1px !important;
              box-shadow: ${!disabled && focus
                ? `0 0 0 3px ${
                    !inverted
                      ? 'var(--color-red-10)'
                      : 'var(--background-transparent-medium)'
                  }`
                : 'none'};
              color: ${!inverted
                ? 'var(--background-primary)'
                : 'var(--color-red)'};
              ${disabled
                ? ''
                : css`
                    &:hover {
                      background: ${!inverted
                        ? 'var(--color-red-40)'
                        : 'var(--background-secondary)'};
                    }
                    &:active {
                      background: ${!inverted
                        ? 'var(--color-red-50)'
                        : 'var(--background-tertiary)'};
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
              background: transparent;
              border-color: ${!inverted
                ? variant === 'secondary'
                  ? !disabled && focus
                    ? 'var(--color-blue)'
                    : 'var(--background-transparent-medium)'
                  : focus
                    ? 'var(--color-blue)'
                    : 'transparent'
                : variant === 'secondary'
                  ? focus || disabled
                    ? 'var(--color-gray-0)'
                    : 'var(--background-transparent-primary)'
                  : focus
                    ? 'var(--color-gray-0)'
                    : 'transparent'};
              border-width: 1px 1px 1px 1px !important;
              box-shadow: ${!disabled && focus
                ? `0 0 0 3px ${
                    !inverted
                      ? 'var(--accent-tertiary)'
                      : 'var(--background-transparent-medium)'
                  }`
                : 'none'};
              color: ${!inverted
                ? !disabled
                  ? 'var(--font-color-secondary)'
                  : 'var(--font-color-extra-light)'
                : 'var(--font-color-inverted)'};
              &:hover {
                background: ${!inverted
                  ? !disabled
                    ? 'var(--background-transparent-light)'
                    : 'transparent'
                  : 'var(--background-transparent-light)'};
              }
              &:active {
                background: ${!inverted
                  ? !disabled
                    ? 'var(--background-transparent-light)'
                    : 'transparent'
                  : 'var(--background-transparent-medium)'};
              }
            `;
          case 'blue':
            return css`
              background: transparent;
              border-color: ${!inverted
                ? variant === 'secondary'
                  ? focus
                    ? 'var(--color-blue)'
                    : 'var(--accent-primary)'
                  : focus
                    ? 'var(--color-blue)'
                    : 'transparent'
                : variant === 'secondary'
                  ? focus || disabled
                    ? 'var(--color-gray-0)'
                    : 'var(--background-transparent-primary)'
                  : focus
                    ? 'var(--color-gray-0)'
                    : 'transparent'};
              border-width: 1px 1px 1px 1px !important;
              box-shadow: ${!disabled && focus
                ? `0 0 0 3px ${
                    !inverted
                      ? 'var(--accent-tertiary)'
                      : 'var(--background-transparent-medium)'
                  }`
                : 'none'};
              color: ${!inverted
                ? !disabled
                  ? 'var(--color-blue)'
                  : 'var(--accent-accent4060)'
                : 'var(--font-color-inverted)'};
              &:hover {
                background: ${!inverted
                  ? !disabled
                    ? 'var(--accent-tertiary)'
                    : 'transparent'
                  : 'var(--background-transparent-light)'};
              }
              &:active {
                background: ${!inverted
                  ? !disabled
                    ? 'var(--accent-secondary)'
                    : 'transparent'
                  : 'var(--background-transparent-medium)'};
              }
            `;
          case 'danger':
            return css`
              background: transparent;
              border-color: ${!inverted
                ? variant === 'secondary'
                  ? focus
                    ? 'var(--color-red)'
                    : 'var(--border-color-danger)'
                  : focus
                    ? 'var(--color-red)'
                    : 'transparent'
                : variant === 'secondary'
                  ? focus || disabled
                    ? 'var(--color-gray-0)'
                    : 'var(--background-transparent-primary)'
                  : focus
                    ? 'var(--color-gray-0)'
                    : 'transparent'};
              border-width: 1px 1px 1px 1px !important;
              box-shadow: ${!disabled && focus
                ? `0 0 0 3px ${
                    !inverted
                      ? 'var(--color-red-10)'
                      : 'var(--background-transparent-medium)'
                  }`
                : 'none'};
              color: ${!inverted
                ? !disabled
                  ? 'var(--font-color-danger)'
                  : 'var(--color-red-20)'
                : 'var(--font-color-inverted)'};
              &:hover {
                background: ${!inverted
                  ? !disabled
                    ? 'var(--background-danger)'
                    : 'transparent'
                  : 'var(--background-transparent-light)'};
              }
              &:active {
                background: ${!inverted
                  ? !disabled
                    ? 'var(--background-danger)'
                    : 'transparent'
                  : 'var(--background-transparent-medium)'};
              }
            `;
          default:
            return css``;
        }
      default:
        return css``;
    }
  }}

  text-decoration: none;
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
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  flex-direction: row;
  font-family: var(--font-family-primary);
  font-weight: 500;
  font-size: var(--font-size-md);
  gap: var(--spacing-1);
  height: ${({ size }) => (size === 'small' ? '24px' : '32px')};
  justify-content: ${({ justify }) => justify ?? 'flex-start'};
  padding: 0 var(--spacing-2) 0 var(--spacing-2);
  box-sizing: border-box;

  transition: background 0.1s ease;

  white-space: nowrap;

  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};

  &:focus {
    outline: none;
  }
`;

const StyledButtonWrapper = styled.div<
  Pick<
    ButtonProps,
    'isLoading' | 'variant' | 'accent' | 'inverted' | 'disabled' | 'fullWidth'
  >
>`
  ${({ variant, accent, inverted, disabled }) => css`
    --tw-button-color: ${(() => {
      switch (variant) {
        case 'primary':
          switch (accent) {
            case 'default':
              return !inverted
                ? !disabled
                  ? 'var(--font-color-secondary)'
                  : 'var(--font-color-extra-light)'
                : 'var(--font-color-secondary)';
            case 'blue':
              return !inverted ? 'var(--color-gray-0)' : 'var(--color-blue)';
            case 'danger':
              return !inverted
                ? 'var(--background-primary)'
                : 'var(--color-red)';
          }
          break;
        case 'secondary':
        case 'tertiary':
          switch (accent) {
            case 'default':
              return !inverted
                ? !disabled
                  ? 'var(--font-color-secondary)'
                  : 'var(--font-color-extra-light)'
                : 'var(--font-color-inverted)';
            case 'blue':
              return !inverted
                ? !disabled
                  ? 'var(--color-blue)'
                  : 'var(--accent-accent4060)'
                : 'var(--font-color-inverted)';
            case 'danger':
              return !inverted
                ? 'var(--font-color-danger)'
                : 'var(--font-color-inverted)';
          }
          break;
      }
      return 'var(--font-color-secondary)'; // Valeur par défaut
    })()};
  `}

  max-width: ${({ isLoading }) =>
    isLoading ? `calc(100% - var(--spacing-8))` : 'none'};

  position: relative;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`;

export const Button = ({
  className,
  Icon,
  title,
  fullWidth = false,
  variant = 'primary',
  inverted = false,
  size = 'medium',
  accent = 'default',
  position = 'standalone',
  soon = false,
  disabled = false,
  justify = 'flex-start',
  focus: propFocus = false,
  onClick,
  to,
  target,
  dataTestId,
  dataClickOutsideId,
  dataGloballyPreventClickOutside,
  hotkeys,
  ariaLabel,
  type,
  isLoading = false,
}: ButtonProps) => {
  const isMobile = useIsMobile();

  const [isFocused, setIsFocused] = useState(propFocus);
  return (
    <StyledButtonWrapper
      isLoading={!!isLoading}
      variant={variant}
      accent={accent}
      inverted={inverted}
      disabled={soon || disabled}
      fullWidth={fullWidth}
    >
      <StyledButton
        fullWidth={fullWidth}
        variant={variant}
        inverted={inverted}
        position={position}
        disabled={soon || disabled}
        hasIcon={!!Icon}
        focus={isFocused}
        justify={justify}
        accent={accent}
        className={className}
        onClick={onClick}
        to={to}
        as={to ? Link : 'button'}
        target={target}
        data-testid={dataTestId}
        data-click-outside-id={dataClickOutsideId}
        data-globally-prevent-click-outside={dataGloballyPreventClickOutside}
        aria-label={ariaLabel}
        type={type}
        isLoading={isLoading}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        size={size}
      >
        {(isLoading || Icon) && (
          <ButtonIcon Icon={Icon} isLoading={!!isLoading} />
        )}
        {isDefined(title) && (
          <ButtonText hasIcon={!!Icon} title={title} isLoading={isLoading} />
        )}
        {hotkeys && !isMobile && (
          <ButtonHotkeys
            hotkeys={hotkeys}
            variant={variant}
            accent={accent}
            size={size}
          />
        )}
        {soon && <ButtonSoon />}
      </StyledButton>
    </StyledButtonWrapper>
  );
};
