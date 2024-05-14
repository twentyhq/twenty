'use client';

import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const StyledTitle = styled.div`
  margin: 64px auto 0px;
  text-align: center;
  font-size: 1.8em;

  @media (max-width: 810px) {
    font-size: 1em;
    margin: 64px auto;
  }
`;
const StyledHeader = styled.h1`
  color: #b3b3b3;
  margin: 0;
`;
const StyledSubHeader = styled.h1`
  color: #141414;
  margin: 0;
`;

export const Title = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <StyledTitle>
        <StyledHeader>Latest</StyledHeader>
        <StyledSubHeader>Releases</StyledSubHeader>
      </StyledTitle>
    </motion.div>
  );
};
