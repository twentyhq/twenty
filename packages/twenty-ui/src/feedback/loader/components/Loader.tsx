import { styled } from '@linaria/react';
import { type ThemeColor } from '@ui/theme';
import { motion, type MotionProps } from 'framer-motion';

const StyledLoaderContainer = styled.div<{
  color?: ThemeColor;
}>`
  box-sizing: border-box;
  justify-content: center;
  align-items: center;
  display: flex;
  gap: var(--spacing-2);
  width: var(--spacing-6);
  height: var(--spacing-3);
  border-radius: var(--border-radius-pill);
  border: 1px solid
    ${({ color }) =>
      color ? `var(--tag-text-${color})` : `var(--font-color-tertiary)`};
  overflow: hidden;
`;

const StyledLoader = styled(motion.div as any)<
  MotionProps & { color?: ThemeColor }
>`
  background-color: ${({ color }) =>
    color ? `var(--tag-text-${color})` : `var(--font-color-tertiary)`};
  border-radius: var(--border-radius-pill);
  height: 8px;
  width: 8px;
`;

type LoaderProps = {
  color?: ThemeColor;
};

export const Loader = ({ color }: LoaderProps) => (
  <StyledLoaderContainer color={color}>
    <StyledLoader
      color={color}
      animate={{
        x: [-16, 0, 16],
        width: [8, 12, 8],
        height: [8, 2, 8],
      }}
      transition={{
        duration: 0.8,
        times: [0, 0.15, 0.3],
        repeat: Infinity,
      }}
    />
  </StyledLoaderContainer>
);
