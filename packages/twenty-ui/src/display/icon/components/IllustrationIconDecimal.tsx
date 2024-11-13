import { useTheme } from '@emotion/react';

import IllustrationIconDecimalRaw from '@ui/display/icon/assets/illustration-decimal.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IllustrationIconDecimalProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconDecimal = (
  props: IllustrationIconDecimalProps,
) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const { color, fill } = theme.IllustrationIcon;
  return (
    <IllustrationIconDecimalRaw
      width={size}
      height={size}
      fill={fill.grey}
      color={color.grey}
    />
  );
};
