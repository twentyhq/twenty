import { useTheme } from '@emotion/react';

import IconIllustrationStarRaw from '@ui/display/icon/assets/illustration-star.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IconIllustrationStarProps = Pick<IconComponentProps, 'size'>;

export const IconIllustrationStar = (props: IconIllustrationStarProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const illustrationColors = theme.iconIllustration;

  return (
    <IconIllustrationStarRaw
      height={size}
      width={size}
      fill={illustrationColors.fill}
      color={illustrationColors.color}
    />
  );
};
