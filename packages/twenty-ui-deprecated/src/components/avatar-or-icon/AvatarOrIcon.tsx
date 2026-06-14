import { styled } from '@linaria/react';
import { Avatar } from '@ui/display/avatar/components/Avatar';
import { type AvatarType } from '@ui/display/avatar/types/AvatarType';
import { type IconComponent } from '@ui/display/icon/types/IconComponent';
import { ThemeContext } from '@ui/theme-constants';
import { useContext } from 'react';
import { type Nullable } from '@ui/utilities';
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

const StyledAvatarOrIconWrapper = styled.div<{
  isClickable: boolean;
}>`
  cursor: ${({ isClickable }) => (isClickable ? 'pointer' : 'inherit')};
  display: flex;
`;

export type AvatarOrIconProps = {
  placeholder?: string;
  avatarUrl?: string;
  avatarType?: Nullable<AvatarType>;
  Icon?: IconComponent;
  IconColor?: string;
  IconBackgroundColor?: string;
  isIconInverted?: boolean;
  placeholderColorSeed?: string;
  onClick?: () => void;
};

export const AvatarOrIcon = ({
  Icon,
  placeholderColorSeed,
  avatarType,
  avatarUrl,
  placeholder,
  isIconInverted = false,
  IconColor,
  IconBackgroundColor,
  onClick,
}: AvatarOrIconProps) => {
  const { theme } = useContext(ThemeContext);

  if (!isDefined(Icon)) {
    return (
      <Avatar
        avatarUrl={avatarUrl}
        placeholderColorSeed={placeholderColorSeed}
        placeholder={placeholder}
        size="sm"
        type={avatarType}
        onClick={onClick}
      />
    );
  }

  const isClickable = isDefined(onClick);

  if (isIconInverted || isDefined(IconBackgroundColor)) {
    return (
      <StyledAvatarOrIconWrapper isClickable={isClickable} onClick={onClick}>
        <StyledIconWithBackgroundContainer
          backgroundColor={
            IconBackgroundColor ?? theme.background.invertedSecondary
          }
        >
          <Icon
            color={theme.font.color.inverted}
            size={theme.icon.size.sm}
            stroke={theme.icon.stroke.sm}
          />
        </StyledIconWithBackgroundContainer>
      </StyledAvatarOrIconWrapper>
    );
  }

  return (
    <StyledAvatarOrIconWrapper isClickable={isClickable} onClick={onClick}>
      <Icon
        size={theme.icon.size.sm}
        stroke={theme.icon.stroke.sm}
        color={IconColor || 'currentColor'}
      />
    </StyledAvatarOrIconWrapper>
  );
};
