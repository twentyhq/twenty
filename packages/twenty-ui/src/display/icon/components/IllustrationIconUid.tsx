import { useTheme } from '@emotion/react';
import { IllustrationIconWrapper } from '@ui/display/icon/components/IllustrationIconWrapper';

import IllustrationIconUidRaw from '@assets/icons/illustration-uid.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';



export const IllustrationIconUid = ({ size }: IconComponentProps) => {
  const theme = useTheme();
  const iconSize = size ?? theme.icon.size.lg;
  return (
    <IllustrationIconWrapper>
      <IllustrationIconUidRaw
        height={iconSize}
        width={iconSize}
        fill={theme.accent.accent3}
        color={theme.accent.accent8}
      />
    </IllustrationIconWrapper>
  );
};
