import { useTheme } from '@emotion/react';

import { IconChevronRight, IconComponent } from 'src/display';
import { MenuItemLeftContent } from 'src/navigation/menu-item/components/MenuItemLeftContent';
import {
  StyledMenuItemBase,
  StyledMenuItemLeftContent,
} from 'src/navigation/menu-item/components/StyledMenuItemBase';

export type MenuItemNavigateProps = {
  LeftIcon?: IconComponent;
  text: string;
  onClick?: () => void;
  className?: string;
};

export const MenuItemNavigate = ({
  LeftIcon,
  text,
  className,
  onClick,
}: MenuItemNavigateProps) => {
  const theme = useTheme();

  return (
    <StyledMenuItemBase onClick={onClick} className={className}>
      <StyledMenuItemLeftContent>
        <MenuItemLeftContent LeftIcon={LeftIcon} text={text} />
      </StyledMenuItemLeftContent>
      <IconChevronRight size={theme.icon.size.sm} />
    </StyledMenuItemBase>
  );
};
