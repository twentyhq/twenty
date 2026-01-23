import { useTheme } from '@emotion/react';

import IconTwentyStarRaw from '@assets/icons/twenty-star.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';

export const IconTwentyStar = ({ size, stroke }: IconComponentProps) => {
  const theme = useTheme();
  const iconSize = size ?? 24;
  const iconStroke = stroke ?? theme.icon.stroke.md;

  return (
    <IconTwentyStarRaw height={iconSize} width={iconSize} strokeWidth={iconStroke} />
  );
};
