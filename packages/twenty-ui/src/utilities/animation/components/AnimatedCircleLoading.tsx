import { useTheme } from '@emotion/react';
import { styled } from '@linaria/react';
import { motion } from 'framer-motion';
import React from 'react';

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
  const theme = useTheme();
  return (
    <StyledAnimatedContainer
      initial={{ rotate: 0 }}
      animate={{
        rotate: 360,
      }}
      transition={{
        repeat: Infinity,
        duration: theme.animation.duration.slow,
        ease: 'easeInOut',
      }}
    >
      {children}
    </StyledAnimatedContainer>
  );
};
