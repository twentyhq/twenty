import { IconComponent } from '@ui/display/icon/types/IconComponent';
import { Tag } from '@ui/display/tag/components/Tag';
import { Checkbox, CheckboxShape, CheckboxSize } from '@ui/input/components/Checkbox';
import { ThemeColor } from '@ui/theme';
import {
  StyledMenuItemBase,
  StyledMenuItemLeftContent,
} from '../internals/components/StyledMenuItemBase';

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
      <Checkbox
        size={CheckboxSize.Small}
        shape={CheckboxShape.Squared}
        checked={selected}
      />
      <StyledMenuItemLeftContent>
        <Tag color={color} text={text} Icon={Icon} />
      </StyledMenuItemLeftContent>
    </StyledMenuItemBase>
  );
};
