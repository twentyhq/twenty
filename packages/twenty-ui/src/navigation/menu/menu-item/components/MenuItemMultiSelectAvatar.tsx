import { styled } from '@linaria/react';
import { type ReactNode, useContext } from 'react';

import { OverflowingTextWithTooltip } from '@ui/display';
import { Checkbox } from '@ui/input/components/Checkbox';
import { ThemeContext, type ThemeType } from '@ui/theme';
import {
  StyledMenuItemBase,
  StyledMenuItemLabel,
  StyledMenuItemLabelLight,
  StyledMenuItemLeftContent,
} from '../internals/components/StyledMenuItemBase';

const StyledLeftContentWithCheckboxContainer = styled.div<{
  theme: ThemeType;
}>`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledTextContainer = styled.div<{ theme: ThemeType }>`
  display: flex;
  align-items: center;
  flex: 1 0 0;
  gap: ${({ theme }) => theme.spacing(1)};
  max-width: 100%;
  text-overflow: ellipsis;
  overflow: hidden;
`;

type MenuItemMultiSelectAvatarProps = {
  avatar?: ReactNode;
  selected: boolean;
  isKeySelected?: boolean;
  text?: string;
  contextualText?: string;
  className?: string;
  onSelectChange?: (selected: boolean) => void;
};

export const MenuItemMultiSelectAvatar = ({
  avatar,
  text,
  selected,
  contextualText,
  className,
  isKeySelected,
  onSelectChange,
}: MenuItemMultiSelectAvatarProps) => {
  const { theme } = useContext(ThemeContext);

  const handleOnClick = () => {
    onSelectChange?.(!selected);
  };

  return (
    <StyledMenuItemBase
      theme={theme}
      className={className}
      onClick={handleOnClick}
      isKeySelected={isKeySelected}
    >
      <StyledLeftContentWithCheckboxContainer theme={theme}>
        <Checkbox checked={selected} />
        <StyledMenuItemLeftContent theme={theme}>
          {avatar}
          <StyledTextContainer theme={theme}>
            <StyledMenuItemLabel theme={theme}>
              <OverflowingTextWithTooltip text={text} />
            </StyledMenuItemLabel>
            {contextualText && (
              <>
                <StyledMenuItemLabelLight theme={theme}>
                  ·
                </StyledMenuItemLabelLight>
                <StyledMenuItemLabelLight theme={theme}>
                  <OverflowingTextWithTooltip text={contextualText} />
                </StyledMenuItemLabelLight>
              </>
            )}
          </StyledTextContainer>
        </StyledMenuItemLeftContent>
      </StyledLeftContentWithCheckboxContainer>
    </StyledMenuItemBase>
  );
};
