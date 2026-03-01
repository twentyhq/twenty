import { styled } from '@linaria/react';
import { type IconComponent } from '@ui/display';
import { ThemeContext, themeCssVariables } from '@ui/theme';
import { useContext } from 'react';
import { Link } from 'react-router-dom';

export type FloatingButtonSize = 'small' | 'medium';
export type FloatingButtonPosition = 'standalone' | 'left' | 'middle' | 'right';

export type FloatingButtonProps = {
  className?: string;
  Icon?: IconComponent;
  title?: string;
  size?: FloatingButtonSize;
  position?: FloatingButtonPosition;
  applyShadow?: boolean;
  applyBlur?: boolean;
  disabled?: boolean;
  focus?: boolean;
  to?: string;
};

const StyledButton = styled.button<
  Pick<
    FloatingButtonProps,
    | 'size'
    | 'focus'
    | 'position'
    | 'applyBlur'
    | 'applyShadow'
    | 'position'
    | 'to'
  >
>`
  align-items: center;
  backdrop-filter: ${({ applyBlur }) => (applyBlur ? 'blur(20px)' : 'none')};
  background: ${themeCssVariables.background.primary};

  border: ${({ focus }) =>
    focus ? `1px solid ${themeCssVariables.color.blue}` : 'none'};
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
  box-shadow: ${({ applyShadow, focus }) =>
    applyShadow
      ? `0px 2px 4px 0px ${
          themeCssVariables.background.transparent.light
        }, 0px 0px 4px 0px ${themeCssVariables.background.transparent.medium}${
          focus ? `,0 0 0 3px ${themeCssVariables.color.blue3}` : ''
        }`
      : focus
        ? `0 0 0 3px ${themeCssVariables.color.blue3}`
        : 'none'};
  color: ${({ disabled, focus }) => {
    return !disabled
      ? focus
        ? themeCssVariables.color.blue
        : themeCssVariables.font.color.secondary
      : themeCssVariables.font.color.extraLight;
  }};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;

  flex-direction: row;
  font-family: ${themeCssVariables.font.family};
  font-weight: ${themeCssVariables.font.weight.regular};
  gap: ${themeCssVariables.spacing[1]};
  height: ${({ size }) => (size === 'small' ? '24px' : '32px')};
  padding: 0 ${themeCssVariables.spacing[2]};
  transition: background 0.1s ease;

  white-space: nowrap;

  &:hover {
    background: ${({ disabled }) =>
      !disabled
        ? themeCssVariables.background.transparent.lighter
        : 'transparent'};
  }

  &:active {
    background: ${({ disabled }) =>
      !disabled
        ? themeCssVariables.background.transparent.medium
        : 'transparent'};
  }

  &:focus {
    outline: none;
  }
  text-decoration: none;
`;

export const FloatingButton = ({
  className,
  Icon,
  title,
  size = 'small',
  position = 'standalone',
  applyBlur = true,
  applyShadow = true,
  disabled = false,
  focus = false,
  to,
}: FloatingButtonProps) => {
  const { theme } = useContext(ThemeContext);
  return (
    <StyledButton
      disabled={disabled}
      focus={focus && !disabled}
      size={size}
      applyBlur={applyBlur}
      applyShadow={applyShadow}
      position={position}
      className={className}
      to={to}
      as={to ? Link : 'button'}
    >
      {Icon && <Icon size={theme.icon.size.sm} />}
      {title}
    </StyledButton>
  );
};
