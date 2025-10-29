import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { type IconComponent } from '@ui/display';
import {
  type LightIconButtonAccent,
  type LightIconButtonSize,
} from '@ui/input/button/components/LightIconButton';
import { motion, type MotionProps } from 'framer-motion';
import { type ComponentProps, type MouseEvent } from 'react';

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

  border: ${({ disabled, theme, focus }) =>
    !disabled && focus ? `1px solid ${theme.color.blue}` : 'none'};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-shadow: ${({ disabled, theme, focus }) =>
    !disabled && focus ? `0 0 0 3px ${theme.color.blue3}` : 'none'};
  color: ${({ theme, accent, active, disabled, focus }) => {
    switch (accent) {
      case 'secondary':
        return active || focus
          ? theme.color.blue
          : !disabled
            ? theme.font.color.secondary
            : theme.font.color.extraLight;
      case 'tertiary':
        return active || focus
          ? theme.color.blue
          : !disabled
            ? theme.font.color.tertiary
            : theme.font.color.extraLight;
    }
  }};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  flex-direction: row;

  font-family: ${({ theme }) => theme.font.family};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  gap: ${({ theme }) => theme.spacing(1)};
  height: ${({ size }) => (size === 'small' ? '24px' : '32px')};
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(1)};
  transition: background 0.1s ease;

  white-space: nowrap;
  width: ${({ size }) => (size === 'small' ? '24px' : '32px')};
  min-width: ${({ size }) => (size === 'small' ? '24px' : '32px')};

  &:hover {
    background: ${({ theme, disabled }) =>
      !disabled ? theme.background.transparent.light : 'transparent'};
  }

  &:focus {
    outline: none;
  }

  &:active {
    background: ${({ theme, disabled }) =>
      !disabled ? theme.background.transparent.medium : 'transparent'};
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
  const theme = useTheme();

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
