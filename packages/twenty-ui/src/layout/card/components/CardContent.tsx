import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const StyledCardContent = styled(motion.div)<{ divider?: boolean }>`
  background-color: ${({ theme }) => theme.background.secondary};
  padding: ${({ theme }) => theme.spacing(4)};

  ${({ divider, theme }) =>
    divider
      ? css`
          border-bottom: 1px solid ${theme.border.color.medium};
        `
      : ''}
`;

export { StyledCardContent as CardContent };
