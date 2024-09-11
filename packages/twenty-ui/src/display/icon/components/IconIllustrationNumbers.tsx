import { useTheme } from '@emotion/react';

import IconIllustrationNumbersRaw from '@ui/display/icon/assets/illustration-numbers.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IconIllustrationNumbersProps = Pick<IconComponentProps, 'size'>;

export const IconIllustrationNumbers = (
  props: IconIllustrationNumbersProps,
) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const illustrationColors = theme.iconIllustration;

  return (
    <IconIllustrationNumbersRaw
      height={size}
      width={size}
      fill={illustrationColors.fill}
      color={illustrationColors.color}
    />
  );
};
