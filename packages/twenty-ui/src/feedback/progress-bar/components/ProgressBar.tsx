import { styled } from '@linaria/react';
import { themeCssVariables } from '@ui/theme';
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
  height: ${themeCssVariables.spacing[2]};
  background-color: ${({ backgroundColor }) => backgroundColor ?? ''};
  border-radius: ${({ withBorderRadius }) =>
    withBorderRadius ? themeCssVariables.border.radius.xxl : '0'};
  overflow: hidden;
  width: 100%;
`;

const StyledBarFillingBase = styled.div<{
  barColor?: string;
  withBorderRadius?: boolean;
}>`
  background-color: ${({ barColor }) =>
    barColor ?? themeCssVariables.font.color.primary};
  height: 100%;
  border-radius: ${({ withBorderRadius }) =>
    withBorderRadius ? themeCssVariables.border.radius.md : '0'};
`;

const StyledBarFilling = motion.create(StyledBarFillingBase);

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
