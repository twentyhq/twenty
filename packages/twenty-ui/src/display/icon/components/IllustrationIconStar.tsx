import { useTheme } from '@emotion/react';
import { IllustrationIconWrapper } from '@ui/display/icon/components/IllustrationIconWrapper';

import IllustrationIconStarRaw from '@assets/icons/illustration-star.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IllustrationIconStarProps = IconComponentProps;

export const IllustrationIconStar = ({ size }: IllustrationIconStarProps) => {
  const theme = useTheme();
  const iconSize = size ?? theme.icon.size.lg;

  return (
    <IllustrationIconWrapper>
      <IllustrationIconStarRaw
        height={iconSize}
        width={iconSize}
        fill={theme.accent.accent3}
        color={theme.accent.accent8}
      />
    </IllustrationIconWrapper>
  );
};
