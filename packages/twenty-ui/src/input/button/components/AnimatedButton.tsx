import { styled } from '@linaria/react';
import { useIsMobile } from '@ui/utilities';
import { getOsShortcutSeparator } from '@ui/utilities/device/getOsShortcutSeparator';
import { type MotionProps, motion } from 'framer-motion';
import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';

import { Pill } from '@ui/components/Pill/Pill';
import { ThemeContext, themeCssVariables } from '@ui/theme';
import {
  type ButtonAccent,
  type ButtonPosition,
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
  position: ButtonPosition,
): AnimatedButtonDynamicStyles => {
  const result: AnimatedButtonDynamicStyles = {
    background: 'transparent',
    borderColor: 'transparent',
    borderWidthOverride: '',
    boxShadow: 'none',
    color: themeCssVariables.font.color.secondary,
    hoverBackground: 'transparent',
    activeBackground: 'transparent',
  };

  switch (variant) {
    case 'primary':
      switch (accent) {
        case 'default':
          result.background = !inverted
            ? themeCssVariables.background.secondary
            : themeCssVariables.background.primary;
          result.borderColor = !inverted
            ? !disabled && focus
              ? themeCssVariables.color.blue
              : themeCssVariables.background.transparent.light
            : themeCssVariables.background.transparent.light;
          result.borderWidthOverride = '1px 1px 1px 1px';
          result.boxShadow =
            !disabled && focus
              ? `0 0 0 3px ${
                  !inverted
                    ? themeCssVariables.accent.tertiary
                    : themeCssVariables.background.transparent.medium
                }`
              : 'none';
          result.color = !inverted
            ? !disabled
              ? themeCssVariables.font.color.secondary
              : themeCssVariables.font.color.extraLight
            : themeCssVariables.font.color.secondary;
          if (!disabled) {
            result.hoverBackground = !inverted
              ? themeCssVariables.background.tertiary
              : themeCssVariables.background.secondary;
            result.activeBackground = !inverted
              ? themeCssVariables.background.quaternary
              : themeCssVariables.background.tertiary;
          } else {
            result.hoverBackground = result.background;
            result.activeBackground = result.background;
          }
          break;
        case 'blue':
          result.background = !inverted
            ? themeCssVariables.color.blue
            : themeCssVariables.background.primary;
          result.borderColor = !inverted
            ? focus
              ? themeCssVariables.color.blue
              : themeCssVariables.background.transparent.light
            : themeCssVariables.background.transparent.light;
          result.borderWidthOverride = '1px 1px 1px 1px';
          result.boxShadow =
            !disabled && focus
              ? `0 0 0 3px ${
                  !inverted
                    ? themeCssVariables.accent.tertiary
                    : themeCssVariables.background.transparent.medium
                }`
              : 'none';
          result.color = !inverted
            ? themeCssVariables.grayScale.gray1
            : themeCssVariables.color.blue;
          if (!disabled) {
            result.hoverBackground = !inverted
              ? themeCssVariables.color.blue10
              : themeCssVariables.background.secondary;
            result.activeBackground = !inverted
              ? themeCssVariables.color.blue12
              : themeCssVariables.background.tertiary;
          } else {
            result.hoverBackground = result.background;
            result.activeBackground = result.background;
          }
          break;
        case 'danger':
          result.background = !inverted
            ? themeCssVariables.color.red
            : themeCssVariables.background.primary;
          result.borderColor = !inverted
            ? focus
              ? themeCssVariables.color.red
              : themeCssVariables.background.transparent.light
            : themeCssVariables.background.transparent.light;
          result.borderWidthOverride = '1px 1px';
          result.boxShadow =
            !disabled && focus
              ? `0 0 0 3px ${
                  !inverted
                    ? themeCssVariables.color.red3
                    : themeCssVariables.background.transparent.medium
                }`
              : 'none';
          result.color = !inverted
            ? themeCssVariables.background.primary
            : themeCssVariables.color.red;
          if (!disabled) {
            result.hoverBackground = !inverted
              ? themeCssVariables.color.red8
              : themeCssVariables.background.secondary;
            result.activeBackground = !inverted
              ? themeCssVariables.color.red10
              : themeCssVariables.background.tertiary;
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
                ? themeCssVariables.color.blue
                : themeCssVariables.background.transparent.medium
              : focus
                ? themeCssVariables.color.blue
                : 'transparent'
            : variant === 'secondary'
              ? focus || disabled
                ? themeCssVariables.grayScale.gray1
                : themeCssVariables.background.transparent.primary
              : focus
                ? themeCssVariables.grayScale.gray1
                : 'transparent';
          result.borderWidthOverride = '1px 1px 1px 1px';
          result.boxShadow =
            !disabled && focus
              ? `0 0 0 3px ${
                  !inverted
                    ? themeCssVariables.accent.tertiary
                    : themeCssVariables.background.transparent.medium
                }`
              : 'none';
          result.color = !inverted
            ? !disabled
              ? themeCssVariables.font.color.secondary
              : themeCssVariables.font.color.extraLight
            : themeCssVariables.font.color.inverted;
          result.hoverBackground = !inverted
            ? !disabled
              ? themeCssVariables.background.transparent.light
              : 'transparent'
            : themeCssVariables.background.transparent.light;
          result.activeBackground = !inverted
            ? !disabled
              ? themeCssVariables.background.transparent.light
              : 'transparent'
            : themeCssVariables.background.transparent.medium;
          break;
        case 'blue':
          result.background = 'transparent';
          result.borderColor = !inverted
            ? variant === 'secondary'
              ? focus
                ? themeCssVariables.color.blue
                : themeCssVariables.accent.primary
              : focus
                ? themeCssVariables.color.blue
                : 'transparent'
            : variant === 'secondary'
              ? focus || disabled
                ? themeCssVariables.grayScale.gray1
                : themeCssVariables.background.transparent.primary
              : focus
                ? themeCssVariables.grayScale.gray1
                : 'transparent';
          result.borderWidthOverride = '1px 1px 1px 1px';
          result.boxShadow =
            !disabled && focus
              ? `0 0 0 3px ${
                  !inverted
                    ? themeCssVariables.accent.tertiary
                    : themeCssVariables.background.transparent.medium
                }`
              : 'none';
          result.color = !inverted
            ? !disabled
              ? themeCssVariables.color.blue
              : themeCssVariables.accent.accent4060
            : themeCssVariables.font.color.inverted;
          result.hoverBackground = !inverted
            ? !disabled
              ? themeCssVariables.accent.tertiary
              : 'transparent'
            : themeCssVariables.background.transparent.light;
          result.activeBackground = !inverted
            ? !disabled
              ? themeCssVariables.accent.secondary
              : 'transparent'
            : themeCssVariables.background.transparent.medium;
          break;
        case 'danger':
          result.background = 'transparent';
          result.borderColor = !inverted
            ? variant === 'secondary'
              ? focus
                ? themeCssVariables.color.red
                : themeCssVariables.border.color.danger
              : focus
                ? themeCssVariables.color.red
                : 'transparent'
            : variant === 'secondary'
              ? focus || disabled
                ? themeCssVariables.grayScale.gray1
                : themeCssVariables.background.transparent.primary
              : focus
                ? themeCssVariables.grayScale.gray1
                : 'transparent';
          result.borderWidthOverride = '1px 1px 1px 1px';
          result.boxShadow =
            !disabled && focus
              ? `0 0 0 3px ${
                  !inverted
                    ? themeCssVariables.color.red3
                    : themeCssVariables.background.transparent.medium
                }`
              : 'none';
          result.color = !inverted
            ? themeCssVariables.font.color.danger
            : themeCssVariables.font.color.inverted;
          result.hoverBackground = !inverted
            ? !disabled
              ? themeCssVariables.background.danger
              : 'transparent'
            : themeCssVariables.background.transparent.light;
          result.activeBackground = !inverted
            ? !disabled
              ? themeCssVariables.background.danger
              : 'transparent'
            : themeCssVariables.background.transparent.medium;
          break;
      }
      break;
  }

  if (result.borderWidthOverride !== '' && position !== 'standalone') {
    switch (position) {
      case 'left':
        result.borderWidthOverride = '1px 0px 1px 1px';
        break;
      case 'middle':
        result.borderWidthOverride = '1px 0px 1px 0px';
        break;
      case 'right':
        result.borderWidthOverride = '1px 1px 1px 0px';
        break;
    }
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
  border-style: solid;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  flex-direction: row;
  font-family: ${themeCssVariables.font.family};
  font-weight: 500;
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[1]};
  height: ${({ size }) => (size === 'small' ? '24px' : '32px')};
  justify-content: ${({ justify }) => justify ?? ''};
  padding: 0 ${themeCssVariables.spacing[2]};

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
        return themeCssVariables.border.color.blue;
      case 'danger':
        return themeCssVariables.border.color.danger;
      default:
        return themeCssVariables.font.color.light;
    }
  }};
  height: ${({ buttonSize }) =>
    buttonSize === 'small'
      ? themeCssVariables.spacing[2]
      : themeCssVariables.spacing[4]};
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
        return themeCssVariables.border.color.blue;
      case 'danger':
        return variant === 'primary'
          ? themeCssVariables.border.color.danger
          : themeCssVariables.color.red8;
      default:
        return themeCssVariables.font.color.light;
    }
  }};
  font-weight: ${themeCssVariables.font.weight.medium};
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
      position,
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
  }, [variant, inverted, accent, isDisabled, focus, position]);

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
