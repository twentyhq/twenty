import { styled } from '@linaria/react';
import { useIsMobile } from '@ui/utilities';
import { getOsShortcutSeparator } from '@ui/utilities/device/getOsShortcutSeparator';
import { type MotionProps, motion } from 'framer-motion';
import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';

import { Pill } from '@ui/components/Pill/Pill';
import { ThemeContext, theme } from '@ui/theme';
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

type AnimatedButtonDynamicStyles = {
  background: string;
  borderColor: string;
  borderWidthOverride: string;
  boxShadow: string;
  color: string;
  hoverBackground: string;
  activeBackground: string;
};

const computeAnimatedButtonDynamicStyles = (
  variant: ButtonVariant,
  inverted: boolean,
  accent: ButtonAccent,
  disabled: boolean,
  focus: boolean,
): AnimatedButtonDynamicStyles => {
  const result: AnimatedButtonDynamicStyles = {
    background: 'transparent',
    borderColor: 'transparent',
    borderWidthOverride: '',
    boxShadow: 'none',
    color: theme.font.color.secondary,
    hoverBackground: 'transparent',
    activeBackground: 'transparent',
  };

  switch (variant) {
    case 'primary':
      switch (accent) {
        case 'default':
          result.background = !inverted
            ? theme.background.secondary
            : theme.background.primary;
          result.borderColor = !inverted
            ? !disabled && focus
              ? theme.color.blue
              : theme.background.transparent.light
            : theme.background.transparent.light;
          result.borderWidthOverride = '1px 1px 1px 1px';
          result.boxShadow =
            !disabled && focus
              ? `0 0 0 3px ${
                  !inverted
                    ? theme.accent.tertiary
                    : theme.background.transparent.medium
                }`
              : 'none';
          result.color = !inverted
            ? !disabled
              ? theme.font.color.secondary
              : theme.font.color.extraLight
            : theme.font.color.secondary;
          if (!disabled) {
            result.hoverBackground = !inverted
              ? theme.background.tertiary
              : theme.background.secondary;
            result.activeBackground = !inverted
              ? theme.background.quaternary
              : theme.background.tertiary;
          } else {
            result.hoverBackground = result.background;
            result.activeBackground = result.background;
          }
          break;
        case 'blue':
          result.background = !inverted
            ? theme.color.blue
            : theme.background.primary;
          result.borderColor = !inverted
            ? focus
              ? theme.color.blue
              : theme.background.transparent.light
            : theme.background.transparent.light;
          result.borderWidthOverride = '1px 1px 1px 1px';
          result.boxShadow =
            !disabled && focus
              ? `0 0 0 3px ${
                  !inverted
                    ? theme.accent.tertiary
                    : theme.background.transparent.medium
                }`
              : 'none';
          result.color = !inverted ? theme.grayScale.gray1 : theme.color.blue;
          if (!disabled) {
            result.hoverBackground = !inverted
              ? theme.color.blue10
              : theme.background.secondary;
            result.activeBackground = !inverted
              ? theme.color.blue12
              : theme.background.tertiary;
          } else {
            result.hoverBackground = result.background;
            result.activeBackground = result.background;
          }
          break;
        case 'danger':
          result.background = !inverted
            ? theme.color.red
            : theme.background.primary;
          result.borderColor = !inverted
            ? focus
              ? theme.color.red
              : theme.background.transparent.light
            : theme.background.transparent.light;
          result.borderWidthOverride = '1px 1px';
          result.boxShadow =
            !disabled && focus
              ? `0 0 0 3px ${
                  !inverted
                    ? theme.color.red3
                    : theme.background.transparent.medium
                }`
              : 'none';
          result.color = !inverted ? theme.background.primary : theme.color.red;
          if (!disabled) {
            result.hoverBackground = !inverted
              ? theme.color.red8
              : theme.background.secondary;
            result.activeBackground = !inverted
              ? theme.color.red10
              : theme.background.tertiary;
          } else {
            result.hoverBackground = result.background;
            result.activeBackground = result.background;
          }
          break;
      }
      break;
    case 'secondary':
    case 'tertiary':
      switch (accent) {
        case 'default':
          result.background = 'transparent';
          result.borderColor = !inverted
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
                : 'transparent';
          result.borderWidthOverride = '1px 1px 1px 1px';
          result.boxShadow =
            !disabled && focus
              ? `0 0 0 3px ${
                  !inverted
                    ? theme.accent.tertiary
                    : theme.background.transparent.medium
                }`
              : 'none';
          result.color = !inverted
            ? !disabled
              ? theme.font.color.secondary
              : theme.font.color.extraLight
            : theme.font.color.inverted;
          result.hoverBackground = !inverted
            ? !disabled
              ? theme.background.transparent.light
              : 'transparent'
            : theme.background.transparent.light;
          result.activeBackground = !inverted
            ? !disabled
              ? theme.background.transparent.light
              : 'transparent'
            : theme.background.transparent.medium;
          break;
        case 'blue':
          result.background = 'transparent';
          result.borderColor = !inverted
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
                : 'transparent';
          result.borderWidthOverride = '1px 1px 1px 1px';
          result.boxShadow =
            !disabled && focus
              ? `0 0 0 3px ${
                  !inverted
                    ? theme.accent.tertiary
                    : theme.background.transparent.medium
                }`
              : 'none';
          result.color = !inverted
            ? !disabled
              ? theme.color.blue
              : theme.accent.accent4060
            : theme.font.color.inverted;
          result.hoverBackground = !inverted
            ? !disabled
              ? theme.accent.tertiary
              : 'transparent'
            : theme.background.transparent.light;
          result.activeBackground = !inverted
            ? !disabled
              ? theme.accent.secondary
              : 'transparent'
            : theme.background.transparent.medium;
          break;
        case 'danger':
          result.background = 'transparent';
          result.borderColor = !inverted
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
                : 'transparent';
          result.borderWidthOverride = '1px 1px 1px 1px';
          result.boxShadow =
            !disabled && focus
              ? `0 0 0 3px ${
                  !inverted
                    ? theme.color.red3
                    : theme.background.transparent.medium
                }`
              : 'none';
          result.color = !inverted
            ? theme.font.color.danger
            : theme.font.color.inverted;
          result.hoverBackground = !inverted
            ? !disabled
              ? theme.background.danger
              : 'transparent'
            : theme.background.transparent.light;
          result.activeBackground = !inverted
            ? !disabled
              ? theme.background.danger
              : 'transparent'
            : theme.background.transparent.medium;
          break;
      }
      break;
  }

  return result;
};

