import { styled } from '@linaria/react';

import { IconChartBar } from '@ui/display/icon/components/TablerIcons';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';
import {
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from '@ui/theme-constants';
const StyledRotatedIconWrapper = styled.div`
  display: inline-flex;
  transform: rotate(90deg);
`;

type IconChartBarHorizontalProps = Pick<
  IconComponentProps,
  'size' | 'stroke' | 'color'
>;

export const IconChartBarHorizontal = (props: IconChartBarHorizontalProps) => {
  const size =
    props.size ?? resolveThemeVariableAsNumber(themeCssVariables.icon.size.md);
  const stroke =
    props.stroke ??
    resolveThemeVariableAsNumber(themeCssVariables.icon.stroke.sm);

  return (
    <StyledRotatedIconWrapper>
      <IconChartBar size={size} stroke={stroke} color={props.color} />
    </StyledRotatedIconWrapper>
  );
};
