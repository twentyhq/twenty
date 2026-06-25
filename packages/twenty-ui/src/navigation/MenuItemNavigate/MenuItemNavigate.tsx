import { IconChevronRight, type IconComponent } from '@ui/icon';
import { useTheme } from '@ui/theme-constants';
import { MenuItemLeftContent } from '@ui/navigation/MenuItem/parts/MenuItemLeftContent';
import {
  StyledMenuItemBase,
  StyledMenuItemLeftContent,
} from '@ui/navigation/MenuItem/parts/StyledMenuItemBase';

export type MenuItemNavigateProps = {
  LeftIcon?: IconComponent;
  withIconContainer?: boolean;
  text: string;
  onClick?: () => void;
  className?: string;
};

export const MenuItemNavigate = ({
  LeftIcon,
  withIconContainer = false,
  text,
  className,
  onClick,
}: MenuItemNavigateProps) => {
  const theme = useTheme();

  return (
    <StyledMenuItemBase onClick={onClick} className={className}>
      <StyledMenuItemLeftContent>
        <MenuItemLeftContent
          LeftIcon={LeftIcon}
          text={text}
          withIconContainer={withIconContainer}
        />
      </StyledMenuItemLeftContent>
      <IconChevronRight
        size={theme.icon.size.sm}
        color={theme.font.color.tertiary}
      />
    </StyledMenuItemBase>
  );
};
