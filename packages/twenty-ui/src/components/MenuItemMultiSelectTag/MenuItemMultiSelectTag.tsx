import { MenuItemMultiSelectCheckbox } from '@ui/components/MenuItem/parts/MenuItemMultiSelectCheckbox';
import {
  StyledMenuItemBase,
  StyledMenuItemLeftContent,
} from '@ui/components/MenuItem/parts/StyledMenuItemBase';
import { type IconComponent } from '@ui/icon';
import { Tag } from '@ui/primitives/data-display/Tag/Tag';
import { type ThemeColor } from '@ui/theme';
import { isDefined } from '@ui/utilities/utils/isDefined';

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
        <Tag color={color} startIcon={isDefined(Icon) ? <Icon /> : undefined}>
          {text}
        </Tag>
      </StyledMenuItemLeftContent>
    </StyledMenuItemBase>
  );
};
