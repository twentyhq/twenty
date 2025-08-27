import { styled } from '@linaria/react';
import { motion } from 'framer-motion';

const StyledEmptyContainer = styled(motion.div)`
  align-items: center;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
  justify-content: center;
  text-align: center;
`;

export { StyledEmptyContainer as AnimatedPlaceholderEmptyContainer };

export const EMPTY_PLACEHOLDER_TRANSITION_PROPS = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: {
    duration: 0.15,
  },
};

const StyledEmptyTextContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  justify-content: center;
  text-align: center;
  width: 100%;
`;

export { StyledEmptyTextContainer as AnimatedPlaceholderEmptyTextContainer };

const StyledEmptyTitle = styled.div`
  color: var(--font-color-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semi-bold);
`;

export { StyledEmptyTitle as AnimatedPlaceholderEmptyTitle };

const StyledEmptySubTitle = styled.div`
  color: var(--font-color-tertiary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-lg);
  max-height: 2.8em;
  overflow: hidden;
  width: 50%;
`;

export { StyledEmptySubTitle as AnimatedPlaceholderEmptySubTitle };
