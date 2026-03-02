import { styled } from '@linaria/react';
import { type IconComponent } from '@ui/display/icon/types/IconComponent';
import { ButtonHotkeys } from '@ui/input/button/components/Button/internal/ButtonHotKeys';
import { ButtonIcon } from '@ui/input/button/components/Button/internal/ButtonIcon';
import { ButtonSoon } from '@ui/input/button/components/Button/internal/ButtonSoon';
import { GRAY_SCALE_LIGHT, themeCssVariables } from '@ui/theme';
import { useIsMobile } from '@ui/utilities';
import { type ClickOutsideAttributes } from '@ui/utilities/types/ClickOutsideAttributes';
import React, { useMemo, useState } from 'react';
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

type ButtonDynamicStyles = {
  background: string;
  borderColor: string;
  borderWidthOverride: string;
  boxShadow: string;
  color: string;
  hoverBackground: string;
  activeBackground: string;
};

const computeButtonDynamicStyles = (
  variant: ButtonVariant,
  accent: ButtonAccent,
  inverted: boolean,
  disabled: boolean,
  focus: boolean,
  position: ButtonPosition,
): ButtonDynamicStyles => {
  const result: ButtonDynamicStyles = {
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
            ? disabled
              ? themeCssVariables.accent.accent4060
              : themeCssVariables.color.blue
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
            ? GRAY_SCALE_LIGHT.gray1
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
                ? GRAY_SCALE_LIGHT.gray1
                : themeCssVariables.background.transparent.primary
              : focus
                ? GRAY_SCALE_LIGHT.gray1
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
                ? GRAY_SCALE_LIGHT.gray1
                : themeCssVariables.background.transparent.primary
              : focus
                ? GRAY_SCALE_LIGHT.gray1
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
                ? GRAY_SCALE_LIGHT.gray1
                : themeCssVariables.background.transparent.primary
              : focus
                ? GRAY_SCALE_LIGHT.gray1
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
            ? !disabled
              ? themeCssVariables.font.color.danger
              : themeCssVariables.color.red5
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
    | 'focus'
    | 'justify'
    | 'to'
    | 'target'
    | 'isLoading'
  > & { hasIcon: boolean }
>`
  align-items: center;
  background: var(--btn-bg);
  border-color: var(--btn-border-color);
  border-width: var(--btn-border-width);
  box-shadow: var(--btn-box-shadow);
  color: var(--btn-color);

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
  padding: 0 ${themeCssVariables.spacing[2]} 0 ${themeCssVariables.spacing[2]};
  box-sizing: border-box;

  transition: background 0.1s ease;

  white-space: nowrap;

  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};

  &:hover {
    background: var(--btn-hover-bg);
  }
  &:active {
    background: var(--btn-active-bg);
  }

  &:focus {
    outline: none;
  }
`;

const StyledButtonWrapper = styled.div<
  Pick<ButtonProps, 'isLoading' | 'fullWidth'>
>`
  max-width: ${({ isLoading }) =>
    isLoading ? `calc(100% - ${themeCssVariables.spacing[8]})` : 'none'};

  position: relative;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`;

const computeButtonWrapperColor = (
  variant: ButtonVariant,
  accent: ButtonAccent,
  inverted: boolean,
  disabled: boolean,
): string => {
  switch (variant) {
    case 'primary':
      switch (accent) {
        case 'default':
          return !inverted
            ? !disabled
              ? themeCssVariables.font.color.secondary
              : themeCssVariables.font.color.extraLight
            : themeCssVariables.font.color.secondary;
        case 'blue':
          return !inverted
            ? GRAY_SCALE_LIGHT.gray1
            : themeCssVariables.color.blue;
        case 'danger':
          return !inverted
            ? themeCssVariables.background.primary
            : themeCssVariables.color.red;
      }
      break;
    case 'secondary':
    case 'tertiary':
      switch (accent) {
        case 'default':
          return !inverted
            ? !disabled
              ? themeCssVariables.font.color.secondary
              : themeCssVariables.font.color.extraLight
            : themeCssVariables.font.color.inverted;
        case 'blue':
          return !inverted
            ? !disabled
              ? themeCssVariables.color.blue
              : themeCssVariables.accent.accent4060
            : themeCssVariables.font.color.inverted;
        case 'danger':
          return !inverted
            ? themeCssVariables.font.color.danger
            : themeCssVariables.font.color.inverted;
      }
      break;
  }
  return themeCssVariables.font.color.secondary;
};

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
  const isDisabled = soon || disabled;

  const dynamicStyles = useMemo(() => {
    const s = computeButtonDynamicStyles(
      variant,
      accent,
      inverted,
      isDisabled,
      isFocused,
      position,
    );
    return {
      '--btn-bg': s.background,
      '--btn-border-color': s.borderColor,
      '--btn-border-width': s.borderWidthOverride || undefined,
      '--btn-box-shadow': s.boxShadow,
      '--btn-color': s.color,
      '--btn-hover-bg': s.hoverBackground,
      '--btn-active-bg': s.activeBackground,
      '--tw-button-color': computeButtonWrapperColor(
        variant,
        accent,
        inverted,
        isDisabled,
      ),
    } as React.CSSProperties;
  }, [variant, accent, inverted, isDisabled, isFocused, position]);

  return (
    <StyledButtonWrapper
      isLoading={!!isLoading}
      fullWidth={fullWidth}
      style={dynamicStyles}
    >
      <StyledButton
        fullWidth={fullWidth}
        position={position}
        disabled={isDisabled}
        hasIcon={!!Icon}
        focus={isFocused}
        justify={justify}
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
        style={dynamicStyles}
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
