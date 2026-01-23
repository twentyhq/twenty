import { useTheme } from '@emotion/react';

import IconRelationManyToOneRaw from '@assets/icons/many-to-one.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';

export const IconRelationManyToOne = ({ size, stroke }: IconComponentProps) => {
  const theme = useTheme();
  const iconSize = size ?? 24;
  const iconStroke = stroke ?? theme.icon.stroke.md;

  return (
    <IconRelationManyToOneRaw
      height={iconSize}
      width={iconSize}
      strokeWidth={iconStroke}
    />
  );
};
