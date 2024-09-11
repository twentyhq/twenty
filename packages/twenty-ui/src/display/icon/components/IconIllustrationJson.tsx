import { useTheme } from '@emotion/react';

import IconIllustrationJsonRaw from '@ui/display/icon/assets/illustration-json.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IconIllustrationJsonProps = Pick<IconComponentProps, 'size'>;

export const IconIllustrationJson = (props: IconIllustrationJsonProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const illustrationColors = theme.iconIllustration;

  return (
    <IconIllustrationJsonRaw
      height={size}
      width={size}
      fill={illustrationColors.fill}
      color={illustrationColors.color}
    />
  );
};
