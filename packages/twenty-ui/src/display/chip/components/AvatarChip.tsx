import { styled } from '@linaria/react';
import { Avatar } from '@ui/display/avatar/components/Avatar';
import { AvatarType } from '@ui/display/avatar/types/AvatarType';
import { Chip, ChipSize, ChipVariant } from '@ui/display/chip/components/Chip';
import { IconComponent } from '@ui/display/icon/types/IconComponent';
import { ThemeContext } from '@ui/theme';
import { Nullable } from '@ui/utilities/types/Nullable';
import { MouseEvent, useContext } from 'react';
import { isDefined } from 'twenty-shared';

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

// TODO improve
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

// TODO prastoin debug
// Ideally we would use the UndecoratedLink component from @ui/navigation
// but it led to a bug probably linked to circular dependencies, which was hard to solve
const StyledLink = styled(Link)`
  text-decoration: none;
`;

export const AvatarChip = ({
  name,
  avatarUrl,
  avatarType = 'rounded',
  variant: propsVariant = AvatarChipVariant.Regular,
  LeftIcon,
  LeftIconColor,
  isIconInverted = false,
  className,
  placeholderColorSeed,
  onClick,
  to,
  size = ChipSize.Small,
  maxWidth,
}: AvatarChipProps) => {
  const { theme } = useContext(ThemeContext);

  const isClickable = isDefined(onClick) || isDefined(to);
  // TODO refactor
  const getVariant = () => {
    if (!isClickable) {
      return ChipVariant.Transparent;
    }
    /// Hard to understand
    if (propsVariant === AvatarChipVariant.Regular) {
      //Regular but Highlighted -> missleading
      return ChipVariant.Highlighted;
    }

    return ChipVariant.Regular;
    ///
  };

  const avatarChip = (
    <Chip
      label={name}
      variant={getVariant()}
      size={size}
      leftComponent={() => {
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
                size={theme.icon.size.sm}
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
      }}
      clickable={isClickable}
      // TODO Ugh DX weird
      onClick={(event) => {
        if (isDefined(to) || !isDefined(onClick)) {
          return undefined;
        }

        return onClick(event);
      }}
      className={className}
      maxWidth={maxWidth}
    />
  );

  if (!isDefined(to)) {
    return avatarChip;
  }

  return (
    // TODO use unDecoratedLink
    // Could on click be on chip ? redirection intercepts it ?
    <StyledLink to={to} onClick={onClick}>
      {avatarChip}
    </StyledLink>
  );
};
