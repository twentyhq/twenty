import IconTwentyStarFilledRaw from '@assets/icons/twenty-star-filled.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';
import { THEME_COMMON } from '@ui/theme';

type IconTwentyStarFilledProps = IconComponentProps;

const iconStrokeMd = THEME_COMMON.icon.stroke.md;

export const IconTwentyStarFilled = ({
  size,
  stroke,
}: IconTwentyStarFilledProps) => {
  const iconSize = size ?? 24;
  const iconStroke = stroke ?? iconStrokeMd;

  return (
    <IconTwentyStarFilledRaw
      height={iconSize}
      width={iconSize}
      strokeWidth={iconStroke}
    />
  );
};
