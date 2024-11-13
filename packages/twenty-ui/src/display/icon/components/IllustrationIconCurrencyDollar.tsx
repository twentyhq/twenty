import { useTheme } from '@emotion/react';

import IllustrationIconCurrencyDollarRaw from '@ui/display/icon/assets/illustration-currency-dollar.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IllustrationIconCurrencyDollarProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconCurrencyDollar = (
  props: IllustrationIconCurrencyDollarProps,
) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const { color } = theme.IllustrationIcon;
  return (
    <IllustrationIconCurrencyDollarRaw
      height={size}
      width={size}
      color={color.grey}
    />
  );
};
