import { styled } from '@linaria/react';
import { isNonEmptyString, isNull, isUndefined } from '@sniptt/guards';
import { useAtom } from 'jotai';
import { useContext } from 'react';

import { invalidAvatarUrlsAtomV2 } from '@ui/display/avatar/components/states/invalidAvatarUrlsAtomV2';
import { AVATAR_PROPERTIES_BY_SIZE } from '@ui/display/avatar/constants/AvatarPropertiesBySize';
import { type AvatarSize } from '@ui/display/avatar/types/AvatarSize';
import { type AvatarType } from '@ui/display/avatar/types/AvatarType';
import { type IconComponent } from '@ui/display/icon/types/IconComponent';
import { ThemeContext } from '@ui/theme-constants';
import { stringToThemeColorP3String } from '@ui/utilities';
import { REACT_APP_SERVER_BASE_URL } from '@ui/utilities/config';
import { type Nullable } from 'twenty-shared/types';
import { getImageAbsoluteURI } from 'twenty-shared/utils';

const StyledAvatar = styled.div<{
  size: AvatarSize;
  rounded?: boolean;
  clickable?: boolean;
  color: string;
  backgroundColor: string;
  borderColor?: string;
  backgroundTransparentLight: string;
  type?: Nullable<AvatarType>;
}>`
  align-items: center;
  flex-shrink: 0;
  overflow: hidden;
  user-select: none;

  border-radius: ${({ rounded, type }) => {
    if (rounded) return '50%';
    if (type === 'icon') return '4px';
    return '2px';
  }};
  border: ${({ type, borderColor }) =>
    type === 'app' && borderColor ? `1px solid ${borderColor}` : 'none'};
  box-sizing: border-box;
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
  borderColor?: string;
  onClick?: () => void;
};

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
  borderColor,
}: AvatarProps) => {
  const { theme } = useContext(ThemeContext);

  const [invalidAvatarUrls, setInvalidAvatarUrls] = useAtom(
    invalidAvatarUrlsAtomV2,
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
        variant: 12,
        theme,
      }));
  const fixedBackgroundColor = isPlaceholderFirstCharEmpty
    ? theme.background.transparent.light
    : (backgroundColor ??
      stringToThemeColorP3String({
        string: placeholderColorSeed ?? '',
        variant: type === 'app' ? 5 : 4,
        theme,
      }));

  const fixedBorderColor =
    type === 'app'
      ? (borderColor ??
        (isPlaceholderFirstCharEmpty
          ? undefined
          : stringToThemeColorP3String({
              string: placeholderColorSeed ?? '',
              variant: 6,
              theme,
            })))
      : undefined;

  const showBackgroundColor = showPlaceholder;

  const showBorderColor = showPlaceholder;

  return (
    <StyledAvatar
      size={size}
      backgroundColor={
        Icon ? 'inherit' : showBackgroundColor ? fixedBackgroundColor : 'none'
      }
      borderColor={showBorderColor ? fixedBorderColor : undefined}
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
        <StyledPlaceholderChar fontWeight={500}>
          {placeholderChar}
        </StyledPlaceholderChar>
      ) : (
        <StyledImage src={avatarImageURI} onError={handleImageError} alt="" />
      )}
    </StyledAvatar>
  );
};
