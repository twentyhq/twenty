import styled from '@emotion/styled';
import { motion } from 'framer-motion';
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
  height: ${({ theme }) => theme.spacing(2)};
  background-color: ${({ backgroundColor }) => backgroundColor};
  border-radius: ${({ withBorderRadius, theme }) =>
    withBorderRadius ? theme.border.radius.xxl : '0'};
  overflow: hidden;
  width: 100%;
`;

const StyledBarFilling = styled(motion.div)<{
  barColor?: string;
  withBorderRadius?: boolean;
}>`
  background-color: ${({ barColor, theme }) =>
    barColor ?? theme.font.color.primary};
  height: 100%;
  border-radius: ${({ withBorderRadius, theme }) =>
    withBorderRadius ? theme.border.radius.md : '0'};
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
