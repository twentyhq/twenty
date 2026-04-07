import { styled } from '@linaria/react';
import { motion } from 'framer-motion';
import { VISUAL_TOKENS } from './homeVisualTokens';

const DEFAULT_LOADER_COLOR = `var(--tw-button-color, ${VISUAL_TOKENS.font.color.tertiary})`;

const StyledLoaderContainer = styled.div`
  align-items: center;
  border: 1px solid ${DEFAULT_LOADER_COLOR};
  border-radius: ${VISUAL_TOKENS.border.radius.pill};
  box-sizing: border-box;
  display: flex;
  gap: ${VISUAL_TOKENS.spacing[2]};
  height: 12px;
  justify-content: center;
  overflow: hidden;
  width: 24px;
`;

const StyledLoader = styled(motion.div)`
  background-color: ${DEFAULT_LOADER_COLOR};
  border-radius: ${VISUAL_TOKENS.border.radius.pill};
  height: 8px;
  width: 8px;
`;

type HomeVisualLoaderProps = {
  color?: string;
};

export function HomeVisualLoader({ color }: HomeVisualLoaderProps) {
  return (
    <StyledLoaderContainer
      style={color ? { borderColor: color } : undefined}
    >
      <StyledLoader
        animate={{
          x: [-16, 0, 16],
          width: [8, 12, 8],
          height: [8, 2, 8],
        }}
        style={color ? { backgroundColor: color } : undefined}
        transition={{
          duration: 0.8,
          times: [0, 0.15, 0.3],
          repeat: Infinity,
        }}
      />
    </StyledLoaderContainer>
  );
}
