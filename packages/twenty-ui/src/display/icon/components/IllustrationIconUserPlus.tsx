import { useTheme } from '@emotion/react';

import IllustrationIconUserPlusRaw from '@ui/display/icon/assets/illustration-user-plus.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IllustrationIconUserPlusProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconUserPlus = (
  props: IllustrationIconUserPlusProps,
) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const { color, fill } = theme.IllustrationIcon;
  return (
    <IllustrationIconUserPlusRaw
      height={size}
      width={size}
      fill={fill.grey}
      color={color.grey}
    />
  );
};
