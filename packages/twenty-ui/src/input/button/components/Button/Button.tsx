import isPropValid from '@emotion/is-prop-valid';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { type IconComponent } from '@ui/display/icon/types/IconComponent';
import { ButtonHotkeys } from '@ui/input/button/components/Button/internal/ButtonHotKeys';
import { ButtonIcon } from '@ui/input/button/components/Button/internal/ButtonIcon';
import { ButtonSoon } from '@ui/input/button/components/Button/internal/ButtonSoon';
import { GRAY_SCALE_LIGHT } from '@ui/theme';
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

const StyledButton = styled('button', {
  shouldForwardProp: (prop) =>
    !['fullWidth'].includes(prop) && isPropValid(prop),
})<
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
  ${({ theme, variant, inverted, accent, disabled, focus }) => {
    switch (variant) {
      case 'primary':
        switch (accent) {
          case 'default':
            return css`
              background: ${!inverted
                ? theme.background.secondary
                : theme.background.primary};
              border-color: ${!inverted
                ? !disabled && focus
                  ? theme.color.blue
                  : theme.background.transparent.light
                : theme.background.transparent.light};
              border-width: 1px 1px 1px 1px !important;
              box-shadow: ${!disabled && focus
                ? `0 0 0 3px ${
                    !inverted
                      ? theme.accent.tertiary
                      : theme.background.transparent.medium
                  }`
                : 'none'};
              color: ${!inverted
                ? !disabled
                  ? theme.font.color.secondary
                  : theme.font.color.extraLight
                : theme.font.color.secondary};
              ${disabled
                ? ''
                : css`
                    &:hover {
                      background: ${!inverted
                        ? theme.background.tertiary
                        : theme.background.secondary};
                    }
                    &:active {
                      background: ${!inverted
                        ? theme.background.quaternary
                        : theme.background.tertiary};
                    }
                  `}
            `;
          case 'blue':
            return css`
              background: ${!inverted
                ? disabled
                  ? theme.accent.accent4060
                  : theme.color.blue
                : theme.background.primary};
              border-color: ${!inverted
                ? focus
                  ? theme.color.blue
                  : theme.background.transparent.light
                : theme.background.transparent.light};
              border-width: 1px 1px 1px 1px !important;
              box-shadow: ${!disabled && focus
                ? `0 0 0 3px ${
                    !inverted
                      ? theme.accent.tertiary
                      : theme.background.transparent.medium
                  }`
                : 'none'};
              color: ${!inverted ? GRAY_SCALE_LIGHT.gray1 : theme.color.blue};
              ${disabled
                ? ''
                : css`
                    &:hover {
                      background: ${!inverted
                        ? theme.color.blue10
                        : theme.background.secondary};
                    }
                    &:active {
                      background: ${!inverted
                        ? theme.color.blue12
                        : theme.background.tertiary};
                    }
                  `}
            `;
          case 'danger':
            return css`
              background: ${!inverted
                ? theme.color.red
                : theme.background.primary};
              border-color: ${!inverted
                ? focus
                  ? theme.color.red
                  : theme.background.transparent.light
                : theme.background.transparent.light};
              border-width: 1px 1px !important;
              box-shadow: ${!disabled && focus
                ? `0 0 0 3px ${
                    !inverted
                      ? theme.color.red3
                      : theme.background.transparent.medium
                  }`
                : 'none'};
              color: ${!inverted ? theme.background.primary : theme.color.red};
              ${disabled
                ? ''
                : css`
                    &:hover {
                      background: ${!inverted
                        ? theme.color.red8
                        : theme.background.secondary};
                    }
                    &:active {
                      background: ${!inverted
                        ? theme.color.red10
                        : theme.background.tertiary};
                    }
                  `}
            `;
        }
        break;
      case 'secondary':
      case 'tertiary':
        switch (accent) {
          case 'default':
            return css`
              background: transparent;
              border-color: ${!inverted
                ? variant === 'secondary'
                  ? !disabled && focus
                    ? theme.color.blue
                    : theme.background.transparent.medium
                  : focus
                    ? theme.color.blue
                    : 'transparent'
                : variant === 'secondary'
                  ? focus || disabled
                    ? GRAY_SCALE_LIGHT.gray1
                    : theme.background.transparent.primary
                  : focus
                    ? GRAY_SCALE_LIGHT.gray1
                    : 'transparent'};
              border-width: 1px 1px 1px 1px !important;
              box-shadow: ${!disabled && focus
                ? `0 0 0 3px ${
                    !inverted
                      ? theme.accent.tertiary
                      : theme.background.transparent.medium
                  }`
                : 'none'};
              color: ${!inverted
                ? !disabled
                  ? theme.font.color.secondary
                  : theme.font.color.extraLight
                : theme.font.color.inverted};
              &:hover {
                background: ${!inverted
                  ? !disabled
                    ? theme.background.transparent.light
                    : 'transparent'
                  : theme.background.transparent.light};
              }
              &:active {
                background: ${!inverted
                  ? !disabled
                    ? theme.background.transparent.light
                    : 'transparent'
                  : theme.background.transparent.medium};
              }
            `;
          case 'blue':
            return css`
              background: transparent;
              border-color: ${!inverted
                ? variant === 'secondary'
                  ? focus
                    ? theme.color.blue
                    : theme.accent.primary
                  : focus
                    ? theme.color.blue
                    : 'transparent'
                : variant === 'secondary'
                  ? focus || disabled
                    ? GRAY_SCALE_LIGHT.gray1
                    : theme.background.transparent.primary
                  : focus
                    ? GRAY_SCALE_LIGHT.gray1
                    : 'transparent'};
              border-width: 1px 1px 1px 1px !important;
              box-shadow: ${!disabled && focus
                ? `0 0 0 3px ${
                    !inverted
                      ? theme.accent.tertiary
                      : theme.background.transparent.medium
                  }`
                : 'none'};
              color: ${!inverted
                ? !disabled
                  ? theme.color.blue
                  : theme.accent.accent4060
                : theme.font.color.inverted};
              &:hover {
                background: ${!inverted
                  ? !disabled
                    ? theme.accent.tertiary
                    : 'transparent'
                  : theme.background.transparent.light};
              }
              &:active {
                background: ${!inverted
                  ? !disabled
                    ? theme.accent.secondary
                    : 'transparent'
                  : theme.background.transparent.medium};
              }
            `;
          case 'danger':
            return css`
              background: transparent;
              border-color: ${!inverted
                ? variant === 'secondary'
                  ? focus
                    ? theme.color.red
                    : theme.border.color.danger
                  : focus
                    ? theme.color.red
                    : 'transparent'
                : variant === 'secondary'
                  ? focus || disabled
                    ? GRAY_SCALE_LIGHT.gray1
                    : theme.background.transparent.primary
                  : focus
                    ? GRAY_SCALE_LIGHT.gray1
                    : 'transparent'};
              border-width: 1px 1px 1px 1px !important;
              box-shadow: ${!disabled && focus
                ? `0 0 0 3px ${
                    !inverted
                      ? theme.color.red3
                      : theme.background.transparent.medium
                  }`
                : 'none'};
              color: ${!inverted
                ? !disabled
                  ? theme.font.color.danger
                  : theme.color.red5
                : theme.font.color.inverted};
              &:hover {
                background: ${!inverted
                  ? !disabled
                    ? theme.background.danger
                    : 'transparent'
                  : theme.background.transparent.light};
              }
              &:active {
                background: ${!inverted
                  ? !disabled
                    ? theme.background.danger
                    : 'transparent'
                  : theme.background.transparent.medium};
              }
            `;
        }
    }
  }}

  text-decoration: none;
  border-radius: ${({ position, theme }) => {
    switch (position) {
      case 'left':
        return `${theme.border.radius.sm} 0px 0px ${theme.border.radius.sm}`;
      case 'right':
        return `0px ${theme.border.radius.sm} ${theme.border.radius.sm} 0px`;
      case 'middle':
        return '0px';
      case 'standalone':
        return theme.border.radius.sm;
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
    }
  }};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  flex-direction: row;
  font-family: ${({ theme }) => theme.font.family};
  font-weight: 500;
  font-size: ${({ theme }) => theme.font.size.md};
  gap: ${({ theme }) => theme.spacing(1)};
  height: ${({ size }) => (size === 'small' ? '24px' : '32px')};
  justify-content: ${({ justify }) => justify};
  padding: ${({ theme }) => {
    return `0 ${theme.spacing(2)} 0 ${theme.spacing(2)}`;
  }};
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
  ${({ theme, variant, accent, inverted, disabled }) => css`
    --tw-button-color: ${(() => {
      switch (variant) {
        case 'primary':
          switch (accent) {
            case 'default':
              return !inverted
                ? !disabled
                  ? theme.font.color.secondary
                  : theme.font.color.extraLight
                : theme.font.color.secondary;
            case 'blue':
              return !inverted ? GRAY_SCALE_LIGHT.gray1 : theme.color.blue;
            case 'danger':
              return !inverted ? theme.background.primary : theme.color.red;
          }
          break;
        case 'secondary':
        case 'tertiary':
          switch (accent) {
            case 'default':
              return !inverted
                ? !disabled
                  ? theme.font.color.secondary
                  : theme.font.color.extraLight
                : theme.font.color.inverted;
            case 'blue':
              return !inverted
                ? !disabled
                  ? theme.color.blue
                  : theme.accent.accent4060
                : theme.font.color.inverted;
            case 'danger':
              return !inverted
                ? theme.font.color.danger
                : theme.font.color.inverted;
          }
          break;
      }
      return theme.font.color.secondary; // Valeur par défaut
    })()};
  `}

  max-width: ${({ isLoading, theme }) =>
    isLoading ? `calc(100% - ${theme.spacing(8)})` : 'none'};

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
