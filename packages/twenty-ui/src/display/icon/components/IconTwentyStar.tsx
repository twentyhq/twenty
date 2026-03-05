import IconTwentyStarRaw from '@assets/icons/twenty-star.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';
import {
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from '@ui/theme-constants';
type IconTwentyStarProps = Pick<IconComponentProps, 'size' | 'stroke'>;

export const IconTwentyStar = (props: IconTwentyStarProps) => {
  const size = props.size ?? 24;
  const stroke =
    props.stroke ??
    resolveThemeVariableAsNumber(themeCssVariables.icon.stroke.md);

  return <IconTwentyStarRaw height={size} width={size} strokeWidth={stroke} />;
};
