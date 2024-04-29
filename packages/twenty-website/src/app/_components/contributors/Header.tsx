'use client';

import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const Title = styled.h2`
  font-size: 56px;
  font-weight: bold;
  color: #b3b3b3;
  margin-bottom: 32px;
  margin-top: 64px;
  text-align: center;
  display: flex;
  justify-items: center;
  align-items: center;
  flex-direction: column;

  @media (max-width: 810px) {
    font-size: 32px;
    margin-bottom: 22px;
  }
`;

export const Header = () => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Title>
          Our amazing <br />
          <span style={{ color: '#141414' }}>Contributors</span>
        </Title>
      </motion.div>
    </>
  );
};
