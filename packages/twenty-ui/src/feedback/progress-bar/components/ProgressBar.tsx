import { styled } from '@linaria/react';
import { motion, type MotionProps } from 'framer-motion';
import { useState } from 'react';

export type ProgressBarProps = {
  value: number;
  className?: string;
  barColor?: string;
  backgroundColor?: string;
  withBorderRadius?: boolean;
};

export type StyledBarProps = {
  className?: string;
  backgroundColor?: string;
  withBorderRadius?: boolean;
};

const StyledBar = styled.div<StyledBarProps>`
  height: var(--spacing-2);
  background-color: ${({ backgroundColor }) => backgroundColor ?? 'none'};
  border-radius: ${({ withBorderRadius }) =>
    withBorderRadius ? 'var(--border-radius-xxl)' : '0'};
  overflow: hidden;
  width: 100%;
`;

const StyledBarFilling = styled(motion.div as any)<
  MotionProps & {
    barColor?: string;
    withBorderRadius?: boolean;
  }
>`
  background-color: ${({ barColor }) =>
    barColor ?? 'var(--font-color-primary)'};
  height: 100%;
  border-radius: ${({ withBorderRadius }) =>
    withBorderRadius ? 'var(--border-radius-md)' : '0'};
`;

export const ProgressBar = ({
  value,
  className,
  barColor,
  backgroundColor = 'none',
  withBorderRadius = false,
}: ProgressBarProps) => {
  const [initialValue] = useState(value);

  return (
    <StyledBar
      className={className}
      backgroundColor={backgroundColor}
      withBorderRadius={withBorderRadius}
      role="progressbar"
      aria-valuenow={Math.ceil(value)}
    >
      <StyledBarFilling
        initial={{ width: `${initialValue}%` }}
        animate={{ width: `${value}%` }}
        barColor={barColor}
        transition={{ ease: 'linear' }}
        withBorderRadius={withBorderRadius}
      />
    </StyledBar>
  );
};
