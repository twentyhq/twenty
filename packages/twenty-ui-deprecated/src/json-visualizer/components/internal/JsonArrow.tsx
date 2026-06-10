import { styled } from '@linaria/react';
import { VisibilityHidden } from '@ui/accessibility';
import { IconChevronDown } from '@ui/display';
import { useJsonTreeContextOrThrow } from '@ui/json-visualizer/hooks/useJsonTreeContextOrThrow';
import { ThemeContext, themeCssVariables } from '@ui/theme-constants';
import { useContext } from 'react';
import { motion } from 'framer-motion';

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

  const iconColor =
    variant === 'blue'
      ? themeCssVariables.color.blue
      : variant === 'red'
        ? themeCssVariables.font.color.danger
        : themeCssVariables.font.color.secondary;

  return (
    <StyledButton variant={variant} onClick={onClick}>
      <VisibilityHidden>
        {isOpen ? arrowButtonExpandedLabel : arrowButtonCollapsedLabel}
      </VisibilityHidden>

      <motion.div
        initial={false}
        animate={{ rotate: isOpen ? 0 : -90 }}
        transition={{ duration: 0.3 }}
      >
        <IconChevronDown size={theme.icon.size.md} color={iconColor} />
      </motion.div>
    </StyledButton>
  );
};
