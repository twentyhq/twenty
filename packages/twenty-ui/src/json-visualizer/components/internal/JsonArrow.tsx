import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { VisibilityHidden } from '@ui/accessibility';
import { IconChevronDown } from '@ui/display';
import { useJsonTreeContextOrThrow } from '@ui/json-visualizer/hooks/useJsonTreeContextOrThrow';
import { ANIMATION } from '@ui/theme';
import { motion } from 'framer-motion';

const StyledButton = styled(motion.button)`
  align-items: center;
  border-color: ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border-style: solid;
  border-width: 1px;
  display: flex;
  justify-content: center;
  padding-inline: ${({ theme }) => theme.spacing(1)};
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  height: 24px;
  width: 24px;
  box-sizing: border-box;
  cursor: pointer;
`;

const MotionIconChevronDown = motion.create(IconChevronDown);

export const JsonArrow = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  const theme = useTheme();

  const { arrowButtonCollapsedLabel, arrowButtonExpandedLabel } =
    useJsonTreeContextOrThrow();

  return (
    <StyledButton onClick={onClick}>
      <VisibilityHidden>
        {isOpen ? arrowButtonExpandedLabel : arrowButtonCollapsedLabel}
      </VisibilityHidden>

      <MotionIconChevronDown
        size={theme.icon.size.md}
        color={theme.font.color.secondary}
        initial={false}
        animate={{ rotate: isOpen ? 0 : -90 }}
        transition={{ duration: ANIMATION.duration.normal }}
      />
    </StyledButton>
  );
};
