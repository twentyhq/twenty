import { styled } from '@linaria/react';
import { type IconComponent } from '@ui/display/icon/types/IconComponent';
import { ButtonHotkeys } from '@ui/input/button/components/Button/internal/ButtonHotKeys';
import { ButtonIcon } from '@ui/input/button/components/Button/internal/ButtonIcon';
import { ButtonSoon } from '@ui/input/button/components/Button/internal/ButtonSoon';
import { GRAY_SCALE_LIGHT, ThemeContext, type ThemeType } from '@ui/theme';
import { useIsMobile } from '@ui/utilities';
import { type ClickOutsideAttributes } from '@ui/utilities/types/ClickOutsideAttributes';
import React, { useContext, useMemo, useState } from 'react';
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
  theme: ThemeType,
): ButtonDynamicStyles => {
  const result: ButtonDynamicStyles = {
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
            ? disabled
              ? theme.accent.accent4060
              : theme.color.blue
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
          result.color = !inverted ? GRAY_SCALE_LIGHT.gray1 : theme.color.blue;
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
                ? GRAY_SCALE_LIGHT.gray1
                : theme.background.transparent.primary
              : focus
                ? GRAY_SCALE_LIGHT.gray1
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
                ? GRAY_SCALE_LIGHT.gray1
                : theme.background.transparent.primary
              : focus
                ? GRAY_SCALE_LIGHT.gray1
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
                ? GRAY_SCALE_LIGHT.gray1
                : theme.background.transparent.primary
              : focus
                ? GRAY_SCALE_LIGHT.gray1
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
            ? !disabled
              ? theme.font.color.danger
              : theme.color.red5
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
    | 'focus'
    | 'justify'
    | 'to'
    | 'target'
    | 'isLoading'
  > & { hasIcon: boolean; theme: ThemeType }
>`
  align-items: center;
  background: var(--btn-bg);
  border-color: var(--btn-border-color);
  border-width: var(--btn-border-width);
  box-shadow: var(--btn-box-shadow);
  color: var(--btn-color);

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
    return '';
  }};
  border-style: solid;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  flex-direction: row;
  font-family: ${({ theme }) => theme.font.family};
  font-weight: 500;
  font-size: ${({ theme }) => theme.font.size.md};
  gap: ${({ theme }) => theme.spacing(1)};
  height: ${({ size }) => (size === 'small' ? '24px' : '32px')};
  justify-content: ${({ justify }) => justify ?? ''};
  padding: ${({ theme }) => {
    return `0 ${theme.spacing(2)} 0 ${theme.spacing(2)}`;
  }};
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
  Pick<ButtonProps, 'isLoading' | 'fullWidth'> & { theme: ThemeType }
>`
  max-width: ${({ isLoading, theme }) =>
    isLoading ? `calc(100% - ${theme.spacing(8)})` : 'none'};

  position: relative;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`;

const computeButtonWrapperColor = (
  variant: ButtonVariant,
  accent: ButtonAccent,
  inverted: boolean,
  disabled: boolean,
  theme: ThemeType,
): string => {
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
  return theme.font.color.secondary;
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
  const { theme } = useContext(ThemeContext);

  const [isFocused, setIsFocused] = useState(propFocus);
  const isDisabled = soon || disabled;

  const dynamicStyles = useMemo(() => {
    const s = computeButtonDynamicStyles(
      variant,
      accent,
      inverted,
      isDisabled,
      isFocused,
      theme,
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
        theme,
      ),
    } as React.CSSProperties;
  }, [variant, accent, inverted, isDisabled, isFocused, theme]);

  return (
    <StyledButtonWrapper
      theme={theme}
      isLoading={!!isLoading}
      fullWidth={fullWidth}
      style={dynamicStyles}
    >
      <StyledButton
        theme={theme}
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
