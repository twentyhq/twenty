import { styled } from '@linaria/react';
import { Avatar } from '@ui/display/avatar/components/Avatar';
import { AvatarType } from '@ui/display/avatar/types/AvatarType';
import { Chip, ChipSize, ChipVariant } from '@ui/display/chip/components/Chip';
import { IconComponent } from '@ui/display/icon/types/IconComponent';
import { ThemeContext } from '@ui/theme';
import { isDefined } from '@ui/utilities/isDefined';
import { Nullable } from '@ui/utilities/types/Nullable';
import { MouseEvent, useContext } from 'react';

// Import Link from react-router-dom instead of UndecoratedLink
import { Link } from 'react-router-dom';

export type AvatarChipProps = {
  name: string;
  avatarUrl?: string;
  avatarType?: Nullable<AvatarType>;
  variant?: AvatarChipVariant;
  size?: ChipSize;
  LeftIcon?: IconComponent;
  LeftIconColor?: string;
  isIconInverted?: boolean;
  className?: string;
  placeholderColorSeed?: string;
  onClick?: (event: MouseEvent) => void;
  to?: string;
  maxWidth?: number;
};

export enum AvatarChipVariant {
  Regular = 'regular',
  Transparent = 'transparent',
}

const StyledInvertedIconContainer = styled.div<{ backgroundColor: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 4px;
  background-color: ${({ backgroundColor }) => backgroundColor};
`;

// Ideally we would use the UndecoratedLink component from @ui/navigation
// but it led to a bug probably linked to circular dependencies, which was hard to solve
const StyledLink = styled(Link)`
  text-decoration: none;
`;

export const AvatarChip = ({
  name,
  avatarUrl,
  avatarType = 'rounded',
  variant = AvatarChipVariant.Regular,
  LeftIcon,
  LeftIconColor,
  isIconInverted,
  className,
  placeholderColorSeed,
  onClick,
  to,
  size = ChipSize.Small,
  maxWidth,
}: AvatarChipProps) => {
  const { theme } = useContext(ThemeContext);

  const chip = (
    <Chip
      label={name}
      variant={
        isDefined(onClick) || isDefined(to)
          ? variant === AvatarChipVariant.Regular
            ? ChipVariant.Highlighted
            : ChipVariant.Regular
          : ChipVariant.Transparent
      }
      size={size}
      leftComponent={
        isDefined(LeftIcon) ? (
          isIconInverted === true ? (
            <StyledInvertedIconContainer
              backgroundColor={theme.background.invertedSecondary}
            >
              <LeftIcon
                color="white"
                size={theme.icon.size.md}
                stroke={theme.icon.stroke.sm}
              />
            </StyledInvertedIconContainer>
          ) : (
            <LeftIcon
              size={theme.icon.size.md}
              stroke={theme.icon.stroke.sm}
              color={LeftIconColor || 'currentColor'}
            />
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
      clickable={isDefined(onClick) || isDefined(to)}
      onClick={to ? undefined : onClick}
      className={className}
      maxWidth={maxWidth}
    />
  );

  if (!isDefined(to)) return chip;

  return (
    <StyledLink to={to} onClick={onClick}>
      {chip}
    </StyledLink>
  );
};
