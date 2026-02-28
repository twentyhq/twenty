import { Tag } from '@ui/components';
import { type IconComponent } from '@ui/display';
import { Checkbox, CheckboxShape, CheckboxSize } from '@ui/input';
import { type ThemeColor, ThemeContext } from '@ui/theme';
import { useContext } from 'react';
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
  const { theme } = useContext(ThemeContext);

  return (
    <StyledMenuItemBase
      isKeySelected={isKeySelected}
      onClick={onClick}
      className={className}
      theme={theme}
    >
      <StyledMenuItemLeftContent theme={theme}>
        <Checkbox
          size={CheckboxSize.Small}
          shape={CheckboxShape.Squared}
          checked={selected}
        />
        <Tag color={color} text={text} Icon={Icon} />
      </StyledMenuItemLeftContent>
    </StyledMenuItemBase>
  );
};
