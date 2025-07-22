import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Avatar } from '@ui/display/avatar/components/Avatar';
import { isDefined } from 'twenty-shared/utils';
import { AvatarChipCommonProps } from '@ui/components/avatar-chip/types/AvatarChipCommonPropsType';

type AvatarChipProps = AvatarChipCommonProps & {
  IconBackgroundColor?: string;
  isIconInverted?: boolean;
  divider?: 'right' | 'left';
  onClick?: () => void;
};

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

const StyledAvatarChipWrapper = styled.div<{
  isClickable: boolean;
  divider: AvatarChipProps['divider'];
  theme: any;
}>`
  ${({ divider, theme }) => {
    const borderStyle = (side: 'left' | 'right') =>
      `border-${side}: 1px solid ${theme.border.color.light};`;
    return divider ? borderStyle(divider) : '';
  }}

  cursor: ${({ isClickable }) => (isClickable ? 'pointer' : 'inherit')};
  display: flex;
`;

export const AvatarChip = ({
  Icon,
  placeholderColorSeed,
  avatarType,
  avatarUrl,
  placeholder,
  isIconInverted = false,
  IconColor,
  IconBackgroundColor,
  onClick,
  divider,
}: AvatarChipProps) => {
  const theme = useTheme();
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
      <StyledAvatarChipWrapper
        isClickable={isClickable}
        divider={divider}
        theme={theme}
        onClick={onClick}
      >
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
      </StyledAvatarChipWrapper>
    );
  }

  return (
    <StyledAvatarChipWrapper
      isClickable={isClickable}
      divider={divider}
      theme={theme}
      onClick={onClick}
    >
      <Icon
        size={theme.icon.size.sm}
        stroke={theme.icon.stroke.sm}
        color={IconColor || 'currentColor'}
      />
    </StyledAvatarChipWrapper>
  );
};
