import {
  StyledMenuItemIconCheck,
  StyledMenuItemLeftContent,
} from '@ui/navigation/MenuItem/parts/StyledMenuItemBase';

import { Tag } from '@ui/data-display';
import { type IconComponent } from '@ui/icon';
import { type ThemeColor } from '@ui/theme';
import { useTheme } from '@ui/theme-constants';
import { StyledMenuItemSelect } from '@ui/navigation/MenuItemSelect/MenuItemSelect';

type MenuItemSelectTagProps = {
  selected?: boolean;
  focused?: boolean;
  isKeySelected?: boolean;
  className?: string;
  onClick?: () => void;
  color: ThemeColor | 'transparent';
  text: string;
  variant?: 'soft' | 'outline';
  LeftIcon?: IconComponent | null;
};

export const MenuItemSelectTag = ({
  color,
  selected,
  focused,
  isKeySelected,
  className,
  onClick,
  text,
  variant = 'soft',
  LeftIcon,
}: MenuItemSelectTagProps) => {
  const theme = useTheme();

  return (
    <StyledMenuItemSelect
      onClick={onClick}
      className={className}
      focused={focused}
      isKeySelected={isKeySelected}
    >
      <StyledMenuItemLeftContent>
        <Tag
          borderStyle="dashed"
          variant={variant}
          color={color}
          startIcon={LeftIcon ? <LeftIcon /> : undefined}
        >
          {text}
        </Tag>
      </StyledMenuItemLeftContent>
      {selected && <StyledMenuItemIconCheck size={theme.icon.size.md} />}
    </StyledMenuItemSelect>
  );
};
