import { styled } from '@linaria/react';
import { type IconComponent } from '@ui/display';
import {
  type LightIconButtonAccent,
  type LightIconButtonSize,
} from '@ui/input/button/components/LightIconButton';
import { ThemeContext, themeCssVariables } from '@ui/theme';
import { motion, type MotionProps } from 'framer-motion';
import { type ComponentProps, type MouseEvent, useContext } from 'react';

export type AnimatedLightIconButtonProps = {
  className?: string;
  testId?: string;
  Icon?: IconComponent;
  title?: string;
  size?: LightIconButtonSize;
  accent?: LightIconButtonAccent;
  active?: boolean;
  disabled?: boolean;
  focus?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
} & Pick<ComponentProps<'button'>, 'aria-label' | 'title'> &
  Pick<MotionProps, 'animate' | 'transition'>;

const StyledButton = styled.button<
  Pick<AnimatedLightIconButtonProps, 'accent' | 'active' | 'size' | 'focus'>
>`
  align-items: center;
  background: transparent;
  border: none;

  border: ${({ disabled, focus }) =>
    !disabled && focus ? `1px solid ${themeCssVariables.color.blue}` : 'none'};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-shadow: ${({ disabled, focus }) =>
    !disabled && focus ? `0 0 0 3px ${themeCssVariables.color.blue3}` : 'none'};
  color: ${({ accent, active, disabled, focus }) => {
    switch (accent) {
      case 'secondary':
        return active || focus
          ? themeCssVariables.color.blue
          : !disabled
            ? themeCssVariables.font.color.secondary
            : themeCssVariables.font.color.extraLight;
      case 'tertiary':
        return active || focus
          ? themeCssVariables.color.blue
          : !disabled
            ? themeCssVariables.font.color.tertiary
            : themeCssVariables.font.color.extraLight;
    }
    return '';
  }};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  flex-direction: row;

  font-family: ${themeCssVariables.font.family};
  font-weight: ${themeCssVariables.font.weight.regular};
  gap: ${themeCssVariables.spacing[1]};
  height: ${({ size }) => (size === 'small' ? '24px' : '32px')};
  justify-content: center;
  padding: ${themeCssVariables.spacing[1]};
  transition: background 0.1s ease;

  white-space: nowrap;
  width: ${({ size }) => (size === 'small' ? '24px' : '32px')};
  min-width: ${({ size }) => (size === 'small' ? '24px' : '32px')};

  &:hover {
    background: ${({ disabled }) =>
      !disabled
        ? themeCssVariables.background.transparent.light
        : 'transparent'};
  }

  &:focus {
    outline: none;
  }

  &:active {
    background: ${({ disabled }) =>
      !disabled
        ? themeCssVariables.background.transparent.medium
        : 'transparent'};
  }
`;

const StyledIconContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const AnimatedLightIconButton = ({
  'aria-label': ariaLabel,
  className,
  testId,
  animate,
  transition,
  Icon,
  active = false,
  size = 'small',
  accent = 'secondary',
  disabled = false,
  focus = false,
  onClick,
  title,
}: AnimatedLightIconButtonProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledButton
      data-testid={testId}
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      focus={focus && !disabled}
      accent={accent}
      className={className}
      size={size}
      active={active}
      title={title}
    >
      <StyledIconContainer animate={animate} transition={transition}>
        {Icon && (
          <Icon
            size={size === 'medium' ? theme.icon.size.md : theme.icon.size.sm}
          />
        )}
      </StyledIconContainer>
    </StyledButton>
  );
};
