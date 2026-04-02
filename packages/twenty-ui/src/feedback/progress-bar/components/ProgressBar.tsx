import { styled } from '@linaria/react';
import { themeCssVariables } from '@ui/theme-constants';

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
  height: 100%;
  min-height: ${themeCssVariables.spacing[2]};
  background-color: ${({ backgroundColor }) => backgroundColor ?? ''};
  border-radius: ${({ withBorderRadius }) =>
    withBorderRadius ? themeCssVariables.border.radius.xxl : '0'};
  overflow: hidden;
  width: 100%;
`;

const StyledBarFilling = styled.div<{
  barColor?: string;
  withBorderRadius?: boolean;
}>`
  background-color: ${({ barColor }) =>
    barColor ?? themeCssVariables.font.color.primary};
  border-radius: ${({ withBorderRadius }) =>
    withBorderRadius ? themeCssVariables.border.radius.md : '0'};
  height: 100%;
  width: 100%;
`;

export const ProgressBar = ({
  value,
  className,
  barColor,
  backgroundColor = 'none',
  withBorderRadius = false,
}: ProgressBarProps) => (
  <StyledBar
    className={className}
    backgroundColor={backgroundColor}
    withBorderRadius={withBorderRadius}
    role="progressbar"
    aria-valuenow={Math.ceil(value)}
  >
    <div
      style={{
        height: '100%',
        width: `${Math.ceil(value)}%`,
        transition: 'width 0.3s linear',
      }}
    >
      <StyledBarFilling
        barColor={barColor}
        withBorderRadius={withBorderRadius}
      />
    </div>
  </StyledBar>
);
