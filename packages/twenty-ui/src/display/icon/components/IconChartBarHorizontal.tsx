import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconChartBar } from '@ui/display/icon/components/TablerIcons';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';

const StyledRotatedIconWrapper = styled.div`
  display: inline-flex;
  transform: rotate(90deg);
`;

export const IconChartBarHorizontal = ({
  size,
  stroke,
  color,
}: IconComponentProps) => {
  const theme = useTheme();
  const iconSize = size ?? theme.icon.size.md;
  const iconStroke = stroke ?? theme.icon.stroke.sm;

  return (
    <StyledRotatedIconWrapper>
      <IconChartBar size={iconSize} stroke={iconStroke} color={color} />
    </StyledRotatedIconWrapper>
  );
};
