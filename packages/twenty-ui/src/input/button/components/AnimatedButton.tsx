import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
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
    soonLabel?: string;
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
            `;
          case 'blue':
            return css`
              background: ${!inverted
                ? theme.color.blue
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
              color: ${!inverted ? theme.grayScale.gray1 : theme.color.blue};
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
                    ? theme.grayScale.gray1
                    : theme.background.transparent.primary
                  : focus
                    ? theme.grayScale.gray1
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
                    ? theme.grayScale.gray1
                    : theme.background.transparent.primary
                  : focus
                    ? theme.grayScale.gray1
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
                    ? theme.grayScale.gray1
                    : theme.background.transparent.primary
                  : focus
                    ? theme.grayScale.gray1
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
                ? theme.font.color.danger
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
    return `0 ${theme.spacing(2)}`;
  }};

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
  background: ${({ theme, accent }) => {
    switch (accent) {
      case 'blue':
        return theme.border.color.blue;
      case 'danger':
        return theme.border.color.danger;
      default:
        return theme.font.color.light;
    }
  }};
  height: ${({ theme, buttonSize }) =>
    theme.spacing(buttonSize === 'small' ? 2 : 4)};
  margin: 0;
  width: 1px;
`;

const StyledShortcutLabel = styled.div<{
  variant: ButtonVariant;
  accent: ButtonAccent;
}>`
  color: ${({ theme, variant, accent }) => {
    switch (accent) {
      case 'blue':
        return theme.border.color.blue;
      case 'danger':
        return variant === 'primary'
          ? theme.border.color.danger
          : theme.color.red8;
      default:
        return theme.font.color.light;
    }
  }};
  font-weight: ${({ theme }) => theme.font.weight.medium};
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
  soonLabel = 'Soon',
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
      {soon && <StyledSoonPill label={soonLabel} />}
    </StyledButton>
  );
};
