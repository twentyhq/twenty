import { styled } from '@linaria/react';
import { VisibilityHidden } from '@ui/accessibility';
import { IconChevronDown } from '@ui/display';
import { useJsonTreeContextOrThrow } from '@ui/json-visualizer/hooks/useJsonTreeContextOrThrow';
import { ANIMATION, ThemeContext, themeCssVariables } from '@ui/theme';
import { motion } from 'framer-motion';
import { useContext } from 'react';

const StyledButton = styled.button<{
  variant?: 'blue' | 'red';
}>`
  align-items: center;
  background-color: ${({ variant }) =>
    variant === 'red'
      ? themeCssVariables.background.danger
      : themeCssVariables.background.transparent.lighter};
  border-color: ${({ variant }) =>
    variant === 'red'
      ? themeCssVariables.border.color.danger
      : themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  border-style: solid;
  border-width: 1px;
  display: flex;
  justify-content: center;
  padding-inline: ${themeCssVariables.spacing[1]};
  height: 24px;
  width: 24px;
  box-sizing: border-box;
  cursor: pointer;
`;

const MotionIconChevronDown = motion.create(IconChevronDown);

export const JsonArrow = ({
  isOpen,
  onClick,
  variant,
}: {
  isOpen: boolean;
  onClick: () => void;
  variant?: 'blue' | 'red';
}) => {
  const { theme } = useContext(ThemeContext);

  const { arrowButtonCollapsedLabel, arrowButtonExpandedLabel } =
    useJsonTreeContextOrThrow();

  return (
    <StyledButton variant={variant} onClick={onClick}>
      <VisibilityHidden>
        {isOpen ? arrowButtonExpandedLabel : arrowButtonCollapsedLabel}
      </VisibilityHidden>

      <MotionIconChevronDown
        size={theme.icon.size.md}
        color={
          variant === 'blue'
            ? theme.color.blue
            : variant === 'red'
              ? theme.font.color.danger
              : theme.font.color.secondary
        }
        initial={false}
        animate={{ rotate: isOpen ? 0 : -90 }}
        transition={{ duration: ANIMATION.duration.normal }}
      />
    </StyledButton>
  );
};
