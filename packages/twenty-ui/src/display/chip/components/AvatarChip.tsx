import { useTheme } from '@emotion/react';

import { Avatar } from '@ui/display/avatar/components/Avatar';
import { AvatarType } from '@ui/display/avatar/types/AvatarType';
import { Chip, ChipVariant } from '@ui/display/chip/components/Chip';
import { IconComponent } from '@ui/display/icon/types/IconComponent';
import { isDefined } from '@ui/utilities/isDefined';
import { Nullable } from '@ui/utilities/types/Nullable';
import { MouseEvent } from 'react';

export type AvatarChipProps = {
  name: string;
  avatarUrl?: string;
  avatarType?: Nullable<AvatarType>;
  variant?: AvatarChipVariant;
  LeftIcon?: IconComponent;
  className?: string;
  placeholderColorSeed?: string;
  onClick?: (event: MouseEvent) => void;
};

export enum AvatarChipVariant {
  Regular = 'regular',
  Transparent = 'transparent',
}

export const AvatarChip = ({
  name,
  avatarUrl,
  avatarType = 'rounded',
  variant = AvatarChipVariant.Regular,
  LeftIcon,
  className,
  placeholderColorSeed,
  onClick,
}: AvatarChipProps) => {
  const theme = useTheme();

  return (
    <Chip
      label={name}
      variant={
        isDefined(onClick)
          ? variant === AvatarChipVariant.Regular
            ? ChipVariant.Highlighted
            : ChipVariant.Regular
          : ChipVariant.Transparent
      }
      leftComponent={
        LeftIcon ? (
          <LeftIcon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        ) : (
          <Avatar
            avatarUrl={avatarUrl}
            placeholderColorSeed={placeholderColorSeed}
            placeholder={name}
            size="sm"
            type={avatarType}
          />
        )
      }
      clickable={isDefined(onClick)}
      onClick={onClick}
      className={className}
    />
  );
};
