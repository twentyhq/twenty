import { styled } from '@linaria/react';
import { isNonEmptyString, isNull, isUndefined } from '@sniptt/guards';
import { useContext } from 'react';

import { invalidAvatarUrlsState } from '@ui/display/avatar/components/states/isInvalidAvatarUrlState';
import { AVATAR_PROPERTIES_BY_SIZE } from '@ui/display/avatar/constants/AvatarPropertiesBySize';
import { type AvatarSize } from '@ui/display/avatar/types/AvatarSize';
import { type AvatarType } from '@ui/display/avatar/types/AvatarType';
import { type IconComponent } from '@ui/display/icon/types/IconComponent';
import { ThemeContext } from '@ui/theme';
import { stringToThemeColorP3String } from '@ui/utilities';
import { REACT_APP_SERVER_BASE_URL } from '@ui/utilities/config';
import { useRecoilState } from 'recoil';
import { type Nullable } from 'twenty-shared/types';
import { getImageAbsoluteURI } from 'twenty-shared/utils';

const StyledAvatar = styled.div<{
  size: AvatarSize;
  rounded?: boolean;
  clickable?: boolean;
  color: string;
  backgroundColor: string;
  backgroundTransparentLight: string;
  type?: Nullable<AvatarType>;
}>`
  align-items: center;
  flex-shrink: 0;
  overflow: hidden;
  user-select: none;

  border-radius: ${({ rounded, type }) => {
    return rounded ? '50%' : type === 'icon' ? '4px' : '2px';
  }};
  display: flex;
  font-size: ${({ size }) => AVATAR_PROPERTIES_BY_SIZE[size].fontSize};
  height: ${({ size }) => AVATAR_PROPERTIES_BY_SIZE[size].width};
  justify-content: center;

  width: ${({ size }) => AVATAR_PROPERTIES_BY_SIZE[size].width};

  color: ${({ color }) => color};
  background: ${({ backgroundColor }) => backgroundColor};

  &:hover {
    box-shadow: ${({ clickable, backgroundTransparentLight }) =>
      clickable ? `0 0 0 4px ${backgroundTransparentLight}` : 'none'};
  }
`;
const StyledImage = styled.img`
  height: 100%;
  object-fit: cover;
  width: 100%;
`;

const StyledPlaceholderChar = styled.span<{
  fontWeight: number;
}>`
  font-weight: ${({ fontWeight }) => fontWeight};
`;

export type AvatarProps = {
  avatarUrl?: string | null;
  className?: string;
  size?: AvatarSize;
  placeholder: string | undefined;
  placeholderColorSeed?: string;
  Icon?: IconComponent;
  iconColor?: string;
  type?: Nullable<AvatarType>;
  color?: string;
  backgroundColor?: string;
  onClick?: () => void;
};

// TODO: Remove recoil because we don't want it into twenty-ui and find a solution for invalid avatar urls
export const Avatar = ({
  avatarUrl,
  size = 'md',
  placeholder,
  placeholderColorSeed = placeholder,
  Icon,
  iconColor,
  onClick,
  type = 'squared',
  color,
  backgroundColor,
}: AvatarProps) => {
  const { theme } = useContext(ThemeContext);
  const [invalidAvatarUrls, setInvalidAvatarUrls] = useRecoilState(
    invalidAvatarUrlsState,
  );

  const avatarImageURI = isNonEmptyString(avatarUrl)
    ? getImageAbsoluteURI({
        imageUrl: avatarUrl,
        baseUrl: REACT_APP_SERVER_BASE_URL,
      })
    : null;

  const placeholderFirstChar = placeholder?.trim()?.charAt(0);
  const isPlaceholderFirstCharEmpty =
    !placeholderFirstChar || placeholderFirstChar === '';
  const placeholderChar = placeholderFirstChar?.toUpperCase() || '-';

  const showPlaceholder =
    isNull(avatarImageURI) || invalidAvatarUrls.includes(avatarImageURI);

  const handleImageError = () => {
    if (isNonEmptyString(avatarImageURI)) {
      setInvalidAvatarUrls((prev) => [...prev, avatarImageURI]);
    }
  };

  const fixedColor = isPlaceholderFirstCharEmpty
    ? theme.font.color.tertiary
    : (color ??
      stringToThemeColorP3String({
        string: placeholderColorSeed ?? '',
        theme,
        variant: 12,
      }));
  const fixedBackgroundColor = isPlaceholderFirstCharEmpty
    ? theme.background.transparent.light
    : (backgroundColor ??
      stringToThemeColorP3String({
        string: placeholderColorSeed ?? '',
        theme,
        variant: 4,
      }));

  const showBackgroundColor = showPlaceholder;

  return (
    <StyledAvatar
      size={size}
      backgroundColor={
        Icon ? 'inherit' : showBackgroundColor ? fixedBackgroundColor : 'none'
      }
      color={fixedColor}
      clickable={!isUndefined(onClick)}
      rounded={type === 'rounded'}
      type={type}
      onClick={onClick}
      backgroundTransparentLight={theme.background.transparent.light}
    >
      {Icon ? (
        <Icon
          color={iconColor ? iconColor : 'currentColor'}
          size={theme.icon.size.xl}
        />
      ) : showPlaceholder ? (
        <StyledPlaceholderChar fontWeight={theme.font.weight.medium}>
          {placeholderChar}
        </StyledPlaceholderChar>
      ) : (
        <StyledImage src={avatarImageURI} onError={handleImageError} alt="" />
      )}
    </StyledAvatar>
  );
};
