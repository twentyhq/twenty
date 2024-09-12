import { useTheme } from '@emotion/react';

import IllustrationIconStarRaw from '@ui/display/icon/assets/illustration-star.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IllustrationIconStarProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconStar = (props: IllustrationIconStarProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const { color, fill } = theme.IllustrationIcon;

  return (
    <IllustrationIconStarRaw
      height={size}
      width={size}
      fill={fill}
      color={color}
    />
  );
};
