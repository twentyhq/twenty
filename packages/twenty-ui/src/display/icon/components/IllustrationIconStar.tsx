import { useTheme } from '@emotion/react';
import { IllustrationIconWrapper } from '@ui/display/icon/components/IllustrationIconWrapper';

import IllustrationIconStarRaw from '@ui/display/icon/assets/illustration-star.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IllustrationIconStarProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconStar = (props: IllustrationIconStarProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const { color, fill } = theme.IllustrationIcon;

  return (
    <IllustrationIconWrapper>
      <IllustrationIconStarRaw
        height={size}
        width={size}
        fill={fill.blue}
        color={color.blue}
      />
    </IllustrationIconWrapper>
  );
};
