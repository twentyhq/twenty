import { useTheme } from '@emotion/react';
import { styled } from '@linaria/react';
import { VisibilityHidden } from '@ui/accessibility';
import { IconChevronDown } from '@ui/display';
import { useJsonTreeContextOrThrow } from '@ui/json-visualizer/hooks/useJsonTreeContextOrThrow';
import { ANIMATION } from '@ui/theme';
import { type HTMLMotionProps, motion } from 'framer-motion';

const StyledButton = styled(motion.button as any)<
  { variant?: 'blue' | 'red' } & HTMLMotionProps<'button'>
>`
  align-items: center;
  background-color: ${({ variant }) =>
    variant === 'red'
      ? 'var(--background-danger)'
      : 'var(--background-transparent-lighter)'};
  border-color: ${({ variant }) =>
    variant === 'red'
      ? 'var(--border-color-danger)'
      : 'var(--border-color-medium)'};
  border-radius: var(--border-radius-sm);
  border-style: solid;
  border-width: 1px;
  display: flex;
  justify-content: center;
  padding-inline: var(--spacing-1);
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
  const theme = useTheme();

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
