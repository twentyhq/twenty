import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const StyledMotionDiv = styled(motion.div)`
  max-width: 100%;
`;

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
};

const MotionContainer = ({ children }: { children?: React.ReactNode }) => (
  <StyledMotionDiv
    variants={containerVariants}
    initial="hidden"
    animate="visible"
  >
    {children}
  </StyledMotionDiv>
);

export default MotionContainer;
