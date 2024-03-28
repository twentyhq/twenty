import styled from '@emotion/styled';

import { IconComponent, Tag } from 'src/display';
import { Checkbox } from 'src/input/components/Checkbox';
import { MenuItemLeftContent } from 'src/navigation/menu-item/components/MenuItemLeftContent';
import { StyledMenuItemBase } from 'src/navigation/menu-item/components/StyledMenuItemBase';
import { ThemeColor } from 'src/theme/constants/MainColorNames';

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
  text: string;
  className: string;
  onSelectChange?: (selected: boolean) => void;
};

export const MenuItemMultiSelect = ({
  color,
  LeftIcon,
  text,
  selected,
  className,
  onSelectChange,
}: MenuItemMultiSelectProps) => {
  const handleOnClick = () => {
    onSelectChange?.(!selected);
  };

  return (
    <StyledMenuItemBase className={className} onClick={handleOnClick}>
      <StyledLeftContentWithCheckboxContainer>
        <Checkbox checked={selected} />
        {color ? (
          <Tag color={color} text={text} Icon={LeftIcon} />
        ) : (
          <MenuItemLeftContent LeftIcon={LeftIcon} text={text} />
        )}
      </StyledLeftContentWithCheckboxContainer>
    </StyledMenuItemBase>
  );
};
