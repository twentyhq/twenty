import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { motion } from 'framer-motion';

const StyledCardContent = styled(motion.div as any)<{ divider?: boolean }>`
  background-color: var(--color-background-secondary);
  padding: var(--spacing-4);

  ${({ divider }) =>
    divider
      ? css`
          border-bottom: 1px solid var(--color-border-medium);
        `
      : ''}
`;

export { StyledCardContent as CardContent };
