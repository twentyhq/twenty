import { useContext } from 'react';

import { styled } from '@linaria/react';

import { IconChartBar } from '@ui/display/icon/components/TablerIcons';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';
import { ThemeContext } from '@ui/theme';

const StyledRotatedIconWrapper = styled.div`
  display: inline-flex;
  transform: rotate(90deg);
`;

type IconChartBarHorizontalProps = Pick<
  IconComponentProps,
  'size' | 'stroke' | 'color'
>;

export const IconChartBarHorizontal = (props: IconChartBarHorizontalProps) => {
  const { theme } = useContext(ThemeContext);
  const size = props.size ?? theme.icon.size.md;
  const stroke = props.stroke ?? theme.icon.stroke.sm;

  return (
    <StyledRotatedIconWrapper>
      <IconChartBar size={size} stroke={stroke} color={props.color} />
    </StyledRotatedIconWrapper>
  );
};
