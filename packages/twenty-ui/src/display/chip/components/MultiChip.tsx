import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { Avatar, AvatarType } from '@ui/display/avatar/components/Avatar';
import { AvatarGroup } from '@ui/display/avatar/components/AvatarGroup';
import { IconComponent } from '@ui/display/icon/types/IconComponent';
import { Nullable } from '@ui/utilities/types/Nullable';

import { Chip, ChipVariant } from './Chip';

const N_AVATARS_THRESHOLD = 3;

const StyledIcon = styled.div`
  align-items: center;
  display: flex;
  margin-right: ${({ theme }) => theme.spacing(1)};
`;

export type MultiChipProps = {
  linkToEntity?: string;
  names: string[];
  avatarUrls: string[];
  avatarType?: Nullable<AvatarType>;
  LeftIcon?: IconComponent;
  RightIcon?: IconComponent;
  className?: string;
  maxWidth?: number;
};

export const MultiChip = ({
  linkToEntity,
  names = [],
  avatarUrls = [],
  LeftIcon,
  RightIcon,
  className,
  maxWidth,
}: MultiChipProps) => {
  const theme = useTheme();

  let numberOfAvatars = '';
  if (names.length > N_AVATARS_THRESHOLD) {
    numberOfAvatars = '+' + (names.length - N_AVATARS_THRESHOLD).toString();
  }

  return (
    <Chip
      label={numberOfAvatars}
      variant={ChipVariant.Highlighted}
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
      rightComponent={
        RightIcon ? (
          <StyledIcon>
            <RightIcon size={theme.icon.size.sm} />
          </StyledIcon>
        ) : null
      }
      clickable={!!linkToEntity}
      className={className}
      maxWidth={maxWidth}
    />
  );
};
