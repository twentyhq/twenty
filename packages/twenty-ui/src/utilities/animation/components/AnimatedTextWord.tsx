import React, { useMemo } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const StyledContainer = styled(motion.div)`
  display: flex;
  overflow: hidden;
`;

const StyledWord = styled(motion.span)`
  white-space: pre;
`;

type AnimatedTextWordProps = Omit<
  React.ComponentProps<typeof motion.div>,
  'children'
> & {
  text: string;
};

const containerAnimation = {
  hidden: { opacity: 0 },
  visible: (i = 1) => ({
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.04 * i },
  }),
};

const childAnimation = {
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      damping: 12,
      stiffness: 100,
    },
  },
  hidden: {
    opacity: 0,
    x: 20,
    transition: {
      type: 'spring',
      damping: 12,
      stiffness: 100,
    },
  },
};

export const AnimatedTextWord = ({ text = '' }: AnimatedTextWordProps) => {
  const words = useMemo(() => {
    const words = text.split(' ');

    return words.map((value, index) =>
      index === words.length - 1 ? value : value + ' ',
    );
  }, [text]);

  return (
    <StyledContainer
      variants={containerAnimation}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, index) => (
        <StyledWord variants={childAnimation} key={index}>
          {word}
        </StyledWord>
      ))}
    </StyledContainer>
  );
};
