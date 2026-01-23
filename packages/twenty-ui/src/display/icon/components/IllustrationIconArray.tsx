import IllustrationIconArrayRaw from '@assets/icons/illustration-array.svg?react';
import { useTheme } from '@emotion/react';
import { IllustrationIconWrapper } from '@ui/display/icon/components/IllustrationIconWrapper';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IllustrationIconArrayProps = IconComponentProps;

export const IllustrationIconArray = ({ size }: IllustrationIconArrayProps) => {
  const theme = useTheme();
  const iconSize = size ?? theme.icon.size.lg;
  return (
    <IllustrationIconWrapper>
      <IllustrationIconArrayRaw
        fill={theme.accent.accent3}
        color={theme.accent.accent8}
        height={iconSize}
        width={iconSize}
      />
    </IllustrationIconWrapper>
  );
};
