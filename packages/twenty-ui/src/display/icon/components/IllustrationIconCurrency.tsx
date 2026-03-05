import { useContext } from 'react';

import IllustrationIconCurrencyRaw from '@assets/icons/illustration-currency.svg?react';
import { IllustrationIconWrapper } from '@ui/display/icon/components/IllustrationIconWrapper';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';
import { ThemeContext } from '@ui/theme-constants';

type IllustrationIconCurrencyProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconCurrency = (
  props: IllustrationIconCurrencyProps,
) => {
  const { theme } = useContext(ThemeContext);
  const size = props.size ?? theme.icon.size.lg;
  return (
    <IllustrationIconWrapper>
      <IllustrationIconCurrencyRaw
        height={size}
        width={size}
        fill={theme.accent.accent3}
        color={theme.accent.accent8}
      />
    </IllustrationIconWrapper>
  );
};
