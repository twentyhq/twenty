import {
  StyledMenuItemIconCheck,
  StyledMenuItemLeftContent,
} from '@ui/components/MenuItem/parts/StyledMenuItemBase';

import { StyledMenuItemSelect } from '@ui/components/MenuItemSelect/internal/StyledMenuItemSelect';
import { type IconComponent } from '@ui/icon';
import { Tag } from '@ui/primitives/data-display/Tag/Tag';
import { type ThemeColor } from '@ui/theme';
import { useTheme } from '@ui/theme-constants';
import { isDefined } from '@ui/utilities/utils/isDefined';

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
      role="option"
      aria-selected={selected ?? false}
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
          startIcon={isDefined(LeftIcon) ? <LeftIcon /> : undefined}
        >
          {text}
        </Tag>
      </StyledMenuItemLeftContent>
      {selected && <StyledMenuItemIconCheck size={theme.icon.size.md} />}
    </StyledMenuItemSelect>
  );
};
