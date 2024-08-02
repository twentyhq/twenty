import { Theme, useTheme, withTheme } from '@emotion/react';

import styled from '@emotion/styled';
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
  isIconInverted?: boolean;
  className?: string;
  placeholderColorSeed?: string;
  onClick?: (event: MouseEvent) => void;
};

export enum AvatarChipVariant {
  Regular = 'regular',
  Transparent = 'transparent',
}

const StyledInvertedIconContainer = withTheme(styled.div<{ theme: Theme }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.background.invertedSecondary};
`);

export const AvatarChip = ({
  name,
  avatarUrl,
  avatarType = 'rounded',
  variant = AvatarChipVariant.Regular,
  LeftIcon,
  isIconInverted,
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
        isDefined(LeftIcon) ? (
          isIconInverted === true ? (
            <StyledInvertedIconContainer>
              <LeftIcon
                color="white"
                size={theme.icon.size.md}
                stroke={theme.icon.stroke.sm}
              />
            </StyledInvertedIconContainer>
          ) : (
            <LeftIcon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
          )
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
