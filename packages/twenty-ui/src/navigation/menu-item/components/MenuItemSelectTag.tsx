import { useTheme } from '@emotion/react';

import { StyledMenuItemLeftContent } from '../internals/components/StyledMenuItemBase';

import { IconCheck, IconComponent, Tag } from '@ui/display';
import { ThemeColor } from '@ui/theme';
import { StyledMenuItemSelect } from './MenuItemSelect';

type MenuItemSelectTagProps = {
  selected: boolean;
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
  isKeySelected,
  className,
  onClick,
  text,
  variant = 'solid',
  LeftIcon,
}: MenuItemSelectTagProps) => {
  const theme = useTheme();
  return (
    <StyledMenuItemSelect
      onClick={onClick}
      className={className}
      selected={selected}
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
      {selected && <IconCheck size={theme.icon.size.sm} />}
    </StyledMenuItemSelect>
  );
};
