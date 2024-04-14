import { useTheme } from '@emotion/react';

import IconTwentyStarFilledRaw from '@ui/display/icon/assets/twenty-star-filled.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IconTwentyStarFilledProps = Pick<IconComponentProps, 'size' | 'stroke'>;

export const IconTwentyStarFilled = (props: IconTwentyStarFilledProps) => {
  const theme = useTheme();
  const size = props.size ?? 24;
  const stroke = props.stroke ?? theme.icon.stroke.md;

  return (
    <IconTwentyStarFilledRaw height={size} width={size} strokeWidth={stroke} />
  );
};
