import { useTheme } from '@emotion/react';
import { IllustrationIconWrapper } from '@ui/display/icon/components/IllustrationIconWrapper';

import IllustrationIconLinkRaw from '@assets/icons/illustration-link.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';



export const IllustrationIconLink = ({ size }: IconComponentProps) => {
  const theme = useTheme();
  const iconSize = size ?? theme.icon.size.lg;
  return (
    <IllustrationIconWrapper>
      <IllustrationIconLinkRaw
        height={iconSize}
        width={iconSize}
        fill={theme.accent.accent3}
        color={theme.accent.accent8}
      />
    </IllustrationIconWrapper>
  );
};
