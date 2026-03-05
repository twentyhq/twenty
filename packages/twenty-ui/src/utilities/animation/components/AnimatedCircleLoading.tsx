import React from 'react';
import { motion } from 'framer-motion';
import { styled } from '@linaria/react';

import {
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from '@ui/theme-constants';

const StyledAnimatedContainer = styled(motion.div)`
  align-items: center;
  display: flex;
  justify-content: center;
`;

export const AnimatedCircleLoading = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <StyledAnimatedContainer
      initial={{ rotate: 0 }}
      animate={{
        rotate: 360,
      }}
      transition={{
        repeat: Infinity,
        duration: resolveThemeVariableAsNumber(
          themeCssVariables.animation.duration.slow,
        ),
        ease: 'easeInOut',
      }}
    >
      {children}
    </StyledAnimatedContainer>
  );
};
