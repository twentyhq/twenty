import styled from '@emotion/styled';
import { Avatar, AvatarType, IconComponent } from '@ui/display';
import { ChipSize, ChipVariant } from '@ui/display/chip/components/Chip';
import { ThemeContext } from '@ui/theme';
import { ReactNode, useContext } from 'react';
import { isDefined } from 'twenty-shared';
import { Nullable } from 'vitest';

export enum AvatarChipVariant {
  Regular = 'regular',
  Transparent = 'transparent',
}

export type AvatarChipsCommonProps = {
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
  clickable?: boolean;
  maxWidth?: number;
};

const StyledInvertedIconContainer = styled.div<{ backgroundColor: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 4px;
  background-color: ${({ backgroundColor }) => backgroundColor};
`;

export const useGetAvatarChipLeftComponentAndVariant = ({
  name,
  clickable,
  LeftIcon,
  LeftIconColor,
  avatarType,
  avatarUrl,
  isIconInverted = false,
  placeholderColorSeed,
  variant: propsVariant,
}: AvatarChipsCommonProps) => {
  const { theme } = useContext(ThemeContext);

  const getVariant = () => {
    if (!clickable) {
      return ChipVariant.Transparent;
    }
    if (propsVariant === AvatarChipVariant.Regular) {
      return ChipVariant.Highlighted;
    }

    return ChipVariant.Regular;
  };

  const getLeftComponent = (): ReactNode => {
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

  return {
    getLeftComponent,
    variant: getVariant(),
  };
};
