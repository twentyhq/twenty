import { useTheme } from '@emotion/react';
import { IllustrationIconWrapper } from '@ui/display/icon/components/IllustrationIconWrapper';

import IllustrationIconOneToOneRaw from '@assets/icons/illustration-one-to-one.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';



export const IllustrationIconOneToOne = ({
  size,
}: IconComponentProps) => {
  const theme = useTheme();
  const iconSize = size ?? theme.icon.size.lg;
  return (
    <IllustrationIconWrapper>
      <IllustrationIconOneToOneRaw
        height={iconSize}
        width={iconSize}
        fill={theme.accent.accent3}
        color={theme.accent.accent8}
      />
    </IllustrationIconWrapper>
  );
};
