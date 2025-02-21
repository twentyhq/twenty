import { styled } from '@linaria/react';
import { Avatar } from '@ui/display/avatar/components/Avatar';
import { AvatarType } from '@ui/display/avatar/types/AvatarType';
import { Chip, ChipSize, ChipVariant } from '@ui/display/chip/components/Chip';
import { IconComponent } from '@ui/display/icon/types/IconComponent';
import { ThemeContext } from '@ui/theme';
import { Nullable } from '@ui/utilities/types/Nullable';
import { MouseEvent, useContext } from 'react';
import { isDefined } from 'twenty-shared';

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
  clickable?: boolean;
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

export const AvatarChip = ({
  name,
  avatarUrl,
  LeftIcon,
  LeftIconColor,
  className,
  placeholderColorSeed,
  onClick,
  maxWidth,
  avatarType = 'rounded',
  variant: propsVariant = AvatarChipVariant.Regular,
  isIconInverted = false,
  size = ChipSize.Small,
  clickable = isDefined(onClick),
}: AvatarChipProps) => {
  const { theme } = useContext(ThemeContext);

  // TODO refactor
  const getVariant = () => {
    if (!clickable) {
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

  return (
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
      clickable={clickable}
      onClick={onClick}
      className={className}
      maxWidth={maxWidth}
    />
  );
};
