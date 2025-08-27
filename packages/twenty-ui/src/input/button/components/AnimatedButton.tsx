import { useTheme } from '@emotion/react';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { useIsMobile } from '@ui/utilities';
import { getOsShortcutSeparator } from '@ui/utilities/device/getOsShortcutSeparator';
import { type MotionProps, motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { Pill } from '@ui/components/Pill/Pill';
import {
  type ButtonAccent,
  type ButtonProps,
  type ButtonSize,
  type ButtonVariant,
} from './Button/Button';

export type AnimatedButtonProps = ButtonProps &
  Pick<MotionProps, 'animate' | 'transition'> & {
    animatedSvg: React.ReactNode;
  };

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
    | 'dataClickOutsideId'
    | 'dataGloballyPreventClickOutside'
  >
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
                ? 'var(--color-blue)'
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
              color: ${!inverted
                ? 'var(--gray-scale-gray0)'
                : 'var(--color-blue)'};
              ${disabled
                ? ''
                : css`
                    &:hover {
                      background: ${!inverted
                        ? 'var(--color-blue50)'
                        : 'var(--background-secondary)'};
                    }
                    &:active {
                      background: ${!inverted
                        ? 'var(--color-blue60)'
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
                      ? 'var(--color-red10)'
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
                        ? 'var(--color-red40)'
                        : 'var(--background-secondary)'};
                    }
                    &:active {
                      background: ${!inverted
                        ? 'var(--color-red50)'
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
                    ? 'var(--gray-scale-gray0)'
                    : 'var(--background-transparent-primary)'
                  : focus
                    ? 'var(--gray-scale-gray0)'
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
                    ? 'var(--gray-scale-gray0)'
                    : 'var(--background-transparent-primary)'
                  : focus
                    ? 'var(--gray-scale-gray0)'
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
                    ? 'var(--gray-scale-gray0)'
                    : 'var(--background-transparent-primary)'
                  : focus
                    ? 'var(--gray-scale-gray0)'
                    : 'transparent'};
              border-width: 1px 1px 1px 1px !important;
              box-shadow: ${!disabled && focus
                ? `0 0 0 3px ${
                    !inverted
                      ? 'var(--color-red10)'
                      : 'var(--background-transparent-medium)'
                  }`
                : 'none'};
              color: ${!inverted
                ? 'var(--font-color-danger)'
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

  transition: background 0.1s ease;

  white-space: nowrap;

  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};

  &:focus {
    outline: none;
  }
`;

const StyledSoonPill = styled(Pill)`
  margin-left: auto;
`;

const StyledSeparator = styled.div<{
  buttonSize: ButtonSize;
  accent: ButtonAccent;
}>`
  background: ${({ accent }) => {
    switch (accent) {
      case 'blue':
        return 'var(--border-color-blue)';
      case 'danger':
        return 'var(--border-color-danger)';
      default:
        return 'var(--font-color-light)';
    }
  }};
  height: ${({ buttonSize }) =>
    buttonSize === 'small' ? 'var(--spacing-2)' : 'var(--spacing-4)'};
  margin: 0;
  width: 1px;
`;

const StyledShortcutLabel = styled.div<{
  variant: ButtonVariant;
  accent: ButtonAccent;
}>`
  color: ${({ variant, accent }) => {
    switch (accent) {
      case 'blue':
        return 'var(--border-color-blue)';
      case 'danger':
        return variant === 'primary'
          ? 'var(--border-color-danger)'
          : 'var(--color-red40)';
      default:
        return 'var(--font-color-light)';
    }
  }};
  font-weight: var(--font-weight-medium);
`;

const StyledIconContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const AnimatedButton = ({
  className,
  Icon,
  animatedSvg,
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
  focus = false,
  onClick,
  to,
  target,
  dataTestId,
  hotkeys,
  ariaLabel,
  animate,
  transition,
  dataClickOutsideId,
  dataGloballyPreventClickOutside,
}: AnimatedButtonProps) => {
  const theme = useTheme();
  const isMobile = useIsMobile();

  const ButtonComponent = to ? Link : 'button';

  return (
    <StyledButton
      as={ButtonComponent}
      fullWidth={fullWidth}
      variant={variant}
      inverted={inverted}
      size={size}
      position={position}
      disabled={soon || disabled}
      focus={focus}
      justify={justify}
      accent={accent}
      className={className}
      onClick={onClick}
      to={to}
      target={target}
      data-testid={dataTestId}
      aria-label={ariaLabel}
      data-click-outside-id={dataClickOutsideId}
      data-globally-prevent-click-outside={dataGloballyPreventClickOutside}
    >
      {Icon && (
        <StyledIconContainer animate={animate} transition={transition}>
          <Icon size={theme.icon.size.sm} />
        </StyledIconContainer>
      )}
      {animatedSvg && (
        <StyledIconContainer animate={animate} transition={transition}>
          {animatedSvg}
        </StyledIconContainer>
      )}
      {title}
      {hotkeys && !isMobile && (
        <>
          <StyledSeparator buttonSize={size} accent={accent} />
          <StyledShortcutLabel variant={variant} accent={accent}>
            {hotkeys.join(getOsShortcutSeparator())}
          </StyledShortcutLabel>
        </>
      )}
      {soon && <StyledSoonPill label="Soon" />}
    </StyledButton>
  );
};
