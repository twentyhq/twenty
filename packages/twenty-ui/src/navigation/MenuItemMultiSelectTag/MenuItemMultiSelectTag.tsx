import { Tag } from '@ui/data-display';
import { type IconComponent } from '@ui/icon';
import { type ThemeColor } from '@ui/theme';
import { MenuItemMultiSelectCheckbox } from '@ui/navigation/MenuItem/parts/MenuItemMultiSelectCheckbox';
import {
  StyledMenuItemBase,
  StyledMenuItemLeftContent,
} from '@ui/navigation/MenuItem/parts/StyledMenuItemBase';

type MenuItemMultiSelectTagProps = {
  selected: boolean;
  className?: string;
  isKeySelected?: boolean;
  onClick?: () => void;
  color: ThemeColor | 'transparent';
  text: string;
  Icon?: IconComponent;
};

export const MenuItemMultiSelectTag = ({
  color,
  selected,
  className,
  onClick,
  isKeySelected,
  text,
  Icon,
}: MenuItemMultiSelectTagProps) => {
  return (
    <StyledMenuItemBase
      isKeySelected={isKeySelected}
      onClick={onClick}
      className={className}
    >
      <StyledMenuItemLeftContent>
        <MenuItemMultiSelectCheckbox
          selected={selected}
          onSelectChange={() => onClick?.()}
          ariaLabel={text}
        />
        <Tag color={color} text={text} Icon={Icon} />
      </StyledMenuItemLeftContent>
    </StyledMenuItemBase>
  );
};
