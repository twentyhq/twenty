import { useTheme } from '@emotion/react';

import { Avatar, AvatarType } from '@ui/display/avatar/components/Avatar';
import { AvatarGroup } from '@ui/display/avatar/components/AvatarGroup';
import { IconComponent } from '@ui/display/icon/types/IconComponent';
import { Nullable } from '@ui/utilities/types/Nullable';

import { Chip, ChipVariant } from './Chip';

const N_AVATARS_THRESHOLD = 3;

export type MultiChipProps = {
  linkToEntity?: string;
  names: string[];
  avatarUrls: string[];
  avatarType?: Nullable<AvatarType>;
  variant?: MultiChipVariant;
  LeftIcon?: IconComponent;
  className?: string;
  maxWidth?: number;
};

export enum MultiChipVariant {
  Regular = 'regular',
  Transparent = 'transparent',
}

export const MultiChip = ({
  linkToEntity,
  names = [],
  avatarUrls = [],
  variant = MultiChipVariant.Regular,
  LeftIcon,
  className,
  maxWidth,
}: MultiChipProps) => {
  const theme = useTheme();

  let nAvatars = '';
  if (names.length > N_AVATARS_THRESHOLD) {
    nAvatars = (names.length - N_AVATARS_THRESHOLD).toString() + '+';
  }

  return (
    <Chip
      label={nAvatars || ''}
      variant={
        linkToEntity
          ? variant === MultiChipVariant.Regular
            ? ChipVariant.Highlighted
            : ChipVariant.Regular
          : ChipVariant.Transparent
      }
      leftComponent={
        LeftIcon ? (
          <LeftIcon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        ) : (
          <AvatarGroup
            avatars={names.map((name, index) => (
              <Avatar
                key={name}
                avatarUrl={avatarUrls[index] || ''}
                placeholder={name}
                type="rounded"
              />
            ))}
          />
        )
      }
      clickable={!!linkToEntity}
      className={className}
      maxWidth={maxWidth}
    />
  );
};
