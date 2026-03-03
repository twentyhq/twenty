import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { styled } from '@linaria/react';

import { ThemeContext } from '@ui/theme';

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
  const { theme } = useContext(ThemeContext);
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
