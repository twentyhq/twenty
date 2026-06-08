import { useContext } from 'react';

import IconTwentyStarFilledRaw from '@assets/icons/twenty-star-filled.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';
import { ThemeContext } from '@ui/theme-constants';

type IconTwentyStarFilledProps = Pick<IconComponentProps, 'size' | 'stroke'>;

export const IconTwentyStarFilled = (props: IconTwentyStarFilledProps) => {
  const { theme } = useContext(ThemeContext);
  const size = props.size ?? 24;
  const stroke = props.stroke ?? theme.icon.stroke.md;

  return (
    <IconTwentyStarFilledRaw height={size} width={size} strokeWidth={stroke} />
  );
};
