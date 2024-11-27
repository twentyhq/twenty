import { useTheme } from '@emotion/react';
import { IllustrationIconWrapper } from '@ui/display/icon/components/IllustrationIconWrapper';

import IllustrationIconCurrencyRaw from '@ui/display/icon/assets/illustration-currency.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IllustrationIconCurrencyProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconCurrency = (
  props: IllustrationIconCurrencyProps,
) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const { color, fill } = theme.IllustrationIcon;
  return (
    <IllustrationIconWrapper>
      <IllustrationIconCurrencyRaw
        height={size}
        width={size}
        fill={fill.blue}
        color={color.blue}
      />
    </IllustrationIconWrapper>
  );
};
