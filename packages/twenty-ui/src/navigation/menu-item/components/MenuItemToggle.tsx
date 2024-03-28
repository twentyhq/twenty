import { IconComponent } from 'src/display';
import { Toggle, ToggleSize } from 'src/input/components/Toggle';
import { MenuItemLeftContent } from 'src/navigation/menu-item/components/MenuItemLeftContent';
import {
  StyledMenuItemBase,
  StyledMenuItemRightContent,
} from 'src/navigation/menu-item/components/StyledMenuItemBase';

type MenuItemToggleProps = {
  LeftIcon?: IconComponent;
  toggled: boolean;
  text: string;
  className?: string;
  onToggleChange?: (toggled: boolean) => void;
  toggleSize?: ToggleSize;
};

export const MenuItemToggle = ({
  LeftIcon,
  text,
  toggled,
  className,
  onToggleChange,
  toggleSize,
}: MenuItemToggleProps) => {
  const handleOnClick = () => {
    onToggleChange?.(!toggled);
  };

  return (
    <StyledMenuItemBase className={className} onClick={handleOnClick}>
      <MenuItemLeftContent LeftIcon={LeftIcon} text={text} />
      <StyledMenuItemRightContent>
        <Toggle
          value={toggled}
          onChange={onToggleChange}
          toggleSize={toggleSize}
        />
      </StyledMenuItemRightContent>
    </StyledMenuItemBase>
  );
};
