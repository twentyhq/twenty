import { useTheme } from '@emotion/react';

import IconTwentyStarRaw from '@assets/icons/twenty-star.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IconTwentyStarProps = Pick<IconComponentProps, 'size' | 'stroke'>;

export const IconTwentyStar = (props: IconTwentyStarProps) => {
  const theme = useTheme();
  const size = props.size ?? 24;
  const stroke = props.stroke ?? theme.icon.stroke.md;

  return <IconTwentyStarRaw height={size} width={size} strokeWidth={stroke} />;
};
