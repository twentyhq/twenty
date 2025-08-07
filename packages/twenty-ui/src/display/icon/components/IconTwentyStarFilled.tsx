import IconTwentyStarFilledRaw from '@assets/icons/twenty-star-filled.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';
import { THEME_COMMON } from '@ui/theme';

type IconTwentyStarFilledProps = Pick<IconComponentProps, 'size' | 'stroke'>;

const iconStrokeMd = THEME_COMMON.icon.stroke.md;

export const IconTwentyStarFilled = (props: IconTwentyStarFilledProps) => {
  const size = props.size ?? 24;
  const stroke = props.stroke ?? iconStrokeMd;

  return (
    <IconTwentyStarFilledRaw height={size} width={size} strokeWidth={stroke} />
  );
};
