import { useTheme } from '@emotion/react';

import IconIllustrationCurrencyRaw from '@ui/display/icon/assets/illustration-currency.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IconIllustrationCurrencyProps = Pick<IconComponentProps, 'size'>;

export const IconIllustrationCurrency = (
  props: IconIllustrationCurrencyProps,
) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const illustrationColors = theme.iconIllustration;

  return (
    <IconIllustrationCurrencyRaw
      height={size}
      width={size}
      fill={illustrationColors.fill}
      color={illustrationColors.color}
    />
  );
};
