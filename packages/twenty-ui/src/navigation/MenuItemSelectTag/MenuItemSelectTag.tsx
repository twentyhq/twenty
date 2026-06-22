import {
  StyledMenuItemIconCheck,
  StyledMenuItemLeftContent,
} from '@ui/navigation/MenuItem/parts/StyledMenuItemBase';

import { Tag } from '@ui/data-display';
import { type IconComponent } from '@ui/icon';
import { type ThemeColor } from '@ui/theme';
import { ThemeContext } from '@ui/theme-constants';
import { useContext } from 'react';
import { StyledMenuItemSelect } from '@ui/navigation/MenuItemSelect/MenuItemSelect';

type MenuItemSelectTagProps = {
  selected?: boolean;
  focused?: boolean;
  isKeySelected?: boolean;
  className?: string;
  onClick?: () => void;
  color: ThemeColor | 'transparent';
  text: string;
  variant?: 'solid' | 'outline';
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
  variant = 'solid',
  LeftIcon,
}: MenuItemSelectTagProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledMenuItemSelect
      onClick={onClick}
      className={className}
      focused={focused}
      isKeySelected={isKeySelected}
    >
      <StyledMenuItemLeftContent>
        <Tag
          variant={variant}
          color={color}
          text={text}
          Icon={LeftIcon ?? undefined}
        />
      </StyledMenuItemLeftContent>
      {selected && <StyledMenuItemIconCheck size={theme.icon.size.md} />}
    </StyledMenuItemSelect>
  );
};
