import { useTheme } from '@emotion/react';

import IconIllustrationTextRaw from '@ui/display/icon/assets/illustration-text.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IconIllustrationTextProps = Pick<IconComponentProps, 'size'>;

export const IconIllustrationText = (props: IconIllustrationTextProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const illustrationColors = theme.iconIllustration;

  return (
    <IconIllustrationTextRaw
      height={size}
      width={size}
      fill={illustrationColors.fill}
      color={illustrationColors.color}
    />
  );
};
