import { styled } from '@linaria/react';
import { type IconComponent } from '@ui/display/icon/types/IconComponent';
import { ButtonHotkeys } from '@ui/input/button/components/Button/internal/ButtonHotKeys';
import { ButtonIcon } from '@ui/input/button/components/Button/internal/ButtonIcon';
import { ButtonSoon } from '@ui/input/button/components/Button/internal/ButtonSoon';
import { GRAY_SCALE_LIGHT, themeVar } from '@ui/theme';
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
): ButtonDynamicStyles => {
  const result: ButtonDynamicStyles = {
    background: 'transparent',
    borderColor: 'transparent',
    borderWidthOverride: '',
    boxShadow: 'none',
    color: themeVar.font.color.secondary,
    hoverBackground: 'transparent',
    activeBackground: 'transparent',
  };

  switch (variant) {
    case 'primary':
      switch (accent) {
        case 'default':
          result.background = !inverted
            ? themeVar.background.secondary
            : themeVar.background.primary;
          result.borderColor = !inverted
            ? !disabled && focus
              ? themeVar.color.blue
              : themeVar.background.transparent.light
            : themeVar.background.transparent.light;
          result.borderWidthOverride = '1px 1px 1px 1px';
          result.boxShadow =
            !disabled && focus
              ? `0 0 0 3px ${
                  !inverted
                    ? themeVar.accent.tertiary
                    : themeVar.background.transparent.medium
                }`
              : 'none';
          result.color = !inverted
            ? !disabled
              ? themeVar.font.color.secondary
              : themeVar.font.color.extraLight
            : themeVar.font.color.secondary;
          if (!disabled) {
            result.hoverBackground = !inverted
              ? themeVar.background.tertiary
              : themeVar.background.secondary;
            result.activeBackground = !inverted
              ? themeVar.background.quaternary
              : themeVar.background.tertiary;
          } else {
            result.hoverBackground = result.background;
            result.activeBackground = result.background;
          }
          break;
        case 'blue':
          result.background = !inverted
            ? disabled
              ? themeVar.accent.accent4060
              : themeVar.color.blue
            : themeVar.background.primary;
          result.borderColor = !inverted
            ? focus
              ? themeVar.color.blue
              : themeVar.background.transparent.light
            : themeVar.background.transparent.light;
          result.borderWidthOverride = '1px 1px 1px 1px';
          result.boxShadow =
            !disabled && focus
              ? `0 0 0 3px ${
                  !inverted
                    ? themeVar.accent.tertiary
                    : themeVar.background.transparent.medium
                }`
              : 'none';
          result.color = !inverted
            ? GRAY_SCALE_LIGHT.gray1
            : themeVar.color.blue;
          if (!disabled) {
            result.hoverBackground = !inverted
              ? themeVar.color.blue10
              : themeVar.background.secondary;
            result.activeBackground = !inverted
              ? themeVar.color.blue12
              : themeVar.background.tertiary;
          } else {
            result.hoverBackground = result.background;
            result.activeBackground = result.background;
          }
          break;
        case 'danger':
          result.background = !inverted
            ? themeVar.color.red
            : themeVar.background.primary;
          result.borderColor = !inverted
            ? focus
              ? themeVar.color.red
              : themeVar.background.transparent.light
            : themeVar.background.transparent.light;
          result.borderWidthOverride = '1px 1px';
          result.boxShadow =
            !disabled && focus
              ? `0 0 0 3px ${
                  !inverted
                    ? themeVar.color.red3
                    : themeVar.background.transparent.medium
                }`
              : 'none';
          result.color = !inverted
            ? themeVar.background.primary
            : themeVar.color.red;
          if (!disabled) {
            result.hoverBackground = !inverted
              ? themeVar.color.red8
              : themeVar.background.secondary;
            result.activeBackground = !inverted
              ? themeVar.color.red10
              : themeVar.background.tertiary;
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
                ? themeVar.color.blue
                : themeVar.background.transparent.medium
              : focus
                ? themeVar.color.blue
                : 'transparent'
            : variant === 'secondary'
              ? focus || disabled
                ? GRAY_SCALE_LIGHT.gray1
                : themeVar.background.transparent.primary
              : focus
                ? GRAY_SCALE_LIGHT.gray1
                : 'transparent';
          result.borderWidthOverride = '1px 1px 1px 1px';
          result.boxShadow =
            !disabled && focus
              ? `0 0 0 3px ${
                  !inverted
                    ? themeVar.accent.tertiary
                    : themeVar.background.transparent.medium
                }`
              : 'none';
          result.color = !inverted
            ? !disabled
              ? themeVar.font.color.secondary
              : themeVar.font.color.extraLight
            : themeVar.font.color.inverted;
          result.hoverBackground = !inverted
            ? !disabled
              ? themeVar.background.transparent.light
              : 'transparent'
            : themeVar.background.transparent.light;
          result.activeBackground = !inverted
            ? !disabled
              ? themeVar.background.transparent.light
              : 'transparent'
            : themeVar.background.transparent.medium;
          break;
        case 'blue':
          result.borderColor = !inverted
            ? variant === 'secondary'
              ? focus
                ? themeVar.color.blue
                : themeVar.accent.primary
              : focus
                ? themeVar.color.blue
                : 'transparent'
            : variant === 'secondary'
              ? focus || disabled
                ? GRAY_SCALE_LIGHT.gray1
                : themeVar.background.transparent.primary
              : focus
                ? GRAY_SCALE_LIGHT.gray1
                : 'transparent';
          result.borderWidthOverride = '1px 1px 1px 1px';
          result.boxShadow =
            !disabled && focus
              ? `0 0 0 3px ${
                  !inverted
                    ? themeVar.accent.tertiary
                    : themeVar.background.transparent.medium
                }`
              : 'none';
          result.color = !inverted
            ? !disabled
              ? themeVar.color.blue
              : themeVar.accent.accent4060
            : themeVar.font.color.inverted;
          result.hoverBackground = !inverted
            ? !disabled
              ? themeVar.accent.tertiary
              : 'transparent'
            : themeVar.background.transparent.light;
          result.activeBackground = !inverted
            ? !disabled
              ? themeVar.accent.secondary
              : 'transparent'
            : themeVar.background.transparent.medium;
          break;
        case 'danger':
          result.borderColor = !inverted
            ? variant === 'secondary'
              ? focus
                ? themeVar.color.red
                : themeVar.border.color.danger
              : focus
                ? themeVar.color.red
                : 'transparent'
            : variant === 'secondary'
              ? focus || disabled
                ? GRAY_SCALE_LIGHT.gray1
                : themeVar.background.transparent.primary
              : focus
                ? GRAY_SCALE_LIGHT.gray1
                : 'transparent';
          result.borderWidthOverride = '1px 1px 1px 1px';
          result.boxShadow =
            !disabled && focus
              ? `0 0 0 3px ${
                  !inverted
                    ? themeVar.color.red3
                    : themeVar.background.transparent.medium
                }`
              : 'none';
          result.color = !inverted
            ? !disabled
              ? themeVar.font.color.danger
              : themeVar.color.red5
            : themeVar.font.color.inverted;
          result.hoverBackground = !inverted
            ? !disabled
              ? themeVar.background.danger
              : 'transparent'
            : themeVar.background.transparent.light;
          result.activeBackground = !inverted
            ? !disabled
              ? themeVar.background.danger
              : 'transparent'
            : themeVar.background.transparent.medium;
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
        return `${themeVar.border.radius.sm} 0px 0px ${themeVar.border.radius.sm}`;
      case 'right':
        return `0px ${themeVar.border.radius.sm} ${themeVar.border.radius.sm} 0px`;
      case 'middle':
        return '0px';
      case 'standalone':
        return themeVar.border.radius.sm;
    }
    return '';
  }};
  border-style: solid;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  flex-direction: row;
  font-family: ${themeVar.font.family};
  font-weight: 500;
  font-size: ${themeVar.font.size.md};
  gap: ${themeVar.spacing[1]};
  height: ${({ size }) => (size === 'small' ? '24px' : '32px')};
  justify-content: ${({ justify }) => justify ?? ''};
  padding: 0 ${themeVar.spacing[2]} 0 ${themeVar.spacing[2]};
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
    isLoading ? `calc(100% - ${themeVar.spacing[8]})` : 'none'};

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
              ? themeVar.font.color.secondary
              : themeVar.font.color.extraLight
            : themeVar.font.color.secondary;
        case 'blue':
          return !inverted ? GRAY_SCALE_LIGHT.gray1 : themeVar.color.blue;
        case 'danger':
          return !inverted ? themeVar.background.primary : themeVar.color.red;
      }
      break;
    case 'secondary':
    case 'tertiary':
      switch (accent) {
        case 'default':
          return !inverted
            ? !disabled
              ? themeVar.font.color.secondary
              : themeVar.font.color.extraLight
            : themeVar.font.color.inverted;
        case 'blue':
          return !inverted
            ? !disabled
              ? themeVar.color.blue
              : themeVar.accent.accent4060
            : themeVar.font.color.inverted;
        case 'danger':
          return !inverted
            ? themeVar.font.color.danger
            : themeVar.font.color.inverted;
      }
      break;
  }
  return themeVar.font.color.secondary;
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
  }, [variant, accent, inverted, isDisabled, isFocused]);

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
