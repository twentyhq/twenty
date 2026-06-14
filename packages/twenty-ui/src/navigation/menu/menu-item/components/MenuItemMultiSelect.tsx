import { Tag } from '@ui/components';
import { type IconComponent } from '@ui/display';
import { Checkbox } from '@ui/input/components/Checkbox';
import { MenuItemLeftContent } from '@ui/navigation/menu/menu-item/internals/components/MenuItemLeftContent';
import { type ThemeColor } from '@ui/theme';
import { StyledMenuItemBase } from '../internals/components/StyledMenuItemBase';

import styles from './MenuItemMultiSelect.module.scss';

type MenuItemMultiSelectProps = {
  color?: ThemeColor;
  LeftIcon?: IconComponent;
  iconThemeColor?: ThemeColor | null;
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
  iconThemeColor,
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
      <div className={styles.leftContentWithCheckboxContainer}>
        <Checkbox checked={selected} />
        {color ? (
          <Tag color={color} text={text} Icon={LeftIcon} />
        ) : (
          <MenuItemLeftContent
            LeftIcon={LeftIcon}
            iconThemeColor={iconThemeColor}
            text={text}
            withIconContainer={withIconContainer}
          />
        )}
      </div>
    </StyledMenuItemBase>
  );
};
