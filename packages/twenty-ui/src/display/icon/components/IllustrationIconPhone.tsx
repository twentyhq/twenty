import { useTheme } from '@emotion/react';
import { IllustrationIconWrapper } from '@ui/display/icon/components/IllustrationIconWrapper';

import IllustrationIconPhoneRaw from '@assets/icons/illustration-phone.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IllustrationIconPhoneProps = IconComponentProps;

export const IllustrationIconPhone = ({ size }: IllustrationIconPhoneProps) => {
  const theme = useTheme();
  const iconSize = size ?? theme.icon.size.lg;

  return (
    <IllustrationIconWrapper>
      <IllustrationIconPhoneRaw
        height={iconSize}
        width={iconSize}
        fill={theme.accent.accent3}
        color={theme.accent.accent8}
      />
    </IllustrationIconWrapper>
  );
};
