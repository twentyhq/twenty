import { motion } from 'framer-motion';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';

const StyledEllipsis = styled.div`
  display: flex;
`;

export const AnimatedEllipsis = () => {
  const theme = useTheme();
  return (
    <StyledEllipsis>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, scale: 1.2, y: -0.3 }}
          animate={{
            opacity: [0, 1, 0, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: theme.animation.duration.slow,
            ease: 'easeInOut',
            delay: i * 0.2,
          }}
        >
          .
        </motion.span>
      ))}
    </StyledEllipsis>
  );
};
