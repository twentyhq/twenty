import IllustrationIconManyToManyRaw from '@assets/icons/illustration-many-to-many.svg?react';
import { useTheme } from '@emotion/react';
import { IllustrationIconWrapper } from '@ui/display/icon/components/IllustrationIconWrapper';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IllustrationIconManyToManyProps = IconComponentProps;

export const IllustrationIconManyToMany = ({
  size,
}: IllustrationIconManyToManyProps) => {
  const theme = useTheme();
  const iconSize = size ?? theme.icon.size.lg;
  return (
    <IllustrationIconWrapper>
      <IllustrationIconManyToManyRaw
        height={iconSize}
        width={iconSize}
        fill={theme.accent.accent3}
        color={theme.accent.accent8}
      />
    </IllustrationIconWrapper>
  );
};
