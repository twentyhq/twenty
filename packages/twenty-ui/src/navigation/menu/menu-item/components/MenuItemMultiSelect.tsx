import styled from '@emotion/styled';

import { Tag } from '@ui/components';
import { type IconComponent } from '@ui/display';
import { Checkbox } from '@ui/input/components/Checkbox';
import { MenuItemLeftContent } from '@ui/navigation/menu/menu-item/internals/components/MenuItemLeftContent';
import { type ThemeColor } from '@ui/theme';
import { StyledMenuItemBase } from '../internals/components/StyledMenuItemBase';

const StyledLeftContentWithCheckboxContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
`;

type MenuItemMultiSelectProps = {
  color?: ThemeColor;
  LeftIcon?: IconComponent;
  selected: boolean;
  isKeySelected?: boolean;
  withIconContainer?: boolean;
  text: string;
  className: string;
  onSelectChange?: (selected: boolean) => void;
};

export const MenuItemMultiSelect = ({
  color,
  LeftIcon,
  withIconContainer = false,
  text,
  selected,
  isKeySelected,
  className,
  onSelectChange,
}: MenuItemMultiSelectProps) => {
  const handleOnClick = () => {
    onSelectChange?.(!selected);
  };

  return (
    <StyledMenuItemBase
      isKeySelected={isKeySelected}
      className={className}
      onClick={handleOnClick}
    >
      <StyledLeftContentWithCheckboxContainer>
        <Checkbox checked={selected} />
        {color ? (
          <Tag color={color} text={text} Icon={LeftIcon} />
        ) : (
          <MenuItemLeftContent
            LeftIcon={LeftIcon}
            text={text}
            withIconContainer={withIconContainer}
          />
        )}
      </StyledLeftContentWithCheckboxContainer>
    </StyledMenuItemBase>
  );
};
