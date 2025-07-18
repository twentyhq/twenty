import { useTheme } from '@emotion/react';
import { styled } from '@linaria/react';
import { Avatar } from '@ui/display/avatar/components/Avatar';
import { AvatarType } from '@ui/display/avatar/types/AvatarType';
import { IconComponent } from '@ui/display/icon/types/IconComponent';
import { Nullable } from '@ui/utilities';
import { isDefined } from 'twenty-shared/utils';

const StyledIconWithBackgroundContainer = styled.div<{
  backgroundColor: string;
}>`
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
  LeftIconBackgroundColor?: string;
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
  LeftIconBackgroundColor,
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

  if (isIconInverted || isDefined(LeftIconBackgroundColor)) {
    return (
      <StyledIconWithBackgroundContainer
        backgroundColor={
          LeftIconBackgroundColor ?? theme.background.invertedSecondary
        }
      >
        <LeftIcon
          color={theme.font.color.inverted}
          size={theme.icon.size.sm}
          stroke={theme.icon.stroke.sm}
        />
      </StyledIconWithBackgroundContainer>
    );
  }

  return (
    <LeftIcon
      size={theme.icon.size.sm}
      stroke={theme.icon.stroke.sm}
      color={LeftIconColor || 'currentColor'}
    />
  );
};