const StyledButton = styled.button<
  Pick<
    ButtonProps,
    | 'fullWidth'
    | 'size'
    | 'position'
    | 'justify'
    | 'to'
    | 'target'
    | 'dataClickOutsideId'
    | 'dataGloballyPreventClickOutside'
  >
>`
  align-items: center;
  background: var(--abtn-bg);
  border-color: var(--abtn-border-color);
  border-width: var(--abtn-border-width);
  box-shadow: var(--abtn-box-shadow);
  color: var(--abtn-color);

  &:hover {
    background: var(--abtn-hover-bg);
  }
  &:active {
    background: var(--abtn-active-bg);
  }

  text-decoration: none;
  border-radius: ${({ position }) => {
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
    return '';
  }};
  border-style: solid;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  flex-direction: row;
  font-family: ${theme.font.family};
  font-weight: 500;
  font-size: ${theme.font.size.md};
  gap: ${theme.spacing[1]};
  height: ${({ size }) => (size === 'small' ? '24px' : '32px')};
  justify-content: ${({ justify }) => justify ?? ''};
  padding: 0 ${theme.spacing[2]};

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
        return theme.border.color.blue;
      case 'danger':
        return theme.border.color.danger;
      default:
        return theme.font.color.light;
    }
  }};
  height: ${({ buttonSize }) =>
    buttonSize === 'small' ? theme.spacing[2] : theme.spacing[4]};
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
        return theme.border.color.blue;
      case 'danger':
        return variant === 'primary'
          ? theme.border.color.danger
          : theme.color.red8;
      default:
        return theme.font.color.light;
    }
  }};
  font-weight: ${theme.font.weight.medium};
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
  const { theme } = useContext(ThemeContext);
  const isMobile = useIsMobile();
  const isDisabled = soon || disabled;

  const dynamicStyles = useMemo(() => {
    const s = computeAnimatedButtonDynamicStyles(
      variant,
      inverted,
      accent,
      isDisabled,
      focus,
    );
    return {
      '--abtn-bg': s.background,
      '--abtn-border-color': s.borderColor,
      '--abtn-border-width': s.borderWidthOverride || undefined,
      '--abtn-box-shadow': s.boxShadow,
      '--abtn-color': s.color,
      '--abtn-hover-bg': s.hoverBackground,
      '--abtn-active-bg': s.activeBackground,
    } as React.CSSProperties;
  }, [variant, inverted, accent, isDisabled, focus]);

  const ButtonComponent = to ? Link : 'button';

  return (
    <StyledButton
      as={ButtonComponent}
      fullWidth={fullWidth}
      size={size}
      position={position}
      disabled={isDisabled}
      justify={justify}
      className={className}
      style={dynamicStyles}
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
