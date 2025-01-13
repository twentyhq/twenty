import styled from '@emotion/styled';
import { ReactNode } from 'react';

import { OverflowingTextWithTooltip } from '@ui/display';
import { Checkbox } from '@ui/input/components/Checkbox';
import {
  StyledMenuItemBase,
  StyledMenuItemLabel,
  StyledMenuItemLeftContent,
} from '../internals/components/StyledMenuItemBase';

const StyledLeftContentWithCheckboxContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

type MenuItemMultiSelectAvatarProps = {
  avatar?: ReactNode;
  selected: boolean;
  isKeySelected?: boolean;
  text?: string;
  className?: string;
  onSelectChange?: (selected: boolean) => void;
};

export const MenuItemMultiSelectAvatar = ({
  avatar,
  text,
  selected,
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
          <StyledMenuItemLabel>
            <OverflowingTextWithTooltip text={text} />
          </StyledMenuItemLabel>
        </StyledMenuItemLeftContent>
      </StyledLeftContentWithCheckboxContainer>
    </StyledMenuItemBase>
  );
};
