import { useState } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

export type ProgressBarProps = {
  className?: string;
  color?: string;
  value: number;
};

export type StyledBarProps = {
  className?: string;
};

const StyledBar = styled.div<StyledBarProps>`
  height: ${({ theme }) => theme.spacing(2)};
  overflow: hidden;
  width: 100%;
`;

const StyledBarFilling = styled(motion.div)<{ color?: string }>`
  background-color: ${({ color, theme }) => color ?? theme.font.color.primary};
  height: 100%;
`;

export const ProgressBar = ({ className, color, value }: ProgressBarProps) => {
  const [initialValue] = useState(value);

  return (
    <StyledBar
      className={className}
      role="progressbar"
      aria-valuenow={Math.ceil(value)}
    >
      <StyledBarFilling
        initial={{ width: `${initialValue}%` }}
        animate={{ width: `${value}%` }}
        color={color}
        transition={{ ease: 'linear' }}
      />
    </StyledBar>
  );
};
