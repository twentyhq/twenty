import { styled } from '@linaria/react';
import { isNonEmptyString, isUndefined } from '@sniptt/guards';
import { useContext, useMemo } from 'react';
import { useRecoilState } from 'recoil';

import { invalidAvatarUrlsState } from '@ui/display/avatar/components/states/isInvalidAvatarUrlState';
import { AVATAR_PROPERTIES_BY_SIZE } from '@ui/display/avatar/constants/AvatarPropertiesBySize';
import { AvatarSize } from '@ui/display/avatar/types/AvatarSize';
import { AvatarType } from '@ui/display/avatar/types/AvatarType';
import { ThemeContext } from '@ui/theme';
import { Nullable, getImageAbsoluteURI, stringToHslColor } from '@ui/utilities';

const StyledAvatar = styled.div<{
  size: AvatarSize;
  rounded?: boolean;
  clickable?: boolean;
  color: string;
  backgroundColor: string;
  backgroundTransparentLight: string;
}>`
  align-items: center;
  flex-shrink: 0;
  overflow: hidden;
  user-select: none;

  border-radius: ${({ rounded }) => (rounded ? '50%' : '2px')};
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

export type AvatarProps = {
  avatarUrl?: string | null;
  className?: string;
  size?: AvatarSize;
  placeholder: string | undefined;
  placeholderColorSeed?: string;
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
  onClick,
  type = 'squared',
  color,
  backgroundColor,
}: AvatarProps) => {
  const { theme } = useContext(ThemeContext);
  const [invalidAvatarUrls, setInvalidAvatarUrls] = useRecoilState(
    invalidAvatarUrlsState,
  );

  const avatarImageURI = useMemo(
    () => getImageAbsoluteURI(avatarUrl),
    [avatarUrl],
  );

  const noAvatarUrl = !isNonEmptyString(avatarImageURI);

  const placeholderChar = placeholder?.[0]?.toLocaleUpperCase();

  const showPlaceholder =
    noAvatarUrl || invalidAvatarUrls.includes(avatarImageURI);

  const handleImageError = () => {
    if (isNonEmptyString(avatarImageURI)) {
      setInvalidAvatarUrls((prev) => [...prev, avatarImageURI]);
    }
  };

  const fixedColor =
    color ?? stringToHslColor(placeholderColorSeed ?? '', 75, 25);
  const fixedBackgroundColor =
    backgroundColor ?? stringToHslColor(placeholderColorSeed ?? '', 75, 85);

  const showBackgroundColor = showPlaceholder;

  return (
    <StyledAvatar
      size={size}
      backgroundColor={showBackgroundColor ? fixedBackgroundColor : 'none'}
      color={fixedColor}
      clickable={!isUndefined(onClick)}
      rounded={type === 'rounded'}
      onClick={onClick}
      backgroundTransparentLight={theme.background.transparent.light}
    >
      {showPlaceholder ? (
        placeholderChar
      ) : (
        <StyledImage src={avatarImageURI} onError={handleImageError} alt="" />
      )}
    </StyledAvatar>
  );
};
