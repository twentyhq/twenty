import { styled } from '@linaria/react';
import { type IconComponent } from '@ui/display/icon/types/IconComponent';
import { ButtonHotkeys } from '@ui/input/button/components/Button/internal/ButtonHotKeys';
import { ButtonIcon } from '@ui/input/button/components/Button/internal/ButtonIcon';
import { ButtonSoon } from '@ui/input/button/components/Button/internal/ButtonSoon';
import { themeCssVariables } from '@ui/theme-constants';
import { GRAY_SCALE_LIGHT } from '@ui/theme/constants/GrayScaleLight';
import { useIsMobile } from '@ui/utilities';
import { type ClickOutsideAttributes } from '@ui/utilities/types/ClickOutsideAttributes';
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { ButtonText } from './internal/ButtonText';
import { computeButtonDynamicStyles, computeButtonWrapperColor } from './internal/computeButtonStyles';
import {
  ButtonAccent,
  ButtonPosition,
  ButtonProps,
  ButtonVariant,
} from './Button.types';
import type { ButtonDynamicStyles } from './Button.types';

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
    const s: ButtonDynamicStyles = computeButtonDynamicStyles(
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
