import styled from '@emotion/styled';
import { type ReactNode } from 'react';

import { OverflowingTextWithTooltip } from '@ui/display';
import { Checkbox } from '@ui/input/components/Checkbox';
import {
  StyledMenuItemBase,
  StyledMenuItemLabel,
  StyledMenuItemLabelLight,
  StyledMenuItemLeftContent,
} from '../internals/components/StyledMenuItemBase';

const StyledLeftContentWithCheckboxContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledTextContainer = styled.div`
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
  const handleOnClick = () => {
    onSelectChange?.(!selected);
  };

  return (
    <StyledMenuItemBase
      className={className}
      onClick={handleOnClick}
      isKeySelected={isKeySelected}
    >
      <StyledLeftContentWithCheckboxContainer>
        <Checkbox checked={selected} />
        <StyledMenuItemLeftContent>
          {avatar}
          <StyledTextContainer>
            <StyledMenuItemLabel>
              <OverflowingTextWithTooltip text={text} />
            </StyledMenuItemLabel>
            {contextualText && (
              <>
                <StyledMenuItemLabelLight>·</StyledMenuItemLabelLight>
                <StyledMenuItemLabelLight>
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
