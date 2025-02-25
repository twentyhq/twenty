import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Avatar } from '@ui/display/avatar/components/Avatar';
import { AvatarType } from '@ui/display/avatar/types/AvatarType';
import { IconComponent } from '@ui/display/icon/types/IconComponent';
import { isDefined } from 'twenty-shared';
import { Nullable } from 'vitest';

const StyledInvertedIconContainer = styled.div<{ backgroundColor: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 4px;
  background-color: ${({ backgroundColor }) => backgroundColor};
`;

export type AvatarChipsLeftComponentProps = {
  name: string;
  avatarUrl?: string;
  avatarType?: Nullable<AvatarType>;
  LeftIcon?: IconComponent;
  LeftIconColor?: string;
  isIconInverted?: boolean;
  placeholderColorSeed?: string;
};

export const AvatarChipsLeftComponent: React.FC<
  AvatarChipsLeftComponentProps
> = ({
  LeftIcon,
  placeholderColorSeed,
  avatarType,
  avatarUrl,
  name,
  isIconInverted = false,
  LeftIconColor,
}) => {
  const theme = useTheme();
  if (!isDefined(LeftIcon)) {
    return (
      <Avatar
        avatarUrl={avatarUrl}
        placeholderColorSeed={placeholderColorSeed}
        placeholder={name}
        size="sm"
        type={avatarType}
      />
    );
  }

  if (isIconInverted) {
    return (
      <StyledInvertedIconContainer
        backgroundColor={theme.background.invertedSecondary}
      >
        <LeftIcon
          color="white"
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
        />
      </StyledInvertedIconContainer>
    );
  }

  return (
    <LeftIcon
      size={theme.icon.size.md}
      stroke={theme.icon.stroke.sm}
      color={LeftIconColor || 'currentColor'}
    />
  );
};
