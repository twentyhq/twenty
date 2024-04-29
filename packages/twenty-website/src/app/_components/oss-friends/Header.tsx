'use client';

import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const Title = styled.h2`
  font-size: 56px;
  font-weight: 600;
  color: #b3b3b3;
  margin-bottom: 0px;
  margin-top: 64px;

  @media (max-width: 810px) {
    font-size: 28px;
  }
`;

const Description = styled.h2`
  font-size: 20px;
  color: #818181;
  margin-top: 0px;
  margin-bottom: 36px;
  font-weight: 400;
  @media (max-width: 810px) {
    font-size: 18px;
  }
`;

export const Header = () => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.01 }}
      >
        <Title>
          Open-source <br /> <span style={{ color: 'black' }}>friends</span>
        </Title>
      </motion.div>
      <Description>
        We are proud to collaborate with a diverse group of partners to <br />
        promote open-source software.
      </Description>
    </>
  );
};
