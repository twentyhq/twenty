import { useTheme } from '@emotion/react';

import IconIllustrationMapRaw from '@ui/display/icon/assets/illustration-map.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IconIllustrationMapProps = Pick<IconComponentProps, 'size'>;

export const IconIllustrationMap = (props: IconIllustrationMapProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const illustrationColors = theme.iconIllustration;

  return (
    <IconIllustrationMapRaw
      height={size}
      width={size}
      fill={illustrationColors.fill}
      color={illustrationColors.color}
    />
  );
};
