import { styled } from '@linaria/react';
import { type IconComponent } from '@ui/display';
import { GRAY_SCALE_LIGHT, ThemeContext, themeVar } from '@ui/theme';
import React, { useContext, useMemo } from 'react';

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

type IconButtonDynamicStyles = {
  background: string;
  borderColor: string;
  borderWidthOverride?: string;
  boxShadow: string;
  color: string;
  opacity: number;
  hoverBackground: string;
  activeBackground: string;
};

const computeIconButtonDynamicStyles = (
  variant: IconButtonVariant,
  accent: IconButtonAccent,
  disabled: boolean,
  focus: boolean,
): IconButtonDynamicStyles => {
  const focusOverride = !disabled && focus;

  switch (variant) {
    case 'primary':
      switch (accent) {
        case 'default':
          return {
            background: themeVar.background.secondary,
            borderColor: focus
              ? themeVar.color.blue
              : themeVar.background.transparent.light,
            borderWidthOverride: focusOverride ? '1px 1px' : undefined,
            boxShadow: focusOverride
              ? `0 0 0 3px ${themeVar.accent.tertiary}`
              : 'none',
            color: !disabled
              ? themeVar.font.color.secondary
              : themeVar.font.color.extraLight,
            opacity: 1,
            hoverBackground: !disabled
              ? themeVar.background.tertiary
              : themeVar.background.secondary,
            activeBackground: !disabled
              ? themeVar.background.quaternary
              : themeVar.background.secondary,
          };
        case 'blue':
          return {
            background: themeVar.color.blue,
            borderColor: !disabled
              ? focus
                ? themeVar.color.blue
                : themeVar.background.transparent.light
              : 'transparent',
            borderWidthOverride: focusOverride ? '1px 1px' : undefined,
            boxShadow: focusOverride
              ? `0 0 0 3px ${themeVar.accent.tertiary}`
              : 'none',
            color: GRAY_SCALE_LIGHT.gray1,
            opacity: disabled ? 0.24 : 1,
            hoverBackground: disabled
              ? themeVar.color.blue
              : themeVar.color.blue10,
            activeBackground: disabled
              ? themeVar.color.blue
              : themeVar.color.blue12,
          };
        case 'danger':
          return {
            background: themeVar.color.red,
            borderColor: !disabled
              ? focus
                ? themeVar.color.red
                : themeVar.background.transparent.light
              : 'transparent',
            borderWidthOverride: focusOverride ? '1px 1px' : undefined,
            boxShadow: focusOverride
              ? `0 0 0 3px ${themeVar.color.red3}`
              : 'none',
            color: GRAY_SCALE_LIGHT.gray1,
            opacity: disabled ? 0.24 : 1,
            hoverBackground: disabled
              ? themeVar.color.red
              : themeVar.color.red10,
            activeBackground: disabled
              ? themeVar.color.red
              : themeVar.color.red10,
          };
      }
      break;
    case 'secondary':
    case 'tertiary':
      switch (accent) {
        case 'default':
          return {
            background: focus
              ? themeVar.background.transparent.primary
              : 'transparent',
            borderColor:
              variant === 'secondary'
                ? focusOverride
                  ? themeVar.color.blue
                  : themeVar.background.transparent.medium
                : focus
                  ? themeVar.color.blue
                  : 'transparent',
            borderWidthOverride: focusOverride ? '1px 1px' : undefined,
            boxShadow: focusOverride
              ? `0 0 0 3px ${themeVar.accent.tertiary}`
              : 'none',
            color: disabled
              ? themeVar.font.color.extraLight
              : variant === 'secondary'
                ? themeVar.font.color.secondary
                : themeVar.font.color.tertiary,
            opacity: 1,
            hoverBackground: !disabled
              ? themeVar.background.transparent.light
              : 'transparent',
            activeBackground: !disabled
              ? themeVar.background.transparent.light
              : 'transparent',
          };
        case 'blue':
          return {
            background: focus
              ? themeVar.background.transparent.primary
              : 'transparent',
            borderColor:
              variant === 'secondary'
                ? !disabled
                  ? themeVar.color.blue
                  : themeVar.color.blue5
                : focus
                  ? themeVar.color.blue
                  : 'transparent',
            borderWidthOverride: focusOverride ? '1px 1px' : undefined,
            boxShadow: focusOverride
              ? `0 0 0 3px ${themeVar.accent.tertiary}`
              : 'none',
            color: !disabled ? themeVar.color.blue : themeVar.accent.accent4060,
            opacity: 1,
            hoverBackground: !disabled
              ? themeVar.accent.tertiary
              : 'transparent',
            activeBackground: !disabled
              ? themeVar.accent.secondary
              : 'transparent',
          };
        case 'danger':
          return {
            background: 'transparent',
            borderColor:
              variant === 'secondary'
                ? themeVar.border.color.danger
                : focus
                  ? themeVar.color.red
                  : 'transparent',
            borderWidthOverride: focusOverride ? '1px 1px' : undefined,
            boxShadow: focusOverride
              ? `0 0 0 3px ${themeVar.color.red3}`
              : 'none',
            color: !disabled ? themeVar.font.color.danger : themeVar.color.red5,
            opacity: 1,
            hoverBackground: !disabled
              ? themeVar.background.danger
              : 'transparent',
            activeBackground: !disabled
              ? themeVar.background.danger
              : 'transparent',
          };
      }
  }

  return {
    background: 'transparent',
    borderColor: 'transparent',
    boxShadow: 'none',
    color: themeVar.font.color.secondary,
    opacity: 1,
    hoverBackground: 'transparent',
    activeBackground: 'transparent',
  };
};

const StyledButton = styled.button<
  Pick<
    IconButtonProps,
    'variant' | 'size' | 'position' | 'accent' | 'focus' | 'to'
  >
>`
  align-items: center;
  background: var(--ibtn-bg);
  border-color: var(--ibtn-border-color);
  box-shadow: var(--ibtn-box-shadow);
  color: var(--ibtn-color);
  opacity: var(--ibtn-opacity, 1);
  &:hover {
    background: var(--ibtn-hover-bg);
  }
  &:active {
    background: var(--ibtn-active-bg);
  }

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
  border-width: var(
    --ibtn-border-width,
    ${({ variant, position }) => {
      switch (variant) {
        case 'primary':
        case 'secondary':
          return position === 'middle' ? '1px 0px' : '1px';
        case 'tertiary':
          return '0';
      }
      return '';
    }}
  );
  box-sizing: border-box;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  flex-direction: row;
  font-family: ${themeVar.font.family};
  font-weight: 500;
  gap: ${themeVar.spacing[1]};
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
  const { theme } = useContext(ThemeContext);
  const dynamicStyles = useMemo(() => {
    const styles = computeIconButtonDynamicStyles(
      variant,
      accent,
      disabled,
      focus,
    );
    return {
      '--ibtn-bg': styles.background,
      '--ibtn-border-color': styles.borderColor,
      '--ibtn-border-width': styles.borderWidthOverride || undefined,
      '--ibtn-box-shadow': styles.boxShadow,
      '--ibtn-color': styles.color,
      '--ibtn-opacity': styles.opacity,
      '--ibtn-hover-bg': styles.hoverBackground,
      '--ibtn-active-bg': styles.activeBackground,
    } as React.CSSProperties;
  }, [variant, accent, disabled, focus]);

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
      style={dynamicStyles}
    >
      {Icon && <Icon size={theme.icon.size.md} />}
    </StyledButton>
  );
};
